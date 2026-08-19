import { Injectable, NotFoundException } from '@nestjs/common';
import { Message } from './entities/message.entity';
import { CreateMessageDto } from './dto/create-message-dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PersonsService } from '../persons/persons.service';
import { PaginationDto } from '../common/dto/pagination.dto';
import { ConfigService } from '@nestjs/config';
@Injectable()
export class MessageService {
  constructor(
    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,
    private readonly personService: PersonsService,
    private readonly configService: ConfigService,
  ) {
    const databaseUserName = this.configService.get('DATABASE_USERNAME');
    console.log(databaseUserName);
  }

  async findAll(paginationDto?: PaginationDto) {
    const limit = paginationDto?.limit;
    const offset = paginationDto?.offset;

    const messages = await this.messageRepository.find({
      take: limit,
      skip: offset,
    });

    return messages;
  }

  throwNotFoundError(message: string) {
    throw new NotFoundException(message);
  }

  async findOne(messageId: number) {
    const message = await this.messageRepository.findOne({
      where: { id: messageId },
    });

    if (!message) {
      this.throwNotFoundError('Message not found');
      return;
    }

    return message;
    // throw new HttpException('Message not found', HttpStatus.NOT_FOUND);
  }

  async create(createMessageDto: CreateMessageDto) {
    const { fromId, toId } = createMessageDto;

    const from = await this.personService.findOne(fromId);
    const to = await this.personService.findOne(toId);

    const newMessage = {
      text: createMessageDto.text,
      from,
      to,
      isRead: false,
    };

    const message = this.messageRepository.create(newMessage);

    await this.messageRepository.save(message);
    return {
      ...message,
      from: {
        id: message.from.id,
        name: message.from.name,
      },
      to: {
        id: message.to.id,
        name: message.to.name,
      },
    };
  }

  async update(messageId: number, updateMessageDto: UpdateMessageDto) {
    const message = await this.findOne(messageId);

    if (!message) {
      this.throwNotFoundError('Message not found');
      return;
    }

    message.text = updateMessageDto?.text ?? message?.text;
    message.isRead = updateMessageDto?.isRead ?? message?.isRead;

    return this.messageRepository.save(message);
  }

  async remove(messageId: number) {
    const message = await this.messageRepository.findOne({
      where: { id: messageId },
    });

    if (!message) return this.throwNotFoundError('Message not found');

    await this.messageRepository.delete(messageId);

    return message;
  }
}
