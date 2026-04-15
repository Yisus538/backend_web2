import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { NavService } from './nav.service';
import { JwtStrategy } from './jwt.strategy';
import { EmailModule } from '../email/email.module';

@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret:      process.env.JWT_SECRET || 'dev_secret_change_in_production_min32chars',
      signOptions: { expiresIn: process.env.JWT_EXPIRES_IN || '1h' },
    }),
    EmailModule,
  ],
  controllers: [AuthController],
  providers:   [AuthService, NavService, JwtStrategy],
  exports:     [JwtStrategy, PassportModule],
})
export class AuthModule {}
