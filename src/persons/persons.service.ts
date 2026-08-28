import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreatePersonDto } from './dto/create-person.dto';
import { UpdatePersonDto } from './dto/update-person.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Person } from './entities/person.entity';
import { HashingServiceProtocol } from '../auth/hashing/hashing.service';
import { TokenPayloadDto } from '../auth/dto/token-payload.dto';
import path from 'path';
import fs from 'fs/promises';

@Injectable()
export class PersonsService {
  constructor(
    @InjectRepository(Person)
    private readonly personRepository: Repository<Person>,
    private readonly hashingService: HashingServiceProtocol,
  ) {}

  async create(createPersonDto: CreatePersonDto) {
    try {
      const passwordHash = await this.hashingService.hash(
        createPersonDto.password,
      );

      const newPerson = {
        name: createPersonDto.name,
        email: createPersonDto.email,
        passwordHash,
      };

      const person = this.personRepository.create(newPerson);
      await this.personRepository.save(person);

      return person;
    } catch (error) {
      if (
        error &&
        typeof error === 'object' &&
        'code' in error &&
        error.code === '23505'
      ) {
        throw new ConflictException('Email já está cadastrado');
      }

      throw error;
    }
  }

  async findOne(id: number) {
    const person = await this.personRepository.findOne({
      where: { id },
      relations: {
        sendsMenssage: true,
        receivesMessage: true,
      },
    });

    if (!person) throw new NotFoundException(`Person with id ${id} not found`);

    return person;
  }

  async update(
    id: number,
    updatePersonDto: UpdatePersonDto,
    tokenPayload: TokenPayloadDto,
  ) {
    if (id !== tokenPayload.sub) {
      throw new UnauthorizedException('User not Authorized for update');
    }

    const partialPersonDto = {
      name: updatePersonDto?.name,
      passwordHash: updatePersonDto?.password,
    };

    if (updatePersonDto?.password) {
      const passwordHash = await this.hashingService.hash(
        updatePersonDto.password,
      );

      partialPersonDto['passwordHash'] = passwordHash;
    }

    const person = await this.personRepository.preload({
      id,
      ...partialPersonDto,
    });

    if (!person) throw new NotFoundException(`Person with id ${id} not found`);

    return await this.personRepository.save(person);
  }

  async remove(id: number, tokenPayload: TokenPayloadDto) {
    if (id !== tokenPayload.sub) {
      throw new UnauthorizedException('User not Authorized for delete');
    }
    const personExists = await this.findOne(id);

    if (!personExists)
      throw new NotFoundException(`Person with id ${id} not found`);

    this.personRepository.remove(personExists);

    return personExists;
  }

  async uploadPicture(picture: any, tokenPayload: TokenPayloadDto) {
    if (picture.size < 1024) {
      throw new BadRequestException('File to small');
    }

    const person = await this.findOne(tokenPayload.sub);
    const fileExtension = path
      .extname(picture.originalname)
      .toLowerCase()
      .substring(1);
    const fileName = `${tokenPayload.sub}.${fileExtension}`;
    const fileFullPath = path.resolve(process.cwd(), 'images', fileName);

    await fs.writeFile(fileFullPath, picture.buffer);

    person.picture = fileName;

    await this.personRepository.save(person);

    return person;
  }
}
