import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './jwt.strategy';
import { EmailModule } from '../email/email.module';
import { NavigationModule } from '../navigation/navigation.module';

@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret:      process.env.JWT_SECRET || 'dev_secret_change_in_production_min32chars',
      signOptions: { expiresIn: (process.env.JWT_EXPIRES_IN || '1h') as any },
    }),
    EmailModule,
    NavigationModule,
  ],
  controllers: [AuthController],
  providers:   [AuthService, JwtStrategy],
  exports:     [JwtStrategy, PassportModule, NavigationModule],
})
export class AuthModule {}
