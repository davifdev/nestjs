/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/unbound-method */
import { Repository } from 'typeorm';
import { PersonsService } from './persons.service';
import { Person } from './entities/person.entity';
import { HashingServiceProtocol } from '../auth/hashing/hashing.service';
import { Test, TestingModule } from '@nestjs/testing';
import { CreatePersonDto } from './dto/create-person.dto';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConflictException } from '@nestjs/common';

describe('PersonsService', () => {
  let personService: PersonsService;
  let personRepository: Repository<Person>;
  let hashingService: HashingServiceProtocol;
  const createPersonDto: CreatePersonDto = {
    email: 'john@gmail.com',
    name: 'John',
    password: '84283886',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PersonsService,
        {
          provide: getRepositoryToken(Person),
          useValue: {
            save: jest.fn(),
            create: jest.fn(),
          },
        },
        { provide: HashingServiceProtocol, useValue: { hash: jest.fn() } },
      ],
    }).compile();

    personService = module.get<PersonsService>(PersonsService);
    personRepository = module.get<Repository<Person>>(
      getRepositoryToken(Person),
    );
    hashingService = module.get<HashingServiceProtocol>(HashingServiceProtocol);
  });

  it('personService should be defined', () => {
    expect(PersonsService).toBeDefined();
  });

  describe('create()', () => {
    it('should create a new person', async () => {
      const passwordHash = 'hash_password';
      const newPerson = {
        id: 1,
        name: createPersonDto.name,
        email: createPersonDto.email,
        passwordHash,
      };

      jest.spyOn(hashingService, 'hash').mockResolvedValue(passwordHash);
      jest.spyOn(personRepository, 'create').mockReturnValue(newPerson as any);

      const result = await personService.create(createPersonDto);

      expect(hashingService.hash).toHaveBeenCalledWith(
        createPersonDto.password,
      );
      expect(personRepository.create).toHaveBeenCalledWith({
        name: createPersonDto.name,
        email: createPersonDto.email,
        passwordHash,
      });
      expect(personRepository.save).toHaveBeenCalledWith(newPerson);
      expect(result).toEqual(newPerson);
    });

    it('should throw ConflictException when email exist', async () => {
      jest.spyOn(personRepository, 'save').mockRejectedValue({ code: '23505' });

      await expect(personService.create(createPersonDto)).rejects.toThrow(
        ConflictException,
      );
    });
  });
});
