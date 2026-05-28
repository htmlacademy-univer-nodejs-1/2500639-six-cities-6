import { ArrayMaxSize, ArrayMinSize, IsArray, IsBoolean, IsDateString, IsDefined, IsEnum, IsInt, IsNotEmpty, IsNumber, IsObject, IsString, Max, MaxLength, Min, MinLength, ValidateNested } from 'class-validator';
import { CityName, Conveniences, Location, OfferType } from '../../../types/index.js';
import { OfferValidationMessage } from './create-offer.messages.js';
import { Type } from 'class-transformer';
import { LocationDto } from './location.dto.js';


export class CreateOfferDto {
  @MinLength(10, {message: OfferValidationMessage.title.minLength})
  @MaxLength(100, {message: OfferValidationMessage.title.maxLength})
  @IsString({message: OfferValidationMessage.title.invalidFormat})
  public title!: string;

  @MinLength(20, {message: OfferValidationMessage.description.minLength})
  @MaxLength(1024, {message: OfferValidationMessage.description.maxLength})
  @IsString({message: OfferValidationMessage.description.invalidFormat})
  public description!: string;

  @IsDateString({}, {message: OfferValidationMessage.datePublication.invalidFormat})
  public datePublication!: Date;

  @IsEnum(CityName, {message: OfferValidationMessage.city.invalidFormat})
  public city!: string;

  @IsNotEmpty({message: OfferValidationMessage.previewPath.invalidFormat})
  @IsString({message: OfferValidationMessage.previewPath.invalidFormat})
  public previewPath!: string;

  @IsArray({message: OfferValidationMessage.images.invalidFormat})
  @ArrayMinSize(6, {message: OfferValidationMessage.images.countFiled})
  @ArrayMaxSize(6, {message: OfferValidationMessage.images.countFiled})
  @IsString({each: true, message: OfferValidationMessage.images.invalidFormat})
  public images!: string[];

  @IsBoolean({message: OfferValidationMessage.isPremium.invalidFormat})
  public isPremium!: boolean;

  @IsNumber({}, {message:  OfferValidationMessage.rating.invalidFormat})
  @Min(1, {message: OfferValidationMessage.rating.rangeField})
  @Max(5, {message: OfferValidationMessage.rating.rangeField})
  public rating!: number;

  @IsEnum(OfferType, {message: OfferValidationMessage.type.invalidFormat})
  public type!: OfferType;

  @IsInt({message: OfferValidationMessage.countRoom.invalidFormat})
  @Min(1, {message: OfferValidationMessage.countRoom.min})
  @Max(8, {message: OfferValidationMessage.countRoom.max})
  public countRoom!: number;

  @IsInt({message: OfferValidationMessage.countGuest.invalidFormat})
  @Min(1, {message: OfferValidationMessage.countGuest.min})
  @Max(10, {message: OfferValidationMessage.countGuest.max})
  public countGuest!: number;

  @Min(100, {message: OfferValidationMessage.rentalPrice.min})
  @Max(100000, {message: OfferValidationMessage.rentalPrice.max})
  @IsInt({message: OfferValidationMessage.rentalPrice.invalidFormat})
  public rentalPrice!: number;

  @IsArray({message: OfferValidationMessage.conveniences.invalidFormat})
  @ArrayMinSize(1, {message: OfferValidationMessage.conveniences.invalidFormat})
  @IsEnum(Conveniences, {each: true, message: OfferValidationMessage.conveniences.invalidFormat})
  public conveniences!: Conveniences[];

  public authorId: string;

  @IsDefined({message: OfferValidationMessage.location.invalidFormat})
  @IsObject({message: OfferValidationMessage.location.invalidFormat})
  @ValidateNested({message:OfferValidationMessage.location.invalidFormat})
  @Type(() => LocationDto)
  public location!: Location;
}
