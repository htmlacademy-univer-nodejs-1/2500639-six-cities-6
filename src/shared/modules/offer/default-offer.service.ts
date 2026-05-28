import { inject, injectable } from 'inversify';
import { Component, Sort } from '../../types/index.js';
import { OfferEntity } from './offer.entity.js';
import { CreateOfferDto } from './dto/create-offer.dto.js';
import { DocumentType, types } from '@typegoose/typegoose';
import { OfferService, UpdateOfferDto } from './index.js';
import { Logger } from '../../libs/logger/index.js';
import { DeleteResult, Types } from 'mongoose';
import { DEFAULT_COUNT_OFFER, DEFAULT_COUNT_PREMIUM_OFFER } from './offer.constants.js';
import { UserEntity } from '../user/user.entity.js';
import { CommentEntity } from '../comment/comment.entity.js';

@injectable()
export class DefaultOfferService implements OfferService {
  constructor(
    @inject(Component.Logger) private readonly logger: Logger,
    @inject(Component.OfferModel) private readonly offerModel: types.ModelType<OfferEntity>,
    @inject(Component.UserModel) private readonly userModel: types.ModelType<UserEntity>,
    @inject(Component.CommentModel) private readonly commentModel: types.ModelType<CommentEntity>,
  ) {}

  public async create(dto: CreateOfferDto): Promise<DocumentType<OfferEntity>> {
    const result = await this.offerModel.create(dto);
    this.logger.info(`New offer created: ${dto.title}`);

    return result.populate('authorId');
  }

  public async findById(offerId: string): Promise<DocumentType<OfferEntity> | null> {
    return this.offerModel.findById(offerId).populate('authorId').exec();
  }

  public async updateById(offerId: string, dto: UpdateOfferDto): Promise<DocumentType<OfferEntity> | null> {
    return this.offerModel.findOneAndUpdate({_id: offerId}, dto, {new: true}).populate('authorId');
  }

  public async deleteById(offerId: string): Promise<DeleteResult> {
    return this.offerModel.deleteOne({_id: offerId}).exec();
  }

  public async findAll(limit = DEFAULT_COUNT_OFFER): Promise<DocumentType<OfferEntity>[]> {
    return this.offerModel.find({}).populate('authorId').sort({ datePublication: Sort.Desc}).limit(limit).exec();
  }

  public async findPremiumByCity(cityName: string): Promise<DocumentType<OfferEntity>[]> {
    return this.offerModel.find({'city': cityName, isPremium: true}).populate('authorId').sort({datePublication: Sort.Desc}).limit(DEFAULT_COUNT_PREMIUM_OFFER).exec();
  }

  public async findFavorites(userId: string): Promise<DocumentType<OfferEntity>[]> {
    const favoriteOffers = await this.offerModel.find({favoriteByUsers: userId}).populate('authorId').sort({ datePublication: Sort.Desc}).exec();
    return favoriteOffers;
  }

  public async addToFavorite(offerId: string, userId: string): Promise<void> {
    const session = await this.offerModel.db.startSession();

    try {
      await session.withTransaction(async () => {
        await this.offerModel
          .updateOne({ _id: offerId }, { $addToSet: { favoriteByUsers: userId } }, { session })
          .exec();
        await this.userModel
          .updateOne({ _id: userId }, { $addToSet: { favoriteOffers: offerId } }, { session })
          .exec();
      });
    } catch {
      await this.offerModel.updateOne({ _id: offerId }, { $addToSet: { favoriteByUsers: userId } }).exec();

      try {
        await this.userModel.updateOne({ _id: userId }, { $addToSet: { favoriteOffers: offerId } }).exec();
      } catch (error) {
        await this.offerModel.updateOne({ _id: offerId }, { $pull: { favoriteByUsers: userId } }).exec();
        throw error;
      }
    } finally {
      await session.endSession();
    }
  }

  public async deleteFromFavorite(offerId: string, userId: string): Promise<void> {
    const session = await this.offerModel.db.startSession();

    try {
      await session.withTransaction(async () => {
        await this.offerModel
          .updateOne({ _id: offerId }, { $pull: { favoriteByUsers: userId } }, { session })
          .exec();
        await this.userModel
          .updateOne({ _id: userId }, { $pull: { favoriteOffers: offerId } }, { session })
          .exec();
      });
    } catch {
      await this.offerModel.updateOne({ _id: offerId }, { $pull: { favoriteByUsers: userId } }).exec();

      try {
        await this.userModel.updateOne({ _id: userId }, { $pull: { favoriteOffers: offerId } }).exec();
      } catch (error) {
        await this.offerModel.updateOne({ _id: offerId }, { $addToSet: { favoriteByUsers: userId } }).exec();
        throw error;
      }
    } finally {
      await session.endSession();
    }
  }

  public async recalcRating(offerId: string): Promise<void> {
    const offerObjectId = new Types.ObjectId(offerId);

    const avgRating = await this.commentModel.aggregate([
      {
        $match: {
          offerId: offerObjectId
        }
      },
      {
        $group: {
          _id: '$offerId',
          avgRating: { $avg: '$rating' }
        }
      },
    ]).exec();
    const result = avgRating.length > 0 ? avgRating[0].avgRating : 0;
    await this.offerModel.findByIdAndUpdate(offerId, {rating: result});
  }

  public async incCountComment(offerId: string): Promise<void> {
    await this.offerModel.updateOne({_id: offerId}, {$inc: {commentsCount: 1}}).exec();
  }

  public async exists(documentId: string): Promise<boolean> {
    return (await this.offerModel.exists({_id: documentId})) !== null;
  }
}
