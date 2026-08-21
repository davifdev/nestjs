import { forwardRef, Module } from '@nestjs/common';
import { PersonsService } from './persons.service';
import { PersonsController } from './persons.controller';
import { Person } from './entities/person.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MessageModule } from '../message/message.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Person]),
    forwardRef(() => MessageModule),
  ],
  controllers: [PersonsController],
  providers: [PersonsService],
  exports: [PersonsService],
})
export class PersonsModule {}
