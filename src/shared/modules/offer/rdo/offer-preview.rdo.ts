import { Expose, Type } from 'class-transformer';
import { CityRdo } from './offer.rdo.js';

export class OfferPreviewRdo {
  @Expose()
  public id!: number;

  @Expose()
  public title!: string;

  @Expose()
  public datePublication!: Date;

  @Expose()
  @Type(() => CityRdo)
  public city!: CityRdo;

  @Expose()
  public isPremium!: boolean;

  @Expose()
  public isFavourites!: boolean;

  @Expose()
  public rating!: number;

  @Expose()
  public type!: string;

  @Expose()
  public rentalPrice!: number;

  @Expose()
  public commentCount!: number;

  @Expose()
  public previewPath!: string;
}
