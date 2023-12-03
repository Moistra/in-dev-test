import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { Strategy, ExtractJwt } from 'passport-jwt';

@Injectable()
export class AtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor() {
    super({
      secretOrKey: process.env.AT_SECRET, //different secret for refresh and access tokens
      ignoreExpiration: false,
      jwtFromRequest: ExtractJwt.fromExtractors([
        // (req: Request) => {
        //   const data = req?.cookies['accessToken'];
        //   if (!data) {
        //     return null;
        //   }
        //   return data.token;
        // },
        (req: Request) => {
          if (
            req.cookies &&
            'accessToken' in req.cookies &&
            req.cookies.user_token.length > 0
          ) {
            return req.cookies.token;
          }
          return null;
        },
      ]),
    });
  }

  private static extractJWT(req: Request): string | null {
    if (
      req.cookies &&
      'accessToken' in req.cookies &&
      req.cookies.user_token.length > 0
    ) {
      return req.cookies.token;
    }
    return null;
  }

  validate(payload: any) {
    if (payload === null) {
      throw new UnauthorizedException();
    }
    return payload;
  }
}
