import { BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import Item from 'src/entity/item.entity';
import Struk from 'src/entity/struk.entity';
import { ItemResponse } from 'src/interface/GeminiOcr.interface';
import { PostOcrItem, PostOcrItemData } from 'src/interface/PostOcr.interface';
import { Repository } from 'typeorm';

export default class ItemService {
    constructor(@InjectRepository(Item) private itemRepo: Repository<Item>) {}

    private validatePrice(itemData: PostOcrItemData) {
        if ((itemData['menu.price'] === null && itemData['menu.unitprice'] === null)) {
            throw new BadRequestException('invalid parse ocr level two');
        };        
        const harga = itemData['menu.price'] !== null
        ? itemData['menu.price']
        : itemData['menu.unitprice'];
        return harga;
    };

    private validateCnt(itemData: PostOcrItemData) {
        if(itemData['menu.cnt'] === null) throw new BadRequestException('invalid parse ocr level three');
        return itemData['menu.cnt'];
    };

    private validateLevelThreePrice(itemData: PostOcrItemData): void {
        if(itemData['menu.price'] === null && itemData['menu.unitprice'] === null) throw new BadRequestException('invalid parse ocr level three');
    }

    private parseOcrLevelTwo(itemData: PostOcrItemData) {
        const harga = this.validatePrice(itemData);

        const item = new Item();
        item.name = itemData['menu.nm'];
        item.count = 1; //Default jumlah untuk level dua
        item.price = harga;
        return item;
    }

    private parseOcrLevelThree(itemData: PostOcrItemData) {
        let cnt = itemData['menu.cnt'];
        const withCnt = Boolean(cnt);
        let harga = this.validatePrice(itemData);
        let item = new Item();

        if (withCnt) {
            cnt = this.validateCnt(itemData);

        } else {
            this.validateLevelThreePrice(itemData);
            cnt = Math.round(Math.ceil(itemData['menu.price']/itemData['menu.unitprice']));
        };
        if(itemData['menu.price'] && cnt > 1) {
            harga = itemData['menu.price']/cnt;
        };
        item.name = itemData['menu.nm'];
        item.count = cnt;
        item.price = harga;
        
        return item;
    }

    private parseOcrLevelFour(itemData: PostOcrItemData) {
        const cnt = this.validateCnt(itemData);
        const menuPrice = itemData['menu.price'];
        let menuUnitPrice = itemData['menu.unitprice'];

        if(menuUnitPrice * cnt !== menuPrice && menuPrice !== 0) {
            menuUnitPrice = menuPrice / cnt;
        };
        
        const item = new Item();
        item.name = itemData['menu.nm'];
        item.count = cnt;
        item.price = menuUnitPrice;
        return item;
    }

    parsePastOcr(item: PostOcrItem): Item {
        let parsedItem: Item;
        switch(item.level) {
            case 2:
                parsedItem = this.parseOcrLevelTwo(item.data);
                break;
            case 3:
                parsedItem = this.parseOcrLevelThree(item.data);
                break;
            case 4:
                parsedItem = this.parseOcrLevelFour(item.data);
                break;
        }
        return parsedItem;
    }

    async parseLLM(item: ItemResponse): Promise<Item> {
        //skip saved in database if item name, count, or price is null
        if (item.name === null || item.count === null || item.price === null) return;
        const itemEntity = new Item();
        itemEntity.name = item.name;
        itemEntity.count = item.count;
        itemEntity.price = item.price;
        return itemEntity;
    };
}
