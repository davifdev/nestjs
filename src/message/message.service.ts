import { Injectable } from '@nestjs/common';
import { MessageEntity } from './entities/message.entity';
@Injectable()
export class MessageService {
  private lastId = 1;
  private messages: MessageEntity[] = [
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

  findOne(messageId: string) {
    return this.messages.find((item) => item.id === Number(messageId));
  }

  create(body: Omit<MessageEntity, 'id'>) {
    this.lastId++;
    const newMessage: MessageEntity = {
      id: this.lastId,
      ...body,
    };

    this.messages.push(newMessage);
    return newMessage;
  }

  update(messageId: string, body: Omit<Partial<MessageEntity>, 'id'>) {
    const messageExistIndex = this.messages.findIndex(
      (item) => item.id === Number(messageId),
    );

    if (messageExistIndex >= 0) {
      const existingMessage = this.messages[messageExistIndex];

      this.messages[messageExistIndex] = {
        ...existingMessage,
        ...body,
      };
    }
  }

  remove(messageId: string) {
    const messageExsistIndex = this.messages.findIndex(
      (item) => item.id === Number(messageId),
    );

    if (messageExsistIndex >= 0) {
      this.messages.splice(messageExsistIndex, 1);
    }
  }
}
