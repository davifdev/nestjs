import {
  IsBoolean,
  IsNotEmpty,
  IsPositive,
  IsString,
  MinLength,
} from 'class-validator';
export class CreateMessageDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(3, { message: 'text must be at least 3 characters' })
  public readonly text: string;

  @IsPositive()
  public readonly fromId: number;

  @IsPositive()
  public readonly toId: number;

  @IsBoolean()
  @IsNotEmpty()
  isRead: boolean = false;
}
