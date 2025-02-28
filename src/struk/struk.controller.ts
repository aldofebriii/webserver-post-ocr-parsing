import {
    Body,
    Controller,
    Get,
    Param,
    ParseIntPipe,
    Post,
    UploadedFile,
    UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import StrukService from './struk.service';
import { CurrentUserInterceptor } from 'src/interceptor/current-user.interceptor';
import { CurrentUser } from 'src/decorator/current-user.decorator';
import { Pengguna } from 'src/entity/pengguna.entity';
import { SerializeInterceptor } from 'src/interceptor/serialize.interceptor';
import { AllModelExpectedDto, StrukDto, StrukResponse } from './struk.dto';
import { ImageValidationPipe } from 'src/pipe/image-validation.pipe';
import { distance } from 'fastest-levenshtein';
import { SourceData } from 'src/entity/log.entity';

@UseInterceptors(CurrentUserInterceptor)
@Controller('struk')
export class StrukController {
    constructor(private strukService: StrukService) {}
    @Post('/')
    @UseInterceptors(
        FileInterceptor('struk_image', {
            storage: memoryStorage(),
        }),
        new SerializeInterceptor(StrukResponse),
    )
    async createStruk(
        @UploadedFile(new ImageValidationPipe()) file: Express.Multer.File,
        @CurrentUser() pengguna: Pengguna,
        @Body() body: StrukDto,
    ) {
        return this.strukService.create(body, pengguna, file);
    }

    @Get('/ocr/:strukId')
    async ocrStruk(@Param('strukId', ParseIntPipe) strukId: number) {
        const struk = await this.strukService.mustFindById(strukId);
        const buffer = await this.strukService.readBuffer(struk);
        return this.strukService.parsePostOcrResult(buffer, struk);
    }

    @Get('/vision/:strukId')
    async visionStruk(@Param('strukId', ParseIntPipe) strukId: number) {
        const struk = await this.strukService.mustFindById(strukId);
        const imgBuff = await this.strukService.readBuffer(struk);
        return this.strukService.parseVisionResult(imgBuff, struk);
    }

    @Get('/llm/:strukId')
    async llmStruk(@Param('strukId', ParseIntPipe) strukId: number) {
        const struk = await this.strukService.mustFindById(strukId);
        const imgBuff = await this.strukService.readBuffer(struk);
        return this.strukService.parseLlmResult(imgBuff, struk);
    }

    @Post('/all-model/:strukId')
    async allModel(@Param('strukId', ParseIntPipe) strukId: number, @Body() data: AllModelExpectedDto) {
        const struk = await this.strukService.mustFindById(strukId);
        const imgBuff = await this.strukService.readBuffer(struk);
        const expectedJson = JSON.stringify(data.expected)
        const {output: resultOcr, time: ocrTime } = await this.strukService.parsePostOcrResult(
            imgBuff,
            struk,
        );

        const {output: resultLlm, cost: llmCost, time: llmTime } = await this.strukService.parseLlmResult(
            imgBuff,
            struk,
        );

        const {output: resultVision, cost: visionCost, time: visionTime }  = await this.strukService.parseVisionResult(
            imgBuff,
            struk,
        );
        
        const ocrDistance = distance(JSON.stringify(resultOcr), expectedJson);
        const llmDistance = distance(JSON.stringify(resultLlm), expectedJson);
        const visionDistance = distance(JSON.stringify(resultVision), expectedJson);

        const logOcr = await this.strukService.createLog(resultOcr, 0, ocrTime, ocrDistance, data.expected, SourceData.LayoutLMv2, struk);
        const logLlm = await this.strukService.createLog(resultLlm, llmCost, llmTime, llmDistance, data.expected, SourceData.GeminiFineTuning, struk);
        const logVision = await this.strukService.createLog(resultVision, visionCost, visionTime, visionDistance, data.expected, SourceData.GeminiVision, struk);
        return {logOcr, logLlm, logVision}
    } 
}
