import { defaultClasses, getModelForClass, modelOptions, prop, Ref } from '@typegoose/typegoose';
import { Conveniences, OfferType } from '../../types/index.js';
import type { UserEntity } from '../user/user.entity.js';
import { CityName } from '../../types/city-name.enum.js';
import { LocationsSchema } from './locations.schema.js';

export interface OfferEntity extends defaultClasses.Base { }

@modelOptions({
  schemaOptions: {
    collection: 'offers',
    timestamps: true
  }
})
export class OfferEntity extends defaultClasses.TimeStamps {
  @prop({
    required: true,
    trim: true,
    minlength: 10,
    maxlength: 100
  })
  public title!: string;

  @prop({
    required: true,
    trim: true,
    minlength: 20,
    maxlength: 1024
  })
  public description!: string;

  @prop({
    required: true,
    default: () => new Date()
  })
  public datePublication!: Date;

  @prop({
    required: true,
    enum: CityName,
    type: () => String
  })
  public city!: CityName;

  @prop({
    required: true,
    trim: true
  })
  public previewPath!: string;

  @prop({
    required: true,
    type: () => [String]
  })
  public images!: string[];

  @prop({
    required: true,
    default: false
  })
  public isPremium!: boolean;

  @prop({
    required: true,
    default: false
  })
  public isFavourites!: boolean;

  @prop({
    required: true,
    min: 1,
    max: 5
  })
  public rating!: number;

  @prop({
    required: true,
    type: () => String,
    enum: OfferType
  })
  public type!: OfferType;

  @prop({
    required: true,
    min: 1,
    max: 8
  })
  public countRoom!: number;

  @prop({
    required: true,
    min: 1,
    max: 10
  })
  public countGuest!: number;

  @prop({
    required: true,
    min: 100,
    max: 100000
  })
  public rentalPrice!: number;

  @prop({
    required: true,
    type: () => [String],
    enum: Conveniences
  })
  public conveniences!: Conveniences[];

  @prop({
    required: true,
    ref: 'UserEntity'
  })
  public authorId!: Ref<UserEntity>;

  @prop({ default: 0 })
  public commentsCount!: number;

  @prop({
    required: true,
    _id: false,
    type: () => LocationsSchema
  })
  public location!: LocationsSchema;

  @prop({
    ref: 'UserEntity',
    default: [],
  })
  public favoriteByUsers!: Ref<UserEntity>[];
}

export const OfferModel = getModelForClass(OfferEntity);
