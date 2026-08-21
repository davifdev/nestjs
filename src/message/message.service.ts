import {
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { Message } from './entities/message.entity';
import { CreateMessageDto } from './dto/create-message-dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PersonsService } from '../persons/persons.service';
import { PaginationDto } from '../common/dto/pagination.dto';
import { ConfigService } from '@nestjs/config';
import { TokenPayloadDto } from '../auth/dto/token-payload.dto';

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
      relations: { from: true, to: true },
    });

    return messages;
  }

  throwNotFoundError(message: string) {
    throw new NotFoundException(message);
  }

  async findOne(messageId: number) {
    const message = await this.messageRepository.findOne({
      where: { id: messageId },
      relations: { from: true, to: true },
    });

    if (!message) {
      this.throwNotFoundError('Message not found');
      return;
    }

    return message;
    // throw new HttpException('Message not found', HttpStatus.NOT_FOUND);
  }

  async create(
    createMessageDto: CreateMessageDto,
    tokenPayload: TokenPayloadDto,
  ) {
    const { toId } = createMessageDto;

    const from = await this.personService.findOne(tokenPayload.sub);
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

  async update(
    messageId: number,
    updateMessageDto: UpdateMessageDto,
    tokenPayload: TokenPayloadDto,
  ) {
    const message = await this.findOne(messageId);
    if (!message) {
      this.throwNotFoundError('Message not found');
      return;
    }

    if (message.from?.id !== tokenPayload.sub) {
      throw new ForbiddenException('User is not authorized for update message');
    }

    message.text = updateMessageDto?.text ?? message?.text;
    message.isRead = updateMessageDto?.isRead ?? message?.isRead;

    return this.messageRepository.save(message);
  }

  async remove(messageId: number, tokenPayload: TokenPayloadDto) {
    const message = await this.findOne(messageId);

    if (!message) return this.throwNotFoundError('Message not found');

    if (message.from?.id !== tokenPayload.sub) {
      throw new UnauthorizedException(
        'User is not authorized for update message',
      );
    }

    await this.messageRepository.delete(messageId);

    return message;
  }
}
