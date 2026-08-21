import {
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { LoginDto } from './dto/login.dto';
import { Repository } from 'typeorm';
import { Person } from '../persons/entities/person.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { HashingServiceProtocol } from './hashing/hashing.service';
import { JwtService } from '@nestjs/jwt';
import { type ConfigType } from '@nestjs/config';
import jwtConfig from './config/jwt.config';
import { RefreshTokenDto } from './dto/refresh-token.dto';
@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Person)
    private readonly personRepository: Repository<Person>,
    private readonly hashingService: HashingServiceProtocol,
    @Inject(jwtConfig.KEY)
    private readonly jwtConfiguration: ConfigType<typeof jwtConfig>,
    private readonly jwtService: JwtService,
  ) {}

  async login(loginDto: LoginDto) {
    let passwordIsValid = false;
    let throwError = true;
    const person = await this.personRepository.findOneBy({
      email: loginDto.email,
      active: true,
    });

    if (!person) throw new NotFoundException('Person Unauthorized');

    if (person) {
      passwordIsValid = await this.hashingService.compare(
        loginDto.password,
        person.passwordHash,
      );
    }

    if (passwordIsValid) {
      throwError = false;
    }

    if (throwError) {
      throw new UnauthorizedException('User or password is invalid');
    }

    return {
      name: person.name,
      email: person.email,
      tokens: await this.generateTokens(person),
    };
  }

  async refreshTokens(refreshTokenDto: RefreshTokenDto) {
    try {
      const { sub } = await this.jwtService.verifyAsync(
        refreshTokenDto.refreshToken,
        this.jwtConfiguration,
      );

      const person = await this.personRepository.findOneBy({
        id: sub,
        active: true,
      });

      if (!person) throw new Error('person not found');

      return { tokens: await this.generateTokens(person) };
    } catch (error) {
      throw new UnauthorizedException((error as { message: string }).message);
    }
  }

  private async generateTokens(person: Person) {
    const accessTokenPromise = this.signJwtAsync(
      person.id,
      this.jwtConfiguration.ttl,
      { email: person.email },
    );

    const refreshTokenPromise = this.signJwtAsync(
      person.id,
      this.jwtConfiguration.ttlRefresh,
    );

    const [accessToken, refreshToken] = await Promise.all([
      accessTokenPromise,
      refreshTokenPromise,
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }

  private async signJwtAsync<T>(sub: number, expiresIn: number, payload?: T) {
    return await this.jwtService.signAsync(
      {
        sub,
        ...payload,
      },
      {
        audience: this.jwtConfiguration.aud,
        issuer: this.jwtConfiguration.iss,
        secret: this.jwtConfiguration.secret,
        expiresIn,
      },
    );
  }
}
