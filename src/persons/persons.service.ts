import { Injectable, NotFoundException } from '@nestjs/common';
import { CreatePersonDto } from './dto/create-person.dto';
import { UpdatePersonDto } from './dto/update-person.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Person } from './entities/person.entity';
import { HashingServiceProtocol } from '../auth/hashing/hashing.service';
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

  async update(id: number, updatePersonDto: UpdatePersonDto) {
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

  async remove(id: number) {
    const personExists = await this.personRepository.findOne({
      where: { id },
    });

    if (!personExists)
      throw new NotFoundException(`Person with id ${id} not found`);

    this.personRepository.remove(personExists);

    return personExists;
  }
}
