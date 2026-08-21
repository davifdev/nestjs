import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { Request } from 'express';
import jwtConfig from '../config/jwt.config';
import { type ConfigType } from '@nestjs/config';
import { REQUEST_TOKEN_PAYLOAD_KEY } from '../constants/auth.constants';
import { InjectRepository } from '@nestjs/typeorm';
import { Person } from '../../persons/entities/person.entity';
import { Repository } from 'typeorm';

@Injectable()
export class AuthTokenGuard implements CanActivate {
  constructor(
    @InjectRepository(Person)
    private readonly personRepository: Repository<Person>,
    private readonly jwtService: JwtService,
    @Inject(jwtConfig.KEY)
    private readonly jwtConfiguration: ConfigType<typeof jwtConfig>,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: Request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException('Unauthorized');
    }

    try {
      const payload = await this.jwtService.verifyAsync(
        token,
        this.jwtConfiguration,
      );

      const person = await this.personRepository.findBy({
        id: payload.sub,
        active: true,
      });

      if (!person) throw new UnauthorizedException('Person Unauthorized');

      payload['person'] = person;

      request[REQUEST_TOKEN_PAYLOAD_KEY] = payload;
    } catch (error) {
      console.error(error);
      throw new UnauthorizedException('Unauthorized');
    }

    return Promise.resolve(true);
  }

  extractTokenFromHeader(request: Request): string | undefined {
    const authorization = request.headers?.authorization;

    if (!authorization || typeof authorization !== 'string') return;

    return authorization.split(' ')[1];
  }
}
