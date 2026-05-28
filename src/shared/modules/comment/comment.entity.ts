import { defaultClasses, getModelForClass, modelOptions, prop, Ref } from '@typegoose/typegoose';
import { OfferEntity } from '../offer/offer.entity.js';
import { UserEntity } from '../user/user.entity.js';

export interface CommentEntity extends defaultClasses.Base{ }

@modelOptions({
  schemaOptions: {
    collection: 'coments',
    timestamps: true,
  }
})

export class CommentEntity extends defaultClasses.TimeStamps {
  @prop({
    required: true,
    trim: true,
    minlength: 5,
    maxlength: 1024,
  })
  public text!: string;

  @prop({
    required: true,
    min: 1,
    max: 5,
  })
  public rating!: number;

  @prop({
    ref: OfferEntity,
    required: true,
  })
  public offerId!: Ref<OfferEntity>;

  @prop({
    ref: UserEntity,
    required: true,
  })
  public authorId!: Ref<UserEntity>;
}


export const CommentModel = getModelForClass(CommentEntity);
