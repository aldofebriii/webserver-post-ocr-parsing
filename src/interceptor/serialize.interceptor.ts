import {
    CallHandler,
    ExecutionContext,
    Injectable,
    NestInterceptor,
} from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { Observable, map } from 'rxjs';

export type ClassConstuctor = {
    new (...args: any): Object;
};

@Injectable()
export class SerializeInterceptor implements NestInterceptor {
    intercept(
        context: ExecutionContext,
        next: CallHandler<any>,
    ): Observable<Object> {
        return next
            .handle()
            .pipe(
                map((data) =>
                    plainToInstance(this.dto, data, {
                        excludeExtraneousValues: true,
                    }),
                ),
            );
    }

    constructor(private dto: ClassConstuctor) {
        this.dto = dto;
    }
}
