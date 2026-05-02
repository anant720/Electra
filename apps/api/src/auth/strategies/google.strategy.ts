import { Injectable, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback, Profile } from 'passport-google-oauth20';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  private readonly logger = new Logger(GoogleStrategy.name);

  constructor(config: ConfigService) {
    const clientID = config.get<string>('GOOGLE_CLIENT_ID');
    const clientSecret = config.get<string>('GOOGLE_CLIENT_SECRET');
    const callbackURL = config.get<string>('GOOGLE_CALLBACK_URL');

    if (!clientID || clientID === 'PLACEHOLDER_NOT_CONFIGURED') {
      throw new Error('[ELECTRA] FATAL: GOOGLE_CLIENT_ID is missing or placeholder. Set in environment variables.');
    }
    if (!clientSecret || clientSecret === 'PLACEHOLDER_NOT_CONFIGURED') {
      throw new Error('[ELECTRA] FATAL: GOOGLE_CLIENT_SECRET is missing or placeholder. Set in environment variables.');
    }
    if (!callbackURL) {
      throw new Error('[ELECTRA] FATAL: GOOGLE_CALLBACK_URL is missing. Set in environment variables.');
    }

    super({
      clientID,
      clientSecret,
      callbackURL,
      scope: ['email', 'profile'],
    });
  }

  validate(accessToken: string, refreshToken: string, profile: Profile, done: VerifyCallback) {
    const { id, emails, displayName, photos } = profile;

    if (!emails || !emails[0]?.value) {
      done(new Error('Google profile did not return an email address.'), false as any);
      return;
    }

    const user = {
      googleId: id,
      email: emails[0].value,
      name: displayName ?? '',
      avatar: photos?.[0]?.value ?? null,
    };

    done(null, user);
  }
}
