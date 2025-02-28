import { Global, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Pengguna } from './entity/pengguna.entity';
import Item from './entity/item.entity';
import Struk from './entity/struk.entity';
import PenggunaModule from './pengguna/pengguna.module';
import { ConfigModule } from '@nestjs/config';
import AuthModule from './auth/auth.module';
import StrukModule from './struk/struk.module';
import GeminiModule from './gemini/gemini.module';
import ItemModule from './item/item.module';
import Charge from './entity/charge.entity';
import Log from './entity/log.entity';

@Module({
    imports: [
        ConfigModule.forRoot({
            envFilePath: ['.env.dev', '.env.production']
        }),
        TypeOrmModule.forRoot({
            type: 'postgres',
            host: process.env.PG_HOST,
            database: process.env.PG_DATABASE,
            username: process.env.PG_USERNAME,
            password: process.env.PG_PASSWORD,
            entities: [Pengguna, Struk, Item, Charge, Log],
            synchronize: true,
            logging: process.env.PRODUCTION ? ['error'] : 'all',
        }),
        PenggunaModule,
        AuthModule,
        StrukModule,
        GeminiModule,
        ItemModule,
    ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {}
