/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/unbound-method */
import { Repository } from 'typeorm';
import { PersonsService } from './persons.service';
import { Person } from './entities/person.entity';
import { HashingServiceProtocol } from '../auth/hashing/hashing.service';
import { Test, TestingModule } from '@nestjs/testing';
import { CreatePersonDto } from './dto/create-person.dto';
import { getRepositoryToken } from '@nestjs/typeorm';
import {
  ConflictException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';

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
            find: jest.fn(),
            findOne: jest.fn(),
            preload: jest.fn(),
            remove: jest.fn(),
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

    it('should throw Errror when occurs on error', async () => {
      jest
        .spyOn(personRepository, 'save')
        .mockRejectedValue(new Error('generic err'));

      await expect(personService.create(createPersonDto)).rejects.toThrow(
        new Error('generic err'),
      );
    });
  });
  describe('findOne()', () => {
    it('should return person if person is found', async () => {
      const id = 1;
      const personFound = { id, ...createPersonDto };

      jest
        .spyOn(personService, 'findOne')
        .mockResolvedValue(personFound as any);

      const result = await personService.findOne(id);

      expect(result).toStrictEqual(personFound);
    });

    it('should throw NotFoundException when person not found', async () => {
      const id = 1;
      await expect(personService.findOne(id)).rejects.toThrow(
        new NotFoundException(`Person with id ${id} not found`),
      );
    });
  });
  describe('update()', () => {
    it('should update person if authorized person', async () => {
      const personId = 1;
      const updatePersonDto = { name: 'Jane', password: '123456' };
      const tokenPayload = { sub: personId };
      const passwordHash = 'any_hash';
      const updatePerson = { name: 'Jane', password: '123456' };

      jest.spyOn(hashingService, 'hash').mockResolvedValue(passwordHash);
      jest
        .spyOn(personRepository, 'preload')
        .mockResolvedValue(updatePerson as any);
      jest
        .spyOn(personRepository, 'save')
        .mockResolvedValue(updatePerson as any);

      const result = await personService.update(
        personId,
        updatePersonDto,
        tokenPayload as any,
      );

      expect(result).toStrictEqual(updatePerson);
      expect(hashingService.hash).toHaveBeenCalledWith(
        updatePersonDto.password,
      );
      expect(personRepository.preload).toHaveBeenCalledWith({
        id: personId,
        name: updatePersonDto.name,
        passwordHash,
      });
      expect(personRepository.save).toHaveBeenCalledWith(updatePerson);
    });

    it('should throw NotFoundException if unauthorized user', async () => {
      const personId = 1;
      const tokenPayload = { sub: personId } as any;
      const updatePersonDto = { name: 'Jane Doe' };

      jest.spyOn(personRepository, 'preload').mockResolvedValue(null as any);

      await expect(
        personService.update(personId, updatePersonDto, tokenPayload),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw UnauthorizedException if user not authorized', async () => {
      const personId = 1;
      const tokenPayload = { sub: 2 } as any;
      const updatePersonDto = { name: 'Jane Doe' };

      await expect(
        personService.update(personId, updatePersonDto, tokenPayload),
      ).rejects.toThrow(UnauthorizedException);
    });
  });
  describe('remove()', () => {
    it('should remove on person if authorized', async () => {
      const personId = 1;
      const tokenPayload = { sub: personId } as any;
      const existPerson = { id: personId, name: 'Jane Doe' };

      jest
        .spyOn(personService, 'findOne')
        .mockResolvedValue(existPerson as any);
      jest
        .spyOn(personRepository, 'remove')
        .mockResolvedValue(existPerson as any);

      const result = await personService.remove(personId, tokenPayload);

      expect(personService.findOne).toHaveBeenCalledWith(personId);
      expect(personRepository.remove).toHaveBeenCalledWith(existPerson);
      expect(result).toEqual(existPerson);
    });
  });
});
