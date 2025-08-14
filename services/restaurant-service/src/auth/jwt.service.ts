import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as jwt from 'jsonwebtoken'; // Import jsonwebtoken

@Injectable()
export class JwtService {
  // Renamed from JwtStrategy
  constructor(private configService: ConfigService) {}

  verify(token: string): Promise<any> {
    try {
      const secret = this.configService.get<string>('JWT_SECRET');
      return jwt.verify(token, secret);
    } catch {
      throw new UnauthorizedException('Invalid token');
    }
  }
}
