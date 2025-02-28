import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import Item from "./item.entity";
import Charge from "./charge.entity";
import { ChargeDto, ItemDto } from "src/struk/struk.dto";
import Struk from "./struk.entity";

export interface ExtractedData {
    items: ItemDto[];
    charge: ChargeDto
}

export enum SourceData {
    LayoutLMv2='LayoutLMv2 KatanaML Finetuning',
    GeminiFineTuning='Gemini-1.5-Flash 001 Tuning',
    GeminiVision='Gemini-1.5-Flash Vision API'
}

@Entity()
export default class Log {
    @PrimaryGeneratedColumn()
    id: number;

    @Column('json')
    extracted: ExtractedData;

    @Column('int')
    cost: number;

    @Column('double precision')
    distance: number;

    @Column('double precision')
    time: number;

    @Column('json')
    expected: ExtractedData

    @Column()
    source: SourceData

    @Column('double precision')
    similar: number;

    @ManyToOne(() => Struk, (s) => s.logs)
    @JoinColumn()
    struk: Struk;
}