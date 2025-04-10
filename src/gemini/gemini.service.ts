import {
    BadRequestException,
    Inject,
    Injectable,
    InternalServerErrorException,
} from '@nestjs/common';
import { GenerativeModel, GoogleGenerativeAI } from '@google/generative-ai';
import { LLMResponseOCR } from 'src/interface/GeminiOcr.interface';
import ItemService from 'src/item/item.service';
import Item from 'src/entity/item.entity';
import Charge from 'src/entity/charge.entity';

@Injectable()
export class GeminiService {
    private model: GenerativeModel;
    private visionPrompt: string;
    private wordsPrompt: (words: string) => string;
    constructor(
        @Inject('GEN_AI') private genAi: GoogleGenerativeAI,
        private itemService: ItemService,
    ) {
        this.model = genAi.getGenerativeModel({ model: 'gemini-1.5-flash' });
        this.visionPrompt = `extract the order items and the charges from this receipt into
        {items: order items, charges: charges}
        each items has format {name: item name, count: item count, price: item unit price}
        charge has field {tax_charge, service_charge, other_charge, discount_charge)
        `;
        this.wordsPrompt = (words: string) => {
            return `#rules
            the currency is IDR
            #prompt
            make a json receipt from this list of words which has two fields: items and charge. items is a list of objects with name, count, and price fields. charge is an object with tax_charge, service_charge, other_charge, discount_charge field. do not add other field and and comment and you should return json 
            word list = ${words}
            `;
        };
    }

    private extractJsonFromTags(content: string) {
        const splitted = content.split('```json')[1].split('```')[0];
        return splitted;
    }

    async promptUsingWords(chunk: Buffer, mimeType: string) {
        const imageBlob = new Blob([chunk], { type: mimeType });
        const fd = new FormData();
        fd.append('img', imageBlob);
        const ocrRes = await fetch('http://127.0.0.1:8000/word-ocr', {
            method: 'POST',
            body: fd,
        });
        if (ocrRes.ok) {
            const words = (await ocrRes.text()) as string;
            const textInput = this.wordsPrompt(words);
            const startTime = new Date().getTime();
            const geminiRes = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/tunedModels/geminifinetuningdatasetsv2-jn2dqekxagvx:generateContent?key=${process.env.GEMINI_API_KEY}`,
                {
                    method: 'POST',
                    body: JSON.stringify({
                        contents: [
                            {
                                parts: [
                                    {
                                        text: textInput,
                                    },
                                ],
                            },
                        ],
                    }),
                },
            );
            if (geminiRes.ok) {
                const resJson = await geminiRes.json();
                const totalToken = resJson.usageMetadata.totalTokenCount;
                const resultRawJson =
                    resJson.candidates[0].content.parts[0].text;
                try {
                    const result = JSON.parse(
                        this.extractJsonFromTags(resultRawJson),
                    ) as LLMResponseOCR;
                    const { items, charge } =
                        await this.parseResponseLlm(result);
                    const endTime = new Date().getTime();
                    return {
                        items,
                        charge,
                        totalToken,
                        time: endTime - startTime,
                    };
                } catch (err) {
                    throw new InternalServerErrorException(
                        'failed on extract json >>',
                        err.message,
                    );
                }
            } else {
                throw new InternalServerErrorException(
                    'failed to use fine tuned models',
                );
            }
        } else {
            throw new InternalServerErrorException(
                'failed to fetch image words',
            );
        }
    }

    async promptUsingImage(imageBase64: string, mimeType: string) {
        const image = {
            inlineData: {
                data: imageBase64,
                mimeType: mimeType,
            },
        };
        const modelInput = [this.visionPrompt, image];
        const startTime = new Date().getTime();
        const resultContent = await this.model.generateContent(modelInput);
        const outputToken =
            resultContent.response.usageMetadata.totalTokenCount;
        const totalToken = outputToken;
        const result = JSON.parse(
            this.extractJsonFromTags(resultContent.response.text()),
        );
        if (!result) throw new BadRequestException('invalid response');
        try {
            const { items, charge } = await this.parseResponseLlm(result);
            const endTime = new Date().getTime();
            return { items, charge, totalToken, time: endTime - startTime };
        } catch (err) {
            throw new InternalServerErrorException('failed to parse json');
        }
    }

    async parseResponseLlm(result: LLMResponseOCR) {
        const items: Item[] = [];
        for (const item of result.items) {
            const newItem = await this.itemService.parseLLM(item);
            if (newItem) {
                items.push(newItem);
            }
        }
        const resCharge = result.charge ? result.charge : result.charges;
        const charge = new Charge();
        charge.service_charge = this.convertPrice(resCharge.service_charge);
        charge.tax_charge = this.convertPrice(resCharge.tax_charge);
        charge.discount_charge = this.convertPrice(resCharge.discount_charge);
        charge.other_charge = this.convertPrice(resCharge.other_charge);
        return { items, charge };
    }

    private convertPrice(price: number | null) {
        if (!price) return 0;
        let strPrice = price.toString();
        strPrice = strPrice.replace('.', '');
        return parseInt(strPrice);
    }
}
