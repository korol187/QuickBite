import { Module, Logger } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from '../auth/auth.module'; // Added this line
import { RestaurantRepository } from './repositories/restaurant.repository';
import { RestaurantsController } from './restaurants.controller';
import { RestaurantsService } from './restaurants.service';
import { Restaurant, RestaurantSchema } from './schemas/restaurant.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Restaurant.name, schema: RestaurantSchema }]),
    AuthModule, // Import AuthModule
  ],
  controllers: [RestaurantsController],
  providers: [RestaurantsService, RestaurantRepository, Logger],
})
export class RestaurantsModule {}
