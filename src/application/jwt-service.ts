import jwt from 'jsonwebtoken';
import { settings } from '../settings';

export const jwtService = {
    async createJWT(payload: { [key: string]: string }, expiresIn: string): Promise<string> {
        const token = jwt.sign(payload, settings.JWT_SECRET, { expiresIn });

        return token;
    },

    async getResultByToken(token: string): Promise<{ [key: string]: string } | null> {
        try {
            const result = jwt.verify(token, settings.JWT_SECRET);

            return result as { [key: string]: string };
        } catch (error) {
            return null;
        }
    }
};
