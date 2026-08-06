import { Module } from '@nestjs/common';
import { MessageController } from './message.controller';
import { MessageService } from './message.service';
import { Message } from './entities/message.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PersonsModule } from '../persons/persons.module';
@Module({
  imports: [TypeOrmModule.forFeature([Message]), PersonsModule],
  controllers: [MessageController],
  providers: [MessageService],
})
export class MessageModule {}
