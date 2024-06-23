import jwt, { JwtPayload } from 'jsonwebtoken';
import { settings } from '../settings';

export const jwtService = {
    async createJWT(payload: JwtPayload, expiresIn: string): Promise<string> {
        const token = jwt.sign(payload, settings.JWT_SECRET_KEY, { expiresIn });

        return token;
    },

    async getResultByToken(token: string): Promise<JwtPayload | string | null> {
        try {
            const result = jwt.verify(token, settings.JWT_SECRET_KEY);

            return result;
        } catch (error) {
            return null;
        }
    }
};
