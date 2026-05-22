import { ArrayMaxSize, ArrayMinSize, IsArray, IsBoolean, IsEnum, IsInt, IsNumber, IsOptional, IsString, Max, MaxLength, Min, MinLength, ValidateNested } from 'class-validator';
import { CityName, Conveniences, Location, OfferType } from '../../../types/index.js';
import { OfferValidationMessage } from './create-offer.messages.js';
import { Type } from 'class-transformer';
import { LocationDto } from './location.dto.js';

export class UpdateOfferDto{
  @IsOptional()
  @MinLength(10, {message: OfferValidationMessage.title.minLength})
  @MaxLength(100, {message: OfferValidationMessage.title.maxLength})
  @IsString({message: OfferValidationMessage.title.invalidFormat})
  public title?: string;

  @IsOptional()
  @MinLength(20, {message: OfferValidationMessage.description.minLength})
  @MaxLength(1024, {message: OfferValidationMessage.description.maxLength})
  @IsString({message: OfferValidationMessage.description.invalidFormat})
  public description?: string;

  @IsOptional()
  @IsEnum(CityName, {message: OfferValidationMessage.city.invalidFormat})
  public city?: string;

  @IsOptional()
  @IsString({message: OfferValidationMessage.previewPath.invalidFormat})
  public previewPath?: string;

  @IsOptional()
  @IsArray({message: OfferValidationMessage.images.invalidFormat})
  @ArrayMinSize(6, {message: OfferValidationMessage.images.countFiled})
  @ArrayMaxSize(6, {message: OfferValidationMessage.images.countFiled})
  @IsString({each: true, message: OfferValidationMessage.images.invalidFormat})
  public images?: string[];

  @IsOptional()
  @IsBoolean({message: OfferValidationMessage.isPremium.invalidFormat})
  public isPremium?: boolean;

  @IsOptional()
  @IsNumber({}, {message:  OfferValidationMessage.rating.invalidFormat})
  @Min(1, {message: OfferValidationMessage.rating.rangeField})
  @Max(5, {message: OfferValidationMessage.rating.rangeField})
  public rating?: number;

  @IsOptional()
  @IsEnum(OfferType, {message: OfferValidationMessage.type.invalidFormat})
  public type?: OfferType;

  @IsOptional()
  @IsInt({message: OfferValidationMessage.countRoom.invalidFormat})
  @Min(1, {message: OfferValidationMessage.countRoom.min})
  @Max(8, {message: OfferValidationMessage.countRoom.max})
  public countRoom?: number;

  @IsOptional()
  @IsInt({message: OfferValidationMessage.countGuest.invalidFormat})
  @Min(1, {message: OfferValidationMessage.countGuest.min})
  @Max(10, {message: OfferValidationMessage.countGuest.max})
  public countGuest?: number;

  @IsOptional()
  @Min(100, {message: OfferValidationMessage.rentalPrice.min})
  @Max(100000, {message: OfferValidationMessage.rentalPrice.max})
  @IsInt({message: OfferValidationMessage.rentalPrice.invalidFormat})
  public rentalPrice?: number;

  @IsOptional()
  @IsEnum(Conveniences, {message: OfferValidationMessage.conveniences.invalidFormat})
  @IsArray({message: OfferValidationMessage.conveniences.invalidFormat})
  @ArrayMinSize(1, {message: OfferValidationMessage.conveniences.invalidFormat})
  public conveniences?: Conveniences[];

  @IsOptional()
  @IsInt({message: OfferValidationMessage.commentCount.invalidFormat})
  @Min(0, {message: OfferValidationMessage.commentCount.invalidFormat})
  public commentCount?: number;

  @IsOptional()
  @ValidateNested({message:OfferValidationMessage.location.invalidFormat})
  @Type(() => LocationDto)
  public location?: Location;
}
