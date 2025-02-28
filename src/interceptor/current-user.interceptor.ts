import {
    CallHandler,
    ExecutionContext,
    Injectable,
    NestInterceptor,
} from '@nestjs/common';
import { Request } from 'express';
import { Observable } from 'rxjs';
import AuthService from 'src/auth/auth.service';
import PenggunaService from 'src/pengguna/pengguna.service';

@Injectable()
export class CurrentUserInterceptor implements NestInterceptor {
    async intercept(
        context: ExecutionContext,
        next: CallHandler<any>,
    ): Promise<Observable<any>> {
        const req = context.switchToHttp().getRequest() as Request;
        const cookies = req.headers.cookie;
        const { jwt_at: jwtAt } = this.authService.parseAuthCookies(cookies);
        const payload = this.authService.tokenValidation(jwtAt);
        const pengguna = await this.authService.getPengguna(payload.id);
        req.user = pengguna;
        return next.handle();
    }

    constructor(
        private authService: AuthService,
    ) {}
}
