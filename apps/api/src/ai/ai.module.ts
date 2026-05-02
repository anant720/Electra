import { Module } from '@nestjs/common';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';
import { QueryClassifierService } from './query-classifier.service';
import { PromptAssemblerService } from './prompt-assembler.service';
import { SafetyMiddlewareService } from './safety-middleware.service';
import { AdminModule } from '../admin/admin.module';

@Module({
  imports: [AdminModule],
  controllers: [AiController],
  providers: [AiService, QueryClassifierService, PromptAssemblerService, SafetyMiddlewareService],
  exports: [AiService],
})
export class AiModule {}
