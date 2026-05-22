import { defaultClasses, getModelForClass, modelOptions, prop, Ref } from '@typegoose/typegoose';
import { User, UserType } from '../../types/index.js';
import { createSHA256 } from '../../helpers/hash.js';
import type { OfferEntity } from '../offer/offer.entity.js';


// eslint-disable-next-line @typescript-eslint/no-unsafe-declaration-merging
export interface UserEntity extends defaultClasses.Base {}

@modelOptions({
  schemaOptions: {
    collection: 'users',
    timestamps: true
  }
})

// eslint-disable-next-line @typescript-eslint/no-unsafe-declaration-merging
export class UserEntity extends defaultClasses.TimeStamps implements User {
  @prop({ required: true, minlength: 1, maxlength: 15, trim: true})
  public name!: string;

  @prop({ required: true, unique: true, trim: true})
  public email!: string;

  @prop()
  public avatarPath?: string;

  @prop({required: true, minlength: 64, maxlength: 64})
  private password?: string;

  @prop({
    ref: 'OfferEntity',
    default: []
  })
  public favoriteOffers!: Ref<OfferEntity>[];

  @prop({required: true, type: () => String, enum: UserType, default: UserType.Ordinary})
  public type!: UserType;

  constructor(userData: User){
    super();

    this.name = userData.name;
    this.email = userData.email;
    this.avatarPath = userData.avatarPath;
    this.type = userData.type;
  }

  public setPassword(password: string, salt: string): void {
    this.password = createSHA256(password, salt);
  }

  public getPassword(): string | undefined {
    return this.password;
  }

  public verifyPassword(password: string, salt: string) {
    const hashPassword = createSHA256(password, salt);
    return hashPassword === this.password;
  }
}

export const UserModel = getModelForClass(UserEntity);
