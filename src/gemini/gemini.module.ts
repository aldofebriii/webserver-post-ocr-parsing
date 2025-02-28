import { GoogleGenerativeAI } from '@google/generative-ai';
import { Module } from '@nestjs/common';
import { GeminiService } from './gemini.service';
import { ConfigModule } from '@nestjs/config';
import ItemModule from 'src/item/item.module';
console.log(process.env.GEMINI_API_KEY);
@Module({
    imports: [ItemModule],
    exports: [GeminiService],
    controllers: [],
    providers: [
        {
            provide: 'GEN_AI',
            useFactory: () => {
                const apiKey = process.env.GEMINI_API_KEY;
                if (!apiKey) {
                    throw new Error(
                        'GEMINI_API_KEY environment variable is not defined.',
                    );
                }
                return new GoogleGenerativeAI(apiKey);
            },
        },
        GeminiService,
    ],
})
export default class GeminiModule {}
