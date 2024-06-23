import { inject, injectable } from 'inversify';
import { Request, Response } from 'express';
import { CodeResponsesEnum } from '../types';
import { UsersService } from '../domain/users-service';

@injectable()
export class UsersController {
    constructor(
        @inject(UsersService) protected usersService: UsersService
    ) {}

    async getUsers(req: Request, res: Response) {
        const foundUsers = await this.usersService.getUsers(req.query);

        res.send(foundUsers);
    }

    async postUsers(req: Request, res: Response) {
        const createdUser = await this.usersService.addUser(req.body);

        res.status(CodeResponsesEnum.Created_201).send(createdUser);
    }

    async deleteUser(req: Request, res: Response) {
        const deletedUser = await this.usersService.removeUser(req.params.userId);

        if (!deletedUser) {
            res.send(CodeResponsesEnum.Not_found_404);
        } else {
            res.send(CodeResponsesEnum.Not_content_204);
        }
    }
}
