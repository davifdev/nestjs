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
  UseGuards,
} from '@nestjs/common';
import { MessageService } from './message.service';
import { CreateMessageDto } from './dto/create-message-dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { PaginationDto } from '../common/dto/pagination.dto';

import { AuthTokenGuard } from '../auth/guards/auth-token.guard';
import { TokenPayloadDto } from '../auth/dto/token-payload.dto';
import { TokenPayloadParam } from '../auth/params/token-payload.param';
import { RoutePolicyGuard } from '../auth/guards/route-policy.guard';
import { SetRoutePolicy } from '../auth/decorator/set-route-policy.decorator';
import { RoutePolicies } from '../auth/enum/route-policies.enum';
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
  findOne(@Param('messageId') messageId: number) {
    return this.messageService.findOne(messageId);
  }

  @UseGuards(AuthTokenGuard, RoutePolicyGuard)
  @HttpCode(HttpStatus.CREATED)
  @SetRoutePolicy(RoutePolicies.createMessage)
  @Post()
  create(
    @Body() createMessageDto: CreateMessageDto,
    @TokenPayloadParam() tokenPayloadDto: TokenPayloadDto,
  ) {
    return this.messageService.create(createMessageDto, tokenPayloadDto);
  }

  @UseGuards(AuthTokenGuard, RoutePolicyGuard)
  @HttpCode(HttpStatus.OK)
  @SetRoutePolicy(RoutePolicies.updateMessage)
  @Patch(':messageId')
  update(
    @Param('messageId') messageId: number,
    @Body() updateMessadeDto: UpdateMessageDto,
    @TokenPayloadParam() tokenPayload: TokenPayloadDto,
  ) {
    return this.messageService.update(
      messageId,
      updateMessadeDto,
      tokenPayload,
    );
  }

  @UseGuards(AuthTokenGuard, RoutePolicyGuard)
  @HttpCode(HttpStatus.OK)
  @SetRoutePolicy(RoutePolicies.deleteMessage)
  @Delete(':messageId')
  delete(
    @Param('messageId') messageId: number,
    @TokenPayloadParam() tokenPayload: TokenPayloadDto,
  ) {
    return this.messageService.remove(messageId, tokenPayload);
  }
}
