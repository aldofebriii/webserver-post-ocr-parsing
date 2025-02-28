import {
    Column,
    Entity,
    JoinColumn,
    ManyToOne,
    OneToMany,
    OneToOne,
    PrimaryGeneratedColumn,
} from 'typeorm';
import { Pengguna } from './pengguna.entity';
import Item from './item.entity';
import Charge from './charge.entity';
import Log from './log.entity';

@Entity()
export default class Struk {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column({ nullable: true })
    place: string;

    @Column({ name: 'image_ref' })
    imageRef: string;

    @Column({ name: 'mimetype' })
    mimetype: string;

    @ManyToOne(() => Pengguna, (p) => p.struks)
    @JoinColumn()
    pengguna: Pengguna;

    @OneToMany(() => Item, (i) => i.struk, { cascade: true })
    items: Item[];

    @OneToOne(() => Charge, (c) => c.struk, { cascade: true })
    charge: Charge;

    @OneToMany(() => Log, (l) => l.struk)
    logs: Log
}
