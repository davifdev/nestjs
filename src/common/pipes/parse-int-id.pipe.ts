import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  PipeTransform,
} from '@nestjs/common';

@Injectable()
export class ParseIntIdPipe<T> implements PipeTransform {
  transform(value: T, metadata: ArgumentMetadata) {
    if (metadata.type !== 'param' || metadata.data !== 'messageId') {
      return value;
    }
    const parsedValue = Number(value);
    if (isNaN(parsedValue)) {
      throw new BadRequestException(
        'ParseIntIdPipe espera uma string númerica.',
      );
    }

    if (parsedValue < 0) {
      throw new BadRequestException(
        'ParsedIntPipe espera um número maior do que zero',
      );
    }

    return parsedValue;
  }
}
