import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as jwt from 'jsonwebtoken';
@Injectable()
export class JwtService {
  // Renamed from JwtStrategy
  constructor(private configService: ConfigService) {}

  verify(token: string): string {
    try {
      const secret = this.configService.get<string>('JWT_SECRET') as string;
      return jwt.verify(token, secret) as string;
    } catch {
      throw new UnauthorizedException('Invalid token');
    }
  }
}
