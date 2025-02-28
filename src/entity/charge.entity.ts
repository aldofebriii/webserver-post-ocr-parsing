import { Column, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";
import Struk from "./struk.entity";

@Entity()
export default class Charge {
    @PrimaryGeneratedColumn()
    id: number;

    @Column('double precision', {name: 'tax_charge'})
    tax_charge: number;

    @Column('double precision', {name: 'service_charge'})
    service_charge: number;

    @Column('double precision', {name: 'discount_charge', })
    discount_charge: number;

    @Column('double precision', {name: 'other_charge'})
    other_charge: number;

    @ManyToOne(() => Struk, (s) => s.charge)
    @JoinColumn()
    struk: Struk;

}