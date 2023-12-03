import { Body, Controller, Post, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { AuthDto } from './dto';
import { Tokens } from './types';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('local/signup')
  async signupLocal(
    @Body() dto: AuthDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const tokens = await this.authService.signupLocal(dto);
    res
      .cookie('accessToken', tokens.access_token, {
        httpOnly: true,
      })
      .cookie('refreshToken', tokens.refresh_token, {
        httpOnly: true,
        path: 'auth/refresh',
      })
      .send(tokens);
    // return this.authService.signupLocal(dto);
  }

  @Post('local/signin')
  async signinLocal(
    @Body() dto: AuthDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const tokens = await this.authService.signinLocal(dto);
    res
      .cookie('accessToken', tokens.access_token, {
        httpOnly: true,
      })
      .cookie('refreshToken', tokens.refresh_token, {
        httpOnly: true,
        path: 'auth/refresh',
      })
      .send(tokens);
  }

  @Post('local/reset')
  resetPassLocal() {
    return this.authService.resetPassLocal();
  }

  @Post('logout')
  logout() {
    return this.authService.logout();
  }

  @Post('refresh')
  refreshTokens() {
    return this.authService.refreshToken();
  }
}
