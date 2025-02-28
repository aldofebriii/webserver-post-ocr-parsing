import { ArgumentMetadata, BadRequestException, Injectable, PipeTransform } from "@nestjs/common";
import { MAX_IMAGE_SIZED } from "src/util/consts.util";

@Injectable()
export class ImageValidationPipe implements PipeTransform {
    transform(value: Express.Multer.File, metadata: ArgumentMetadata) {
        if (!value) throw new BadRequestException("gambar struk required")
        if (value.size > MAX_IMAGE_SIZED) throw new BadRequestException("gambar maksimal adalah 10Mb")
        return value;
    }
}