import { AtGuard } from './common/guards/at.guard';
import { RtGuard } from './common/guards/rt.guard';
import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { AuthDto } from './dto';
import { GetCurrentReqCookies, GetCurrentUserId } from './common/decorators';

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

  @UseGuards(AtGuard)
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

  @UseGuards(AtGuard)
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  logout(@GetCurrentUserId() userId: number) {
    return this.authService.logout(userId);
  }

  @UseGuards(RtGuard)
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refreshTokens(
    @GetCurrentUserId() userId: number,
    @GetCurrentReqCookies() cookies,
    @Res({ passthrough: true }) res: Response,
  ) {
    const tokens = await this.authService.refreshToken(
      userId,
      cookies.refreshToken,
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
