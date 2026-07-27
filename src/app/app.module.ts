import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConceptsManualModule } from '../concepts-manual/concepts-manual.module';

@Module({
  imports: [ConceptsManualModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
