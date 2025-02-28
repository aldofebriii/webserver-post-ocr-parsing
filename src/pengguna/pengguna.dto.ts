import { Expose } from "class-transformer";
import { IsEmail, IsStrongPassword, MinLength } from "class-validator";

export class PenggunaDto {
    @MinLength(4)
    username: string;

    @IsEmail()
    email: string;

    @MinLength(8)
    password: string
}

export class PenggunaResponse {
    @Expose()
    username: string;
    @Expose()
    email: string;
    @Expose()
    createdAt: string;
}