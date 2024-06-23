import dotenv from 'dotenv';

dotenv.config();

export const settings = {
    MONGO_URI: process.env.MONGO_URI || 'mongodb://0.0.0.0:27017',
    MONGO_DB_NAME: process.env.MONGO_DB_NAME || 'db',
    JWT_SECRET_KEY: process.env.JWT_SECRET_KEY || '123',
    PORT: process.env.PORT || 3999,
    EMAIL_FROM: process.env.EMAIL_FROM,
    EMAIL_FROM_PASSWORD: process.env.EMAIL_FROM_PASSWORD
};
