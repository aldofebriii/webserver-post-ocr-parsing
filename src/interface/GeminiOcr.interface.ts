export interface ItemResponse {
    name: string;
    count: number;
    price: number;
}

export interface ChargeResponse {
    tax_charge: number;
    service_charge: number;
    other_charge: number;
    discount_charge: number;
}

export interface LLMResponseOCR {
    items: ItemResponse[];
    charge: ChargeResponse;
    charges: ChargeResponse;
}