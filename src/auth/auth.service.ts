import {
    BadRequestException,
    Injectable,
    UnauthorizedException,
} from '@nestjs/common';
import PenggunaService from 'src/pengguna/pengguna.service';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import {
    EXPIRES_COOKIE_JWT_AT,
    EXPIRES_COOKIE_JWT_RT,
} from 'src/util/consts.util';

interface ResultToken {
    jwtAt: string;
    jwtRt: string;
}

enum HEADER_AUTH {
    JWT_AT = 'jwt_at',
    JWT_RT = 'jwt_rt',
}

@Injectable()
export default class AuthService {
    constructor(private penggunaService: PenggunaService) {}

    public async signin(email: string, password: string): Promise<ResultToken> {
        const user = await this.penggunaService.mustFindByEmail(email);
        const isValid = bcrypt.compareSync(password, user.password);
        if (!isValid) {
            throw new BadRequestException('invalid password');
        }
        const stringId = user.id.toString();
        const jwtAt = this.signJwt(stringId, '1h');
        const jwtRt = this.signJwt(stringId, '3h');
        return { jwtAt, jwtRt };
    }

    public signJwt(id: string, expiresIn: string | number): string {
        return jwt.sign({ id }, process.env.JWT_SECRET, {
            expiresIn: expiresIn,
        });
    }

    public tokenValidation(token: string): jwt.JwtPayload {
        try {
            const payload = jwt.verify(token, process.env.JWT_SECRET);
            return payload as jwt.JwtPayload;
        } catch (err) {
            throw new UnauthorizedException(err.message);
        }
    }

    public parseAuthCookies(cookies: string): Record<string, string> {
        const result = {};
        if(!cookies) throw new BadRequestException('cookies was missing');
        const cookie = cookies.split(';');
        for (const data of cookie) {
            const [key, value] = data.split('=');
            result[key.trim()] = value;
        }
        return result;
    }

    public generateJwtCookie(jwtAt: string, jwtRt: string): string[] {
        return [
            `${HEADER_AUTH.JWT_AT}=${jwtAt};HttpOnly;Max-Age=${EXPIRES_COOKIE_JWT_AT};Path=/`,
            `${HEADER_AUTH.JWT_RT}=${jwtRt};HttpOnly;Max-Age=${EXPIRES_COOKIE_JWT_RT};Path=/`,
        ];
    }

    public getPengguna(id: number) {
        return this.penggunaService.mustFindById(id);
    }
}
