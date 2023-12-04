import { RtGuard } from './common/guards/rt.guard';
import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Patch,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { AuthDto } from './dto';
import {
  GetCurrentReqCookies,
  GetCurrentUserId,
  Public,
} from './common/decorators';
import {
  ApiCookieAuth,
  ApiTags,
  ApiForbiddenResponse,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

@ApiCookieAuth()
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiBadRequestResponse({ description: 'Already existed' })
  @ApiTags('public routes')
  @Public()
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
  }

  @ApiUnauthorizedResponse({ description: 'rotten/corrupt access token' })
  @ApiForbiddenResponse({ description: 'wrong user data' })
  @ApiTags('public routes')
  @Public()
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

  @ApiUnauthorizedResponse({ description: 'rotten/corrupt access token' })
  @ApiTags('via access token')
  @Patch('local/reset')
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

  @ApiTags('via access token')
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  logout(@GetCurrentUserId() userId: number) {
    return this.authService.logout(userId);
  }

  @ApiForbiddenResponse({ description: 'user was logout before' })
  @ApiUnauthorizedResponse({ description: 'rotten/corrupt refresh token' })
  @ApiTags('via refresh token')
  @Public()
  @UseGuards(RtGuard)
  @Get('refresh')
  @HttpCode(HttpStatus.OK)
  async refreshTokens(
    @GetCurrentUserId() userId: number,
    @GetCurrentReqCookies() cookies,
    @Res({ passthrough: true }) res: Response,
  ) {
    const tokens = await this.authService.refreshToken(
      userId,
      cookies.refreshToken as string,
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
