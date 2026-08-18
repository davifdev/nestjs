import { NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';

export class SimpleMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    console.log('Simple middleware: Olá');

    req['user'] = {
      name: 'Davi',
      email: 'davi@gmail.com',
      role: 'admin',
    };

    next();
    res.on('finish', () => {
      console.log('A execução terminou!');
    });
  }
}
