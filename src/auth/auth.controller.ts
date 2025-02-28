import { Body, Controller, Get, Post, Req, Res, UseInterceptors } from '@nestjs/common';
import { AuthDto } from './auth.dto';
import AuthService from './auth.service';
import { Request, Response } from 'express';
import { SerializeInterceptor } from 'src/interceptor/serialize.interceptor';
import { PenggunaResponse } from 'src/pengguna/pengguna.dto';
import { CurrentUserInterceptor } from 'src/interceptor/current-user.interceptor';


@Controller('auth')
export default class AuthController {
    constructor(private authService: AuthService) {}
    @Post('/signin')
    async signIn(@Body() body: AuthDto, @Res() res: Response) {
        const { jwtAt, jwtRt } = await this.authService.signin(
            body.email,
            body.password,
        );
        res.setHeader('Set-Cookie', this.authService.generateJwtCookie(jwtAt, jwtRt));
        return res.status(201).json({ jwtAt, jwtRt });
    }

    @Get('refresh')
    async refresh(@Req() req: Request, @Res() res: Response) {
        const cookies = req.headers.cookie;
        const { jwt_rt: jwtRt} = this.authService.parseAuthCookies(cookies);
        const payload = this.authService.tokenValidation(jwtRt);
        const newJwtAt = this.authService.signJwt(payload.id, '1h');
        const newJwtRt = this.authService.signJwt(payload.id, '1h');
        res.setHeader('Set-Cookie', this.authService.generateJwtCookie(newJwtAt, newJwtRt));
        return res.status(200).json({msg: 'token refreshed'});
    }
}
