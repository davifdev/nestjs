import { Injectable } from '@nestjs/common';

@Injectable()
export class MessageService {
  findAll(limit: any, offset: any): string {
    return `This route returned all messages limit: ${limit} offset: ${offset}`;
  }

  findOne(messageId: string): string {
    return `This route returned unique message with id: ${messageId}`;
  }

  create(body: { message: string; new_key: string }): string {
    return `This route create on message: ${body.message}  key: ${body.new_key}`;
  }

  update(messageId: string, body: { message?: string; new_key?: string }) {
    return {
      messageId,
      ...body,
    };
  }

  delete(messageId: string): string {
    return `Message with id: ${messageId} was deleted success.`;
  }
}
