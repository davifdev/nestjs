import { Injectable, NotFoundException } from '@nestjs/common';
import { Message } from './entities/message.entity';
import { CreateMessageDto } from './dto/create-message-dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
@Injectable()
export class MessageService {
  constructor(
    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,
  ) {}

  async findAll() {
    const messages = await this.messageRepository.find();
    return messages;
  }

  throwNotFoundError(message: string) {
    throw new NotFoundException(message);
  }

  async findOne(messageId: number) {
    const message = await this.messageRepository.findOne({
      where: { id: messageId },
    });

    if (message) return message;

    // throw new HttpException('Message not found', HttpStatus.NOT_FOUND);
    this.throwNotFoundError('Message not found');
  }

  create(createMessageDto: CreateMessageDto) {
    const newMessage = {
      ...createMessageDto,
      isRead: false,
      date: new Date(),
    };

    const message = this.messageRepository.create(newMessage);

    return this.messageRepository.save(message);
  }

  async update(messageId: number, updateMessageDto: UpdateMessageDto) {
    const partialMessageDto = {
      isRead: updateMessageDto?.isRead,
      text: updateMessageDto?.text,
    };

    const message = await this.messageRepository.preload({
      id: messageId,
      ...partialMessageDto,
    });

    if (!message) return this.throwNotFoundError('Message not found');

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
