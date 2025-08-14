import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  UseGuards,
  // UseInterceptors, // Removed this import
} from '@nestjs/common';
// import { AuthGuard } from '@nestjs/passport'; // Removed this import
import { RestaurantsService } from './restaurants.service';
import { CreateRestaurantDto } from './dto/create-restaurant.dto';
import { UpdateRestaurantDto } from './dto/update-restaurant.dto';
import { Restaurant } from './schemas/restaurant.schema';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
// import { JwtAuthInterceptor } from '../common/interceptors/jwt-auth.interceptor'; // Removed this import

@Controller('restaurants')
@UseGuards(RolesGuard) // Only RolesGuard remains
// @UseInterceptors(JwtAuthInterceptor) // Removed this line
export class RestaurantsController {
  constructor(private readonly restaurantsService: RestaurantsService) {}

  @Post()
  @Roles('ADMIN') // Only ADMIN can create
  create(@Body() createRestaurantDto: CreateRestaurantDto): Promise<Restaurant> {
    return this.restaurantsService.create(createRestaurantDto);
  }

  @Get()
  @Roles('ADMIN', 'USER') // ADMIN and USER can view all
  findAll() {
    return this.restaurantsService.findAll();
  }

  @Get(':id')
  @Roles('ADMIN', 'USER') // ADMIN and USER can view single
  findOne(@Param('id') id: string): Promise<Restaurant> {
    return this.restaurantsService.findOne(id);
  }

  @Patch(':id')
  @Roles('ADMIN') // Only ADMIN can update
  update(
    @Param('id') id: string,
    @Body() updateRestaurantDto: UpdateRestaurantDto,
  ): Promise<Restaurant> {
    return this.restaurantsService.update(id, updateRestaurantDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<Restaurant> {
    return this.restaurantsService.remove(id);
  }
}

