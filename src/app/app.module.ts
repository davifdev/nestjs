import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MessageModule } from '../message/message.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PersonsModule } from '../persons/persons.module';
@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: 'password',
      database: 'nestjs_db',
      autoLoadEntities: true, // Carrega entidades sem precisar especifica-las
      synchronize: true, // Sincroniza o banco de dados com as entidades (não recomendado para produção)
    }),
    MessageModule,
    PersonsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
