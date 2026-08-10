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
  UsePipes,
} from '@nestjs/common';
import { MessageService } from './message.service';
import { CreateMessageDto } from './dto/create-message-dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { ParseIntIdPipe } from '../common/pipes/parse-int-id.pipe';
@Controller('message')
@UsePipes(ParseIntIdPipe)
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  @HttpCode(HttpStatus.OK)
  @Get()
  findAll(@Query() paginationDto: PaginationDto) {
    return this.messageService.findAll(paginationDto);
  }

  @HttpCode(HttpStatus.OK)
  @Get(':messageId')
  findOne(@Param('messageId') messageId: number) {
    console.log('MessageID', messageId);
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
  delete(@Param('messageId') messageId: number) {
    return this.messageService.remove(messageId);
  }
}
