import { forwardRef, Module } from '@nestjs/common';
import { MessageController } from './message.controller';
import { MessageService } from './message.service';
import { Message } from './entities/message.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PersonsModule } from '../persons/persons.module';
import { MyDynamicModule } from '../my-dynamic/my-dynamic.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Message]),
    forwardRef(() => PersonsModule),
    MyDynamicModule.register({
      apiKey: 'minha_api_key',
      apiUrl: 'http://localhost:3000',
    }),
  ],
  controllers: [MessageController],
  providers: [MessageService],
  exports: [MessageService],
})
export class MessageModule {}
