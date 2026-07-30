import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
@Controller('home')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('say-hello')
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('example')
  example() {
    return 'Route Example';
  }
}
