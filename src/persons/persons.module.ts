import { Module } from '@nestjs/common';
import { PersonsService } from './persons.service';
import { PersonsController } from './persons.controller';
import { Person } from './entities/person.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([Person])],
  controllers: [PersonsController],
  providers: [PersonsService],
})
export class PersonsModule {}
