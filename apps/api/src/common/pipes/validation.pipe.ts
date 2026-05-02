import { Injectable, ValidationPipe, ValidationError } from '@nestjs/common';
import { BadRequestException } from '@nestjs/common';

@Injectable()
export class GlobalValidationPipe extends ValidationPipe {
  constructor() {
    super({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      exceptionFactory: (errors: ValidationError[]) => {
        const formatErrors = (errors: ValidationError[]): string[] => {
          let messages: string[] = [];
          for (const err of errors) {
            if (err.constraints) {
              messages.push(...Object.values(err.constraints));
            }
            if (err.children && err.children.length > 0) {
              messages.push(...formatErrors(err.children));
            }
          }
          return messages;
        };
        
        return new BadRequestException({
          message: 'Validation failed',
          errors: formatErrors(errors),
        });
      },
    });
  }
}
