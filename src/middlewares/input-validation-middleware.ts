import { Request, Response, NextFunction } from 'express';
import { FieldValidationError, validationResult } from 'express-validator';
import { CodeResponsesEnum } from '../types';

export const inputValidationMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const errors  = validationResult(req);

    if (!errors.isEmpty()) {
        const errorsArray = errors.array({ onlyFirstError: true }) as FieldValidationError[];

        res.status(CodeResponsesEnum.Incorrect_values_400).json({
            errorsMessages: errorsArray.map(error => ({
                message: error.msg,
                field: error.path
            }))
        });
    } else {
        next();
    }
};
