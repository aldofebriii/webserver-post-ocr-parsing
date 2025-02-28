import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import Item from 'src/entity/item.entity';
import ItemService from './item.service';

@Module({
    controllers: [],
    imports: [TypeOrmModule.forFeature([Item])],
    providers: [ItemService],
    exports: [ItemService],
})
export default class ItemModule {}
