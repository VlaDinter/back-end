import jwt from 'jsonwebtoken';
import { MeOutputModel } from '../models/MeOutputModel';
import { settings } from '../settings';

export const jwtService = {
    async createJWT(userId: string, expiresIn: string): Promise<string> {
        const token = jwt.sign({ userId }, settings.JWT_SECRET, { expiresIn });

        return token;
    },

    async getUserIdByToken(token: string): Promise<string | null> {
        try {
            const result = jwt.verify(token, settings.JWT_SECRET) as MeOutputModel;

            return result.userId;
        } catch (error) {
            return null;
        }
    }
};
