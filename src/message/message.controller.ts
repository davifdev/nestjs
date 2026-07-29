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

@Controller('message')
export class MessageController {
  @HttpCode(HttpStatus.OK)
  @Get()
  findAll(@Query() pagination: { limit: string; offset: string }) {
    const { limit = 10, offset = 0 } = pagination;
    return `This route returned all messages limit: ${limit} offset: ${offset}`;
  }

  @HttpCode(HttpStatus.OK)
  @Get(':messageId')
  findOne(@Param('messageId') messageId: string) {
    return `This route returned unique message with id: ${messageId}`;
  }

  @HttpCode(HttpStatus.CREATED)
  @Post()
  create(@Body() body: { message: string; new_key: string }) {
    console.log(body);
    return `This route create on message`;
  }

  @HttpCode(HttpStatus.OK)
  @Patch(':messageId')
  update(
    @Param('messageId') messageId: string,
    @Body() body: { message?: string; new_key?: string },
  ) {
    console.log('messageId: ', messageId);
    console.log('body: ', body);
    return {
      messageId,
      ...body,
    };
  }

  @HttpCode(HttpStatus.OK)
  @Delete(':messageId')
  delete(@Param('messageId') messageId: string) {
    console.log('messageId: ', messageId);
    return `Message with id: ${messageId} was deleted success.`;
  }
}
