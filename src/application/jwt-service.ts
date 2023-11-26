import jwt from 'jsonwebtoken';
import { DBUserModel } from '../models/DBUserModel';
import { MeOutputModel } from '../models/MeOutputModel';
import { settings } from '../settings';

export const jwtService = {
    async createJWT(user: DBUserModel): Promise<string> {
        const token = jwt.sign({ userId: user.id }, settings.JWT_SECRET, { expiresIn: '1h' });

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
