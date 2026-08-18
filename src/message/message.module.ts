/* eslint-disable no-constant-condition */
import { forwardRef, Module } from '@nestjs/common';
import { MessageController } from './message.controller';
import { MessageService } from './message.service';
import { Message } from './entities/message.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PersonsModule } from '../persons/persons.module';
import { MessageUtils } from './message.utils';
import { RemoveSpacesRegex } from '../common/regex/remove-spaces.regex';
import { OnlyLowercaseLettersRegex } from '../common/regex/only-lowercase-letters';
import { SERVER_NAME } from './constants/server-name.constant';
import {
  ONLY_LOWERCASE_LETTERS_REGEX,
  REMOVE_SPACES_REGEX,
} from './constants/message.constant';
import { RegexFactory } from '../common/regex/regex.factory';
@Module({
  imports: [
    TypeOrmModule.forFeature([Message]),
    forwardRef(() => PersonsModule),
  ],
  controllers: [MessageController],
  providers: [
    MessageService,
    RegexFactory,
    { provide: MessageUtils, useClass: MessageUtils },
    { provide: SERVER_NAME, useValue: 'My Name Is Davi!' },
    {
      provide: ONLY_LOWERCASE_LETTERS_REGEX,
      useClass: OnlyLowercaseLettersRegex,
    },
    {
      provide: REMOVE_SPACES_REGEX,
      useClass: RemoveSpacesRegex,
    },
    {
      provide: REMOVE_SPACES_REGEX,
      useFactory: (regexFactory: RegexFactory) => {
        return regexFactory.create('RemoveSpacesRegex');
      },
      inject: [RegexFactory],
    },
  ],
  exports: [MessageService],
})
export class MessageModule {}
