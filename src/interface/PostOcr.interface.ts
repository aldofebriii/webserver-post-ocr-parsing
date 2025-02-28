export interface PostOcrItemData {
    'menu.nm': string;
    'menu.price': number;
    'menu.unitprice': number;
    'menu.cnt': number;
}

export interface PostOcrItem {
    data: PostOcrItemData;
    level: 2 | 3 | 4;
}

export interface PostOcrCharge {
    'service_charge': number;
    'tax_charge': number;
    'discount_charge': number;
    'other_charge': number;
}

export interface PostOcrResponse {
    items: PostOcrItem[];
    charge: PostOcrCharge;
    time: number;
}