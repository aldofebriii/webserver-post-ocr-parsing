import { Module } from "@nestjs/common";
import AuthService from "./auth.service";
import PenggunaModule from "src/pengguna/pengguna.module";
import AuthController from "./auth.controller";

@Module({
    imports: [PenggunaModule],
    controllers: [AuthController],
    providers: [AuthService],
    exports: [AuthService]
})
export default class AuthModule {};