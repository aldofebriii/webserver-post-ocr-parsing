import {
    BadRequestException,
    Injectable,
    InternalServerErrorException,
    NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Pengguna } from 'src/entity/pengguna.entity';
import Struk from 'src/entity/struk.entity';
import FirebaseCloud, { COLLECTION } from 'src/storage/firebase.storage';
import { Repository } from 'typeorm';
import { StrukDto } from './struk.dto';
import { PostOcrResponse } from 'src/interface/PostOcr.interface';
import Item from 'src/entity/item.entity';
import ItemService from 'src/item/item.service';
import { GeminiService } from 'src/gemini/gemini.service';
import Charge from 'src/entity/charge.entity';
import Log, { ExtractedData, SourceData } from 'src/entity/log.entity';

@Injectable()
export default class StrukService {
    constructor(
        @InjectRepository(Struk) private strukRepo: Repository<Struk>,
        @InjectRepository(Log) private logRepo: Repository<Log>,
        private firebaseCloud: FirebaseCloud,
        private itemService: ItemService,
        private geminiService: GeminiService,
    ) {}
    async create(
        data: StrukDto,
        pengguna?: Pengguna,
        image?: Express.Multer.File, //Image optional because only create need an image
    ): Promise<Struk> {
        let struk: Struk;
        struk = new Struk();
        if (image) {
            const ref = await this.firebaseCloud.uploadFile(
                COLLECTION.IMAGES,
                image.buffer,
                image.mimetype,
            );
            struk.imageRef = ref;
            struk.mimetype = image.mimetype;
        }
        if (pengguna) {
            struk.pengguna = pengguna;
        }
        struk.name = data.name;
        struk.place = data.location;
        return this.strukRepo.save(struk);
    }

    async mustFindById(id: number): Promise<Struk> {
        const struk = await this.strukRepo.findOneBy({ id });
        if (!struk) throw new NotFoundException('struk tidak ditemukan');
        return struk;
    }

    async readImages(struk: Struk): Promise<Blob> {
        try {
            const chunk = await this.firebaseCloud.getFile(
                COLLECTION.IMAGES,
                struk.imageRef,
            );
            return new Blob([chunk], { type: struk.mimetype });
        } catch (err) {
            throw new InternalServerErrorException(err.message);
        }
    }

    async readBuffer(struk: Struk) {
        try {
            const chunk = await this.firebaseCloud.getFile(
                COLLECTION.IMAGES,
                struk.imageRef,
            );
            return Buffer.from(chunk);
        } catch (err) {
            throw new InternalServerErrorException(err.message);
        }
    }

    async parsePostOcrResult(imgBuff: Buffer, struk: Struk) {
        const imgblob = new Blob([imgBuff], { type: struk.mimetype });
        const formData = new FormData();
        formData.append('img', imgblob);
        const ocrRes = await fetch('http://127.0.0.1:8000/post-ocr', {
            method: 'POST',
            body: formData,
        });
        if (ocrRes.ok) {
            const data = (await ocrRes.json()) as PostOcrResponse;
            const items: Item[] = [];
            for (const ocrItem of data.items) {
                items.push(this.itemService.parsePastOcr(ocrItem));
            }
            const dataCharge = data.charge;
            const charge = new Charge();
            charge.service_charge = dataCharge.service_charge || 0;
            charge.tax_charge = dataCharge.tax_charge || 0;
            charge.discount_charge = dataCharge.discount_charge || 0;
            charge.other_charge = dataCharge.other_charge || 0;
            struk.items = items;
            struk.charge = charge;
            const output = { items: items, charge: charge };
            return { output, time: data.time };
        } else {
            throw new BadRequestException(await ocrRes.json());
        }
    }

    async parseVisionResult(imgBuff: Buffer, struk: Struk) {
        const imgBase64 = imgBuff.toString('base64');
        const { items, charge, totalToken, time } =
            await this.geminiService.promptUsingImage(
                imgBase64,
                struk.mimetype,
            );
        struk.items = items;
        struk.charge = charge;
        const output = { items: items, charge: charge };
        return { output, cost: totalToken, time: time / 1000 };
    }

    async parseLlmResult(imgBuff: Buffer, struk: Struk) {
        const { items, charge, totalToken, time } =
            await this.geminiService.promptUsingWords(imgBuff, struk.mimetype);
        struk.items = items;
        struk.charge = charge;
        const output = { items: items, charge: charge };
        return { output, cost: totalToken, time: time / 1000 };
    }

    async createLog(
        extracted: ExtractedData,
        cost: number,
        time: number,
        distance: number,
        expected: ExtractedData,
        source: SourceData,
        struk: Struk,
    ) {
        const expectedLength = JSON.stringify(expected).length;
        const extractedLength = JSON.stringify(extracted).length;
        const similar =
            1 -
            distance /
                (expectedLength > expectedLength
                    ? expectedLength
                    : extractedLength);
        const log = new Log();
        log.cost = cost;
        log.time = time;
        log.distance = distance;
        log.expected = expected;
        log.extracted = extracted;
        log.source = source;
        log.similar = similar;
        log.struk = struk;
        return this.logRepo.save(log);
    }
}
