import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { MessageService } from './message.service';
import { CreateMessageDto } from './dto/create-message-dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
@Controller('message')
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  @HttpCode(HttpStatus.OK)
  @Get()
  findAll(@Query() paginationDto: PaginationDto) {
    return this.messageService.findAll(paginationDto);
  }

  @HttpCode(HttpStatus.OK)
  @Get(':messageId')
  findOne(@Param('messageId', ParseIntPipe) messageId: number) {
    return this.messageService.findOne(messageId);
  }

  @HttpCode(HttpStatus.CREATED)
  @Post()
  create(@Body() createMessageDto: CreateMessageDto) {
    return this.messageService.create(createMessageDto);
  }

  @HttpCode(HttpStatus.OK)
  @Patch(':messageId')
  update(
    @Param('messageId') messageId: number,
    @Body() updateMessadeDto: UpdateMessageDto,
  ) {
    return this.messageService.update(messageId, updateMessadeDto);
  }

  @HttpCode(HttpStatus.OK)
  @Delete(':messageId')
  delete(@Param('messageId', ParseIntPipe) messageId: number) {
    return this.messageService.remove(messageId);
  }
}
