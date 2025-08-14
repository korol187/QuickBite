import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateRestaurantDto } from '../dto/create-restaurant.dto';
import { UpdateRestaurantDto } from '../dto/update-restaurant.dto';
import { Restaurant, RestaurantDocument } from '../schemas/restaurant.schema';

@Injectable()
export class RestaurantRepository {
  constructor(
    @InjectModel(Restaurant.name)
    private readonly restaurantModel: Model<RestaurantDocument>,
  ) {}

  create(createRestaurantDto: CreateRestaurantDto): Promise<Restaurant> {
    const newRestaurant = new this.restaurantModel(createRestaurantDto);
    return newRestaurant.save();
  }

  findAll(): Promise<Restaurant[]> {
    return this.restaurantModel.find().exec();
  }

  findById(id: string): Promise<Restaurant> {
    return this.restaurantModel.findById(id).exec();
  }

  update(id: string, updateRestaurantDto: UpdateRestaurantDto): Promise<Restaurant> {
    return this.restaurantModel.findByIdAndUpdate(id, updateRestaurantDto, { new: true }).exec();
  }

  remove(id: string): Promise<Restaurant> {
    return this.restaurantModel.findByIdAndDelete(id).exec();
  }
}
