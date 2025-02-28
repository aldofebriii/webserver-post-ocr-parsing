import { Injectable } from '@nestjs/common';
import { initializeApp } from 'firebase/app';
import {
    getStorage,
    FirebaseStorage,
    ref,
    uploadBytes,
    getBytes,
} from 'firebase/storage';
import { v4 as uuidv4 } from 'uuid';

export enum COLLECTION {
    IMAGES = 'images',
    STRUK = 'struk',
}

@Injectable()
export default class FirebaseCloud {
    private storage: FirebaseStorage;
    constructor() {
        const app = initializeApp({
            apiKey: process.env.FIREBASE_API_KEY,
            projectId: process.env.FIREBASE_PROJECT_ID,
            storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
        });
        this.storage = getStorage(app);
    }

    getRef(collection: COLLECTION, filename: string) {
        return ref(this.storage, `${collection}/${filename}`);
    }

    async uploadFile(
        collection: COLLECTION,
        data: Buffer,
        contentType: string,
    ) {
        const snapshot = await uploadBytes(
            this.getRef(collection, uuidv4()),
            data,
            { contentType },
        );
        return snapshot.ref.name;
    }

    async getFile(collection: COLLECTION, filename: string) {
        return getBytes(this.getRef(collection, filename));
    }
}
