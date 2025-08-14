import { Module, Logger } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtService } from './jwt.service'; // Import JwtService

@Module({
  imports: [ConfigModule],
  providers: [Logger, JwtService],
  exports: [JwtService],
})
export class AuthModule {}
