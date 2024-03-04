import dotenv from 'dotenv';

dotenv.config();

export const settings = {
    MONGO_URI: process.env.MONGO_URL || 'mongodb://0.0.0.0:27017',
    JWT_SECRET: process.env.SECRET_KEY || '123',
    PORT: process.env.PORT || 3999,
    MONGO_DB_NAME: process.env.MONGO_DB_NAME || 'test'
};
