import { Pengguna } from "./entity/pengguna.entity";

declare global {
    namespace Express {
        export interface Request {
            user?: Pengguna
        }
    }
}