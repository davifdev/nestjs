import { IsBoolean, IsNotEmpty, IsString, MinLength } from 'class-validator';
export class CreateMessageDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(3, { message: 'text must be at least 3 characters' })
  public readonly text: string;

  @IsString()
  @IsNotEmpty()
  public readonly from: string;

  @IsString()
  @IsNotEmpty()
  public readonly to: string;

  @IsBoolean()
  @IsNotEmpty()
  isRead: boolean;
}
