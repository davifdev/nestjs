import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConceptsManualModule } from '../concepts-manual/concepts-manual.module';
import { ConceptsAutomaticModule } from '../concepts-automatic/concepts-automatic.module';
@Module({
  imports: [ConceptsManualModule, ConceptsAutomaticModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
