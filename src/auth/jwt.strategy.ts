import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy }                  from '@nestjs/passport';
import { ExtractJwt, Strategy }              from 'passport-jwt';
import { Request }                           from 'express';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: Request) => req?.cookies?.accessToken ?? null,
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
      ignoreExpiration: false,
      secretOrKey:
        process.env.JWT_SECRET || 'dev_secret_change_in_production_min32chars',
    });
  }

  validate(payload: any) {
    if (!payload?.userId) throw new UnauthorizedException('Token inválido');
    return {
      userId: payload.userId,
      email:  payload.email,
      role:   payload.role,
    };
  }
}