import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(private readonly config: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const apiKey = request.headers['x-api-key'];
    const validApiKey = this.config.get<string>('SERVICE_API_KEY');

    if (!validApiKey || apiKey !== validApiKey) {
      throw new UnauthorizedException('Invalid API Key');
    }
    return true;
  }
}
