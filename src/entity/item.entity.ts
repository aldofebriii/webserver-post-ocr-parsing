import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import Struk from "./struk.entity";

@Entity()
export default class Item {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string; 

    @Column('int')
    count: number;

    @Column('double precision')
    price: number;

    @ManyToOne(() => Struk, (s) => s.items)
    @JoinColumn()
    struk: Struk
}