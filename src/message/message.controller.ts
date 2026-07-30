import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { MessageService } from './message.service';

@Controller('message')
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  @HttpCode(HttpStatus.OK)
  @Get()
  findAll(@Query() pagination: { limit: string; offset: string }) {
    const { limit = 10, offset = 0 } = pagination;
    return this.messageService.findAll(limit, offset);
  }

  @HttpCode(HttpStatus.OK)
  @Get(':messageId')
  findOne(@Param('messageId') messageId: string) {
    return this.messageService.findOne(messageId);
  }

  @HttpCode(HttpStatus.CREATED)
  @Post()
  create(@Body() body: { message: string; new_key: string }) {
    return this.messageService.create(body);
  }

  @HttpCode(HttpStatus.OK)
  @Patch(':messageId')
  update(
    @Param('messageId') messageId: string,
    @Body() body: { message?: string; new_key?: string },
  ) {
    return this.messageService.update(messageId, body);
  }

  @HttpCode(HttpStatus.OK)
  @Delete(':messageId')
  delete(@Param('messageId') messageId: string) {
    return this.messageService.delete(messageId);
  }
}
