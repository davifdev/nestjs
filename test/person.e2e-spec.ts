import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
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

  it('/ (GET)', () => {});

  afterEach(async () => {
    await app.close();
  });
});
