import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Param,
  Patch,
  Post,
  Query,
  UseInterceptors,
  UsePipes,
} from '@nestjs/common';
import { MessageService } from './message.service';
import { CreateMessageDto } from './dto/create-message-dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { ParseIntIdPipe } from '../common/pipes/parse-int-id.pipe';
import { AddHeaderInterceptor } from '../common/interceptors/add-header.interceptor';
import { TimingConnectionInterceptor } from '../common/interceptors/time-connection.interceptor';
import { ErrorHandlingInterceptor } from '../common/interceptors/error-handling.interceptor';
import { SimpleCacheInterceptor } from '../common/interceptors/simple-cache.interceptor';
import { ChangeDataInterceptor } from '../common/interceptors/change-data.interceptor';
import { AuthTokenInterceptor } from '../common/interceptors/auth-token.interceptor';
import { ReqDataParam } from '../common/params/req-data-param.decorator';
import { MessageUtils } from './message.utils';

import { RegexProtocol } from '../common/regex/regex.protocol';
import { SERVER_NAME } from './constants/server-name.constant';
import {
  ONLY_LOWERCASE_LETTERS_REGEX,
  REMOVE_SPACES_REGEX,
} from './constants/message.constant';
import { OnlyLowercaseLettersRegex } from '../common/regex/only-lowercase-letters';
@Controller('message')
// @UsePipes(ParseIntIdPipe)
// @UseInterceptors(
//   SimpleCacheInterceptor,
//   ChangeDataInterceptor,
//   AuthTokenInterceptor,
// )
export class MessageController {
  constructor(
    private readonly messageService: MessageService,
    private readonly messageUtils: MessageUtils,
    @Inject(SERVER_NAME)
    private readonly serverName: string,
    @Inject(REMOVE_SPACES_REGEX)
    private readonly removeSpacesRegex: RegexProtocol,
    @Inject(ONLY_LOWERCASE_LETTERS_REGEX)
    private readonly onlyLowerCaseRegex: OnlyLowercaseLettersRegex,
  ) {}

  @UseInterceptors(TimingConnectionInterceptor, ErrorHandlingInterceptor)
  @HttpCode(HttpStatus.OK)
  @Get()
  findAll(
    @Query() paginationDto: PaginationDto,
    @ReqDataParam('method') method,
  ) {
    console.log(method);
    throw new BadRequestException();
    return this.messageService.findAll(paginationDto);
  }

  @UseInterceptors(AddHeaderInterceptor, ErrorHandlingInterceptor)
  @HttpCode(HttpStatus.OK)
  @Get(':messageId')
  findOne(@Param('messageId') messageId: number) {
    console.log(this.removeSpacesRegex.execute(this.serverName));
    console.log(this.onlyLowerCaseRegex.execute(this.serverName));

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
