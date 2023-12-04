import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User } from './entities';
import { AuthDto } from './dto';
import { Tokens } from './types';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async signupLocal(dto: AuthDto): Promise<Tokens> {
    const hash = await this.hashData(dto.password);
    const isRegistered = await this.userRepository.findOneBy({
      email: dto.email,
    });
    if (isRegistered) {
      throw new BadRequestException('Already existed');
    }

    const newUser = this.userRepository.create({
      email: dto.email,
      hash: hash,
    });
    const savedUser = await this.userRepository.save(newUser);
    const tokens = await this.generateTokens(savedUser.id, savedUser.email);
    await this.updateRtHash(savedUser.id, tokens.refresh_token);
    return tokens;
  }

  async signinLocal(dto: AuthDto): Promise<Tokens> {
    const user = await this.userRepository.findOneBy({
      email: dto.email,
    });
    if (!user) {
      throw new UnauthorizedException('Access denied');
    }
    const isVerifiedPassword = await bcrypt.compare(dto.password, user.hash);
    if (!isVerifiedPassword) {
      throw new ForbiddenException('Access denied');
    }
    const tokens = await this.generateTokens(user.id, user.email);
    await this.updateRtHash(user.id, tokens.refresh_token);
    return tokens;
  }

  async resetPassLocal(dto: AuthDto): Promise<Tokens> {
    const hash = await this.hashData(dto.password);
    const { id } = await this.userRepository.findOneBy({
      email: dto.email,
    });
    const user = await this.userRepository.preload({
      id: id,
      email: dto.email,
      hash: hash,
    });
    const savedUser = await this.userRepository.save(user);
    const tokens = await this.generateTokens(savedUser.id, savedUser.email);
    await this.updateRtHash(savedUser.id, tokens.refresh_token);
    return tokens;
  }

  async logout(userId: number) {
    const user = await this.userRepository.preload({
      id: userId,
      hashedRt: null,
    });
    if (!user) {
      throw new ForbiddenException();
    }
    await this.userRepository.save(user);
  }

  async refreshToken(id: number, rt: string): Promise<Tokens> {
    const user = await this.userRepository.findOneBy({
      id: id,
    });
    if (!user || user.hashedRt === null) {
      throw new ForbiddenException('Access denied');
    }
    const isVerifiedRt = await bcrypt.compare(rt, user.hashedRt);
    if (!isVerifiedRt) {
      throw new UnauthorizedException('Access denied');
    }
    const tokens = await this.generateTokens(user.id, user.email);
    await this.updateRtHash(user.id, tokens.refresh_token);
    return tokens;
  }

  hashData(data: string) {
    const saltRounds = +process.env.BCRYPT_SALT || 10;
    return bcrypt.hash(data, saltRounds);
  }

  async updateRtHash(userId: number, rt: string) {
    const hash = await this.hashData(rt);
    const user = await this.userRepository.preload({
      id: userId,
      hashedRt: hash,
    });
    if (!user) {
      throw new NotFoundException('in update hashrt');
    }
    await this.userRepository.save(user);
  }

  async generateTokens(userId: number, email: string): Promise<Tokens> {
    const [at, rt] = await Promise.all([
      this.jwtService.signAsync(
        {
          sub: userId,
          email: email,
        },
        {
          secret: process.env.AT_SECRET,
          expiresIn: process.env.AT_EXPIRES || 15,
        },
      ),
      this.jwtService.signAsync(
        {
          sub: userId,
          email: email,
        },
        {
          secret: process.env.RT_SECRET,
          expiresIn: '5d',
        },
      ),
    ]);
    return {
      access_token: at,
      refresh_token: rt,
    };
  }
}
