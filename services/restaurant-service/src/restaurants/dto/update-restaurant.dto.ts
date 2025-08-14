import { IsString, IsOptional, IsArray } from 'class-validator';

export class UpdateRestaurantDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  cuisine?: string[];
}
