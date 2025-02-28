import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Pengguna } from 'src/entity/pengguna.entity';
import PenggunaService from './pengguna.service';
import PenggunaController from './pengguna.controller';

@Module({
    controllers: [PenggunaController],
    imports: [TypeOrmModule.forFeature([Pengguna])],
    providers: [PenggunaService],
    exports: [PenggunaService],
})
export default class PenggunaModule {}
