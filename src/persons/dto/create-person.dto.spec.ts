import { validate } from 'class-validator';
import { CreatePersonDto } from './create-person.dto';

describe('CreatePersonDto', () => {
  it('should verify if DTO is valid', async () => {
    const dto = new CreatePersonDto();
    dto.email = 'jane@gmail.com';
    dto.password = 'password123';
    dto.name = 'Jane Doe';

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should verify if name is empty', async () => {
    const dto = new CreatePersonDto();
    dto.email = 'jane@gmail.com';
    dto.password = 'password123';
    dto.name = '';

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('name');
  });

  it('should verify if email is valid', async () => {
    const dto = new CreatePersonDto();
    dto.email = 'invalid_format';
    dto.password = 'password123';
    dto.name = 'Jane';

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('email');
  });

  it('should verify if password is curt', async () => {
    const dto = new CreatePersonDto();
    dto.email = 'jane@gmail.com';
    dto.password = '123';
    dto.name = 'Jane';

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('password');
  });
});
