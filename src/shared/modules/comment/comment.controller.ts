import { inject, injectable } from 'inversify';
import { BaseController, DocumentExistsMiddleware, HttpError, HttpMethod, ValidateDtoMiddleware, ValidateObjectIdMiddleware } from '../../libs/rest/index.js';
import { Component } from '../../types/component.enum.js';
import { Logger } from '../../libs/logger/logger.interface.js';
import { CommentRdo, CommentService, CreateCommentDto } from './index.js';
import { OfferService } from '../offer/offer-service.interface.js';
import { Response } from 'express';
import { CreateCommentRequest } from './types/create-comment-request.type.js';
import { OfferIdParam } from '../offer/types/params-offerid.type.js';
import { fillDTO, getUserId } from '../../helpers/common.js';
import { PrivateRouteMiddleware } from '../../libs/rest/middleware/private-route.middleware.js';
import { StatusCodes } from 'http-status-codes';


@injectable()
export default class CommentController extends BaseController {
  constructor(
    @inject(Component.Logger) protected readonly logger: Logger,
    @inject(Component.CommentService) private readonly commentService: CommentService,
    @inject(Component.OfferService) private readonly offerService: OfferService,
  ){
    super(logger);

    this.logger.info('Register routes for CommentController...');

    this.addRoute({
      path: '/:offerId/comments',
      method: HttpMethod.Get,
      handler: this.index,
      middlewares: [
        new ValidateObjectIdMiddleware('offerId'),
        new DocumentExistsMiddleware(this.offerService, 'Offer', 'offerId')
      ]});

    this.addRoute({
      path: '/:offerId/comments',
      method: HttpMethod.Post,
      handler: this.create,
      middlewares: [
        new PrivateRouteMiddleware(),
        new ValidateObjectIdMiddleware('offerId'),
        new ValidateDtoMiddleware(CreateCommentDto),
        new DocumentExistsMiddleware(this.offerService, 'Offer', 'offerId')
      ]});
  }

  public async index({params}: CreateCommentRequest, res: Response): Promise<void> {
    const offerId = String((params as OfferIdParam).offerId).trim();

    const comments = await this.commentService.findByOfferId(offerId);
    this.ok(res, fillDTO(CommentRdo, comments));
  }


  public async create(req: CreateCommentRequest, res: Response): Promise<void> {
    const {body, params} = req;
    const offerId = String((params as OfferIdParam).offerId).trim();

    const userId = getUserId(req, 'CommentController');

    if(! await this.offerService.exists(offerId)) {
      throw new HttpError(
        StatusCodes.NOT_FOUND,
        `Offer with id ${offerId} not found`,
        'CommentController'
      );
    }

    const result = await this.commentService.create({
      ...body,
      offerId: offerId,
      authorId: userId
    });

    await this.offerService.incCountComment(offerId);
    await this.offerService.recalcRating(offerId);
    this.created(res, fillDTO(CommentRdo, result));
  }
}
