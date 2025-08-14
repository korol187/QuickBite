import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  UnauthorizedException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { JwtService } from '../../auth/jwt.service'; // Import the new JwtService

@Injectable()
export class JwtAuthInterceptor implements NestInterceptor {
  constructor(private readonly jwtService: JwtService) {}

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('No token provided');
    }

    const token = authHeader.split(' ')[1];

    try {
      const payload = await this.jwtService.verify(token);
      request.user = payload; // Attach user payload to the request
      return next.handle();
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }
}
