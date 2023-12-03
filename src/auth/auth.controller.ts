import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { AuthDto } from './dto';
import { Tokens } from './types';
import { AuthGuard } from '@nestjs/passport';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('local/signup')
  @HttpCode(HttpStatus.CREATED)
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
  @HttpCode(HttpStatus.OK)
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
        path: '/auth/refresh',
      })
      .send(tokens);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('local/reset')
  @HttpCode(HttpStatus.OK)
  async resetPassLocal(
    @Body() dto: AuthDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const tokens = await this.authService.resetPassLocal(dto);
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

  @UseGuards(AuthGuard('jwt'))
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  logout(@Req() req: Request) {
    const user = req.user;
    return this.authService.logout(+user['sub']);
  }

  @UseGuards(AuthGuard('jwt-refresh'))
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refreshTokens(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const user = req.user;
    const tokens = await this.authService.refreshToken(
      +user['sub'],
      req.cookies.refreshToken,
    );
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
}
