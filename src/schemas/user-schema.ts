import mongoose from 'mongoose';
import { DBUserType } from '../types/DBUserType';

export const UserSchema = new mongoose.Schema<DBUserType>({
    id: { type: String, require: true },
    login: { type: String, require: true },
    email: { type: String, require: true },
    passwordHash: String,
    emailConfirmation: {
        default: null,
        type: {
            confirmationCode: { type: String, require: true },
            expirationDate: { type: Date, require: true },
            isConfirmed: { type: Boolean, require: true }
        }
    },

    createdAt: {
        type: String,
        default() {
            return new Date().toISOString();
        }
    }
});
