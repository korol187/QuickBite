import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_INTERCEPTOR } from '@nestjs/core'; // Re-added this line
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AuthModule } from './auth/auth.module';
import { JwtService } from './auth/jwt.service'; // Import the new JwtService
import { JwtAuthInterceptor } from './common/interceptors/jwt-auth.interceptor'; // Re-added this import
import { RestaurantsModule } from './restaurants/restaurants.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('DATABASE_URL'),
      }),
      inject: [ConfigService],
    }),
    AuthModule,
    RestaurantsModule,
  ],
  controllers: [AppController],
  providers: [
    JwtService, // Provide JwtService
    {
      provide: APP_INTERCEPTOR,
      useClass: JwtAuthInterceptor, // Re-register JwtAuthInterceptor globally
    },
  ],
})
export class AppModule {}
