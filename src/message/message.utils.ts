import { Injectable } from '@nestjs/common';

@Injectable()
export class MessageUtils {
  inverterString(str: string) {
    return str.split('').reverse().join('');
  }
}

@Injectable()
export class MessageUtilsMock {
  inverterString(str: string) {
    return str.split('').reverse().join('');
  }
}
