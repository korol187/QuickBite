import { IsString, IsNotEmpty, IsOptional, IsArray } from 'class-validator';

export class CreateRestaurantDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  address: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  cuisine?: string[];
}
