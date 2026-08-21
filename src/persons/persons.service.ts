import {
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
@Injectable()
export class PersonsService {
  constructor(
    @InjectRepository(Person)
    private readonly personRepository: Repository<Person>,
    private readonly hashingService: HashingServiceProtocol,
  ) {}

  async create(createPersonDto: CreatePersonDto) {
    const passwordHash = await this.hashingService.hash(
      createPersonDto.password,
    );
    const newPerson = {
      name: createPersonDto.name,
      email: createPersonDto.email,
      passwordHash,
      routePolicies: createPersonDto.routePolicies,
    };

    const person = this.personRepository.create(newPerson);
    return this.personRepository.save(person);
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
    console.log(id, tokenPayload.sub);
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
    const personExists = await this.personRepository.findOne({
      where: { id },
    });

    if (!personExists)
      throw new NotFoundException(`Person with id ${id} not found`);

    this.personRepository.remove(personExists);

    return personExists;
  }
}
