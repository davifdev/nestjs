/* eslint-disable @typescript-eslint/no-unsafe-argument */

import { TokenPayloadDto } from '../auth/dto/token-payload.dto';
import { CreatePersonDto } from './dto/create-person.dto';
import { PersonsController } from './persons.controller';

describe('PersonController', () => {
  let controller: PersonsController;
  const personServiceMock = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    uploadPicture: jest.fn(),
  };

  beforeEach(() => {
    controller = new PersonsController(personServiceMock as any);
  });

  const personDto: CreatePersonDto = {
    email: 'jane@gmail.com',
    name: 'Jane doe',
    password: 'password',
  };

  describe('create()', () => {
    it('should call personService.create() with correctly arguments ', async () => {
      jest.spyOn(personServiceMock, 'create').mockResolvedValue(personDto);

      const result = await controller.create(personDto);

      expect(personServiceMock.create).toHaveBeenCalledWith(personDto);
      expect(result).toStrictEqual(personDto);
    });
  });

  describe('findOne', () => {
    it('should call personService.findOne() with correctly arguments', async () => {
      const id = 1;
      const tokenPayload: TokenPayloadDto = {
        email: 'jane@gmail.com',
        sub: id,
        iat: Date.now(),
        exp: Date.now(),
        aud: 'any_aud',
        iss: 'any_iss',
      };
      const request = {
        tokenPayload,
      } as any;

      const personReturned = { id, ...personDto };

      jest
        .spyOn(personServiceMock, 'findOne')
        .mockResolvedValue(personReturned);

      const result = await controller.findOne(String(id), request);

      expect(personServiceMock.findOne).toHaveBeenCalledWith(id);
      expect(result).toStrictEqual(personReturned);
    });
  });

  describe('update()', () => {
    it('should call personService.update() with correctly arguments', async () => {
      const id = '1';
      const body = { name: 'Jane' } as any;
      const tokenPayload: TokenPayloadDto = {
        email: 'jane@gmail.com',
        sub: +id,
        iat: Date.now(),
        exp: Date.now(),
        aud: 'any_aud',
        iss: 'any_iss',
      };
      const request = {
        tokenPayload,
      } as any;

      jest.spyOn(personServiceMock, 'update').mockResolvedValue(personDto);

      const result = await controller.update(id, body, request);

      expect(result).toStrictEqual(personDto);
      expect(personServiceMock.update).toHaveBeenCalledWith(+id, body, request);
    });
  });

  describe('remove()', () => {
    it('should call personService.remove() with correctly arguments', async () => {
      const id = '1';
      const tokenPayload: TokenPayloadDto = {
        email: 'jane@gmail.com',
        sub: +id,
        iat: Date.now(),
        exp: Date.now(),
        aud: 'any_aud',
        iss: 'any_iss',
      };
      const request = {
        tokenPayload,
      } as any;

      jest.spyOn(personServiceMock, 'remove').mockResolvedValue(personDto);

      const result = await controller.remove(id, request);

      expect(result).toStrictEqual(personDto);
      expect(personServiceMock.remove).toHaveBeenCalledWith(+id, request);
    });
  });

  describe('uploadPicture', () => {
    it('should call personService.uploadPicture() with correctly arguments', async () => {
      const arg1 = { aKey: 'aValue' } as any;
      const arg2 = { bKey: 'bValue' } as any;
      const expected = { anyKey: 'anyValue' };

      jest
        .spyOn(personServiceMock, 'uploadPicture')
        .mockResolvedValue(expected);

      const result = await controller.uploadPicture(arg1, arg2);

      expect(personServiceMock.uploadPicture).toHaveBeenCalledWith(arg1, arg2);
      expect(result).toStrictEqual(expected);
    });
  });
});
