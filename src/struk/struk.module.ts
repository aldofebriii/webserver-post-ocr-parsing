import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import Struk from 'src/entity/struk.entity';
import { StrukController } from './struk.controller';
import StrukService from './struk.service';
import FirebaseCloud from 'src/storage/firebase.storage';
import AuthModule from 'src/auth/auth.module';
import ItemModule from 'src/item/item.module';
import GeminiModule from 'src/gemini/gemini.module';
import Log from 'src/entity/log.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Struk, Log]), AuthModule, ItemModule, GeminiModule],
    controllers: [StrukController],
    providers: [StrukService, FirebaseCloud],
})
export default class StrukModule {}
