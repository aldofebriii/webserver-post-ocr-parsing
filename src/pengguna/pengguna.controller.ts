import { Body, Controller, Post, UseInterceptors } from "@nestjs/common";
import PenggunaService from "./pengguna.service";
import { PenggunaDto, PenggunaResponse } from "./pengguna.dto";
import { SerializeInterceptor } from "src/interceptor/serialize.interceptor";

@UseInterceptors(new SerializeInterceptor(PenggunaResponse))
@Controller("pengguna")
export default class PenggunaController {
    constructor(private penggunaService: PenggunaService) {}

    @Post('/')
    async createPengguna(@Body() penggunaDto: PenggunaDto) {
        return this.penggunaService.createOrEdit(penggunaDto);
    };
}
