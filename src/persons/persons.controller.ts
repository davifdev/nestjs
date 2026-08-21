import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
} from '@nestjs/common';
import { PersonsService } from './persons.service';
import { CreatePersonDto } from './dto/create-person.dto';
import { UpdatePersonDto } from './dto/update-person.dto';
import { AuthTokenGuard } from '../auth/guards/auth-token.guard';
import { type Request } from 'express';
import { REQUEST_TOKEN_PAYLOAD_KEY } from '../auth/constants/auth.constants';
import { TokenPayloadParam } from '../auth/params/token-payload.param';
import { TokenPayloadDto } from '../auth/dto/token-payload.dto';
@Controller('persons')
export class PersonsController {
  constructor(private readonly personsService: PersonsService) {}

  @Post()
  create(@Body() createPersonDto: CreatePersonDto) {
    return this.personsService.create(createPersonDto);
  }

  @UseGuards(AuthTokenGuard)
  @Get(':id')
  findOne(@Param('id') id: string, @Req() req: Request) {
    console.log(req[REQUEST_TOKEN_PAYLOAD_KEY]);
    return this.personsService.findOne(+id);
  }

  @UseGuards(AuthTokenGuard)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updatePersonDto: UpdatePersonDto,
    @TokenPayloadParam() tokenPayload: TokenPayloadDto,
  ) {
    return this.personsService.update(+id, updatePersonDto, tokenPayload);
  }

  @UseGuards(AuthTokenGuard)
  @Delete(':id')
  remove(
    @Param('id') id: string,
    @TokenPayloadParam() tokenPayload: TokenPayloadDto,
  ) {
    return this.personsService.remove(+id, tokenPayload);
  }
}
