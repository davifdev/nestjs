import { Injectable, NotFoundException } from '@nestjs/common';
import { Message } from './entities/message.entity';
import { CreateMessageDto } from './dto/create-message-dto';
import { UpdateMessageDto } from './dto/update-message.dto';
@Injectable()
export class MessageService {
  private lastId = 1;
  private messages: Message[] = [
    {
      id: 1,
      text: 'This is a message test',
      from: 'Jhon',
      to: 'Jane',
      isRead: false,
      date: new Date(),
    },
  ];

  findAll() {
    return this.messages;
  }

  throwNotFoundError(message: string) {
    throw new NotFoundException(message);
  }

  findOne(messageId: string) {
    const message = this.messages.find((item) => item.id === Number(messageId));

    if (message) return message;

    // throw new HttpException('Message not found', HttpStatus.NOT_FOUND);
    this.throwNotFoundError('Message not found');
  }

  create(createMessageDto: CreateMessageDto) {
    this.lastId++;
    const newMessage: Message = {
      id: this.lastId,
      ...createMessageDto,
      isRead: false,
      date: new Date(),
    };

    this.messages.push(newMessage);
    return newMessage;
  }

  update(messageId: string, updateMessageDto: UpdateMessageDto) {
    const messageExistIndex = this.messages.findIndex(
      (item) => item.id === Number(messageId),
    );

    if (messageExistIndex < 0) {
      this.throwNotFoundError('Message not found');
    }

    const existingMessage = this.messages[messageExistIndex];

    const messageUpdated = (this.messages[messageExistIndex] = {
      ...existingMessage,
      ...updateMessageDto,
    });

    return messageUpdated;
  }

  remove(messageId: string) {
    const messageExistIndex = this.messages.findIndex(
      (item) => item.id === Number(messageId),
    );

    if (messageExistIndex < 0) {
      this.throwNotFoundError('Message not found');
    }

    const message = this.messages[messageExistIndex];
    this.messages.splice(messageExistIndex, 1);

    return message;
  }
}
