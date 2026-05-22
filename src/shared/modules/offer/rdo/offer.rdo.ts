import { Expose, Type } from 'class-transformer';
import { UserRdo } from '../../user/rdo/user.rdo.js';

export class LocationRdo {
  @Expose()
  public latitude!: number;

  @Expose()
  public longitude!: number;
}

export class CityRdo {
  @Expose()
  public name!: string;

  @Expose()
  @Type(() => LocationRdo)
  public location!: LocationRdo;
}

export class OfferRdo {
  @Expose()
  public id!: number;

  @Expose()
  public title!: string;

  @Expose()
  public description!: string;

  @Expose()
  public datePublication!: Date;

  @Expose()
  @Type(() => CityRdo)
  public city!: CityRdo;

  @Expose()
  public previewPath!: string;

  @Expose()
  public images!: string[];

  @Expose()
  public isPremium!: boolean;

  @Expose()
  public isFavourites!: boolean;

  @Expose()
  public rating!: number;

  @Expose()
  public type!: string;

  @Expose()
  public countRoom!: number;

  @Expose()
  public countGuest!: number;

  @Expose()
  public rentalPrice!: number;

  @Expose()
  public conveniences!: string[];

  @Expose({ name: 'authorId' })
  @Type(() => UserRdo)
  public host!: UserRdo;

  @Expose()
  public commentCount!: number;

  @Expose()
  public location!: {
    latitude: number;
    longitude: number;
  };
}
