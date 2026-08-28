/* eslint-disable prettier/prettier */
import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { ConfigModule, ConfigType } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServeStaticModule } from '@nestjs/serve-static';
import path from 'path';
import { MessageModule } from '../src/message/message.module';
import { PersonsModule } from '../src/persons/persons.module';
import { GlobalConfigModule } from '../src/global-config/global-config.module';
import { AuthModule } from '../src/auth/auth.module';
import globalConfigTest from '../src/global-config/global-config-test';
import { CreatePersonDto } from '../src/persons/dto/create-person.dto';

describe('AppController (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forFeature(globalConfigTest),
        TypeOrmModule.forRootAsync({
          imports: [ConfigModule.forFeature(globalConfigTest)],
          inject: [globalConfigTest.KEY],
          useFactory: (
            globalConfigurations: ConfigType<typeof globalConfigTest>,
          ) => {
            return {
              type: globalConfigurations.database.type,
              host: globalConfigurations.database.host,
              port: globalConfigurations.database.port,
              username: globalConfigurations.database.username,
              password: globalConfigurations.database.password,
              database: globalConfigurations.database.database,
              autoLoadEntities: globalConfigurations.database.autoLoadEntities,
              synchronize: globalConfigurations.database.synchronize,
              dropSchema: true,
            };
          },
        }),
        ServeStaticModule.forRoot({
          rootPath: path.resolve(__dirname, '..', '..', 'images'),
          serveRoot: '/pictures',
        }),
        MessageModule,
        PersonsModule,
        GlobalConfigModule,
        AuthModule,
      ],
    }).compile();

    app = module.createNestApplication();

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    await app.init();
  });

  describe('/persons (POST)', () => {
    it('should create a person with success', async () => {
      const createPersonDto: CreatePersonDto = {
        name: 'Jhon Doe',
        email: 'jhondoe@gmail.com',
        password: '123456',
      };

      const response = await request(app.getHttpServer())
        .post('/persons')
        .send(createPersonDto)
        .expect(HttpStatus.CREATED);

      expect(response.body).toStrictEqual(
        expect.objectContaining({
          name: createPersonDto.name,
          email: createPersonDto.email,
          passwordHash: expect.any(String),
        }),
      );
    });

    it('should throw error of email exist', async () => {
      const createPersonDto: CreatePersonDto = {
        name: 'Jhon Doe',
        email: 'jhondoe@gmail.com',
        password: '123456',
      };

      await request(app.getHttpServer())
        .post('/persons')
        .send(createPersonDto)
        .expect(HttpStatus.CREATED);

      const response = await request(app.getHttpServer())
        .post('/persons')
        .send(createPersonDto)
        .expect(HttpStatus.CONFLICT);

      expect(response.body.message).toBe('Email já está cadastrado');
    });

    it('should throw error if password is curt', async () => {
      const createPersonDto: CreatePersonDto = {
        name: 'Jhon Doe',
        email: 'jhondoe@gmail.com',
        password: '123',
      };

      const response = await request(app.getHttpServer())
        .post('/persons')
        .send(createPersonDto)
        .expect(HttpStatus.BAD_REQUEST);

      expect(response.body.message).toEqual([
        'Password must be at least 6 characters long',
      ]);
    });
  });

  describe('/persons/:id (GET)', () => {
    it('should return Unauthorized error when user not logged', async () => {
      const personResponse = await request(app.getHttpServer())
        .post('/persons')
        .send({
          name: 'Jhon Doe',
          email: 'jhondoe@gmail.com',
          password: '123456',
        });

      const response = await request(app.getHttpServer())
        .get('/persons/' + personResponse.body.id)
        .expect(HttpStatus.UNAUTHORIZED);

      expect(response.body).toEqual({
        message: 'Unauthorized',
        error: 'Unauthorized',
        statusCode: 401,
      });
    });

    it('should return Person  when user  logged', async () => {
      const personResponse = await request(app.getHttpServer())
        .post('/persons')
        .send({
          name: 'Jhon Doe',
          email: 'jhondoe@gmail.com',
          password: '123456',
        })
        .expect(HttpStatus.CREATED);

      const loginResponse = await request(app.getHttpServer())
        .post('/auth')
        .send({ email: 'jhondoe@gmail.com', password: '123456' });

      const response = await request(app.getHttpServer())
        .get('/persons/' + personResponse.body.id)
        .set('Authorization', `Bearer ${loginResponse.body.tokens.accessToken}`)
        .expect(HttpStatus.OK);

      expect(response.body).toEqual(
        expect.objectContaining({
          name: response.body.name,
          email: personResponse.body.email,
          passwordHash: expect.any(String),
        }),
      );
    });
  });

  afterEach(async () => {
    await app.close();
  });
});
