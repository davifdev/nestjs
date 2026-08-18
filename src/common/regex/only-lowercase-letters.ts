import { RegexProtocol } from './regex.protocol';

export class OnlyLowercaseLettersRegex extends RegexProtocol {
  execute(str: string): string {
    return str.replace(/[^a-z]/g, '');
  }
}
