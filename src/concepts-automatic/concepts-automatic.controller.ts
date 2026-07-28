import { Controller, Get } from '@nestjs/common';
import { ConceptsAutomaticService } from './concepts-automatic.service';

@Controller('concepts-automatic')
export class ConceptsAutomaticController {
  constructor(
    private readonly conceptsAutomaticService: ConceptsAutomaticService,
  ) {}

  @Get()
  home(): string {
    return this.conceptsAutomaticService.exampleServiceMethod();
  }
}
