import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { Strategy, ExtractJwt } from 'passport-jwt';

@Injectable()
export class RtStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor() {
    super({
      secretOrKey: process.env.RT_SECRET, //different secret for refresh and access tokens
      ignoreExpiration: false,
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: Request) => {
          if (
            req.cookies &&
            'refreshToken' in req.cookies &&
            req.cookies.refreshToken.length > 0
          ) {
            return req.cookies.refreshToken;
          }
          return null;
        },
      ]),
    });
  }
  validate(payload: any) {
    if (payload === null) {
      throw new UnauthorizedException();
    }
    return payload;
  }
}
