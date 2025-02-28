import {
    BadRequestException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Pengguna } from 'src/entity/pengguna.entity';
import { Repository } from 'typeorm';
import { PenggunaDto } from './pengguna.dto';
import * as bcrypt from 'bcrypt';

const SALT_ROUNDS = 10;

@Injectable()
export default class PenggunaService {
    constructor(
        @InjectRepository(Pengguna) private penggunaRepo: Repository<Pengguna>,
    ) {}

    public async createOrEdit(
        pengguna: PenggunaDto,
        id?: number,
    ): Promise<Pengguna> {
        let user: Pengguna;
        if (id) {
            user = await this.penggunaRepo.findOneBy({ id });
        } else {
            await this.checkPenggunaDuplicate(pengguna.username, pengguna.email);
            user = new Pengguna();
        }

        const salt = bcrypt.genSaltSync(SALT_ROUNDS);
        return new Promise((resolve) => {
            bcrypt.hash(pengguna.password, salt).then((hashedPassword) => {
                user.username = pengguna.username;
                user.email = pengguna.email;
                user.password = hashedPassword;
                resolve(this.penggunaRepo.save(user));
            });
        });
    }

    public async checkPenggunaDuplicate(
        username: string,
        email: string,
    ): Promise<void> {
        const userExists = await this.penggunaRepo
            .createQueryBuilder('pengguna')
            .where('pengguna.username = :username', { username })
            .orWhere('pengguna.email = :email', { email })
            .getOne();
        if (userExists)
            throw new BadRequestException(
                'user dengan email atau username telah dimiliki user lain',
            );
    }

    public async mustFindById(id: number) {
        const user = await this.penggunaRepo.findOneBy({ id });
        if (!user) throw new NotFoundException('pengguna not found');
        return user;
    }

    public async mustFindByUsername(username: string) {
        const user = await this.penggunaRepo.findOneBy({ username });
        if (!user) throw new NotFoundException('pengguna not found');
        return user;
    }

    public async mustFindByEmail(email: string) {
        const user = await this.penggunaRepo.findOneBy({ email });
        if (!user) throw new NotFoundException('pengguna not found');
        return user;
    }
}
