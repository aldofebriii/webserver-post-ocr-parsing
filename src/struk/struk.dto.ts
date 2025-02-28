import { Expose, Type } from 'class-transformer';
import { IsNumber, IsObject, IsOptional, IsString, MinLength } from 'class-validator';
import { PenggunaResponse } from 'src/pengguna/pengguna.dto';

export class StrukDto {
    @MinLength(8)
    name: string;

    @MinLength(4)
    @IsOptional()
    location: string;
}

export class StrukResponse {
    @Expose()
    id: number;

    @Expose()
    imageRef: string;

    @Expose()
    @Type(() => PenggunaResponse)
    pengguna: PenggunaResponse;
}

export class ItemDto {
    @IsString()
    name: string;
    @IsNumber()
    count: number;
    @IsNumber()
    price: number;
}

export class ChargeDto {
    @IsNumber()
    service_charge: number;
    @IsNumber()
    tax_charge: number;
    @IsNumber()
    discount_charge: number;
    @IsNumber()
    other_charge: number;
}

export class AllModelExpectedDto {
    @IsObject()
    expected: {
        items: ItemDto[],
        charge: ChargeDto
    };
}