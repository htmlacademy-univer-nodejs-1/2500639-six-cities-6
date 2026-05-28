import { inject, injectable } from 'inversify';
import { BaseController, DocumentExistsMiddleware, HttpError, HttpMethod, ValidateDtoMiddleware, ValidateObjectIdMiddleware } from '../../libs/rest/index.js';
import { Component } from '../../types/component.enum.js';
import { Logger } from '../../libs/logger/logger.interface.js';
import { Request, Response } from 'express';
import { OfferService } from './offer-service.interface.js';
import { CommentService } from '../comment/comment-service.interface.js';
import { RequestQuery } from '../../libs/rest/types/request-query.type.js';
import { fillDTO, getUserId } from '../../helpers/common.js';
import { OfferRdo } from './rdo/offer.rdo.js';
import { extractRefId, mapOffer } from '../../helpers/offer.js';
import { CreateOfferDto } from './dto/create-offer.dto.js';
import { UpdateOfferDto } from './dto/update-offer.dto.js';
import { StatusCodes } from 'http-status-codes';
import { OfferIdParam } from './types/params-offerid.type.js';
import { OfferCityParam } from './types/params-offerCity.type.js';
import { CreateOfferRequest } from './types/create-offer-request.type.js';
import { UpdateOfferRequest } from './types/update-offer-request.type.js';
import { PrivateRouteMiddleware } from '../../libs/rest/middleware/private-route.middleware.js';
import { OfferPreviewRdo } from './rdo/offer-preview.rdo.js';
import { CityName } from '../../types/index.js';

function getOptionalUserId(req: Request): string | undefined {
  return req.headers.authorization ? (req as { tokenPayload?: { id?: string } }).tokenPayload?.id : undefined;
}


@injectable()
export class OfferController extends BaseController {
  constructor(
    @inject(Component.Logger) protected readonly logger: Logger,
    @inject(Component.OfferService) private readonly offerService: OfferService,
    @inject(Component.CommentService) private readonly commentService: CommentService,
  ){
    super(logger);

    this.logger.info('Register routes for OfferController...');
    this.addRoute({path: '/', method: HttpMethod.Get, handler: this.index});
    this.addRoute({
      path: '/',
      method: HttpMethod.Post,
      handler: this.create,
      middlewares: [
        new PrivateRouteMiddleware(),
        new ValidateDtoMiddleware(CreateOfferDto),
      ]});
    this.addRoute({
      path: '/favorites',
      method: HttpMethod.Get,
      handler: this.getFavorites,
      middlewares: [
        new PrivateRouteMiddleware(),
      ]
    });
    this.addRoute({path: '/premium/:city', method: HttpMethod.Get, handler: this.getPremium});
    this.addRoute({
      path: '/:offerId',
      method: HttpMethod.Patch,
      handler: this.update,
      middlewares: [
        new PrivateRouteMiddleware(),
        new ValidateObjectIdMiddleware('offerId'),
        new ValidateDtoMiddleware(UpdateOfferDto),
        new DocumentExistsMiddleware(this.offerService, 'Offer', 'offerId'),
      ]});
    this.addRoute({
      path: '/:offerId',
      method: HttpMethod.Delete,
      handler: this.delete,
      middlewares: [
        new PrivateRouteMiddleware(),
        new ValidateObjectIdMiddleware('offerId'),
        new DocumentExistsMiddleware(this.offerService, 'Offer', 'offerId'),
      ]});
    this.addRoute({
      path: '/:offerId',
      method: HttpMethod.Get,
      handler: this.show,
      middlewares: [
        new ValidateObjectIdMiddleware('offerId'),
        new DocumentExistsMiddleware(this.offerService, 'Offer', 'offerId')
      ]});
    this.addRoute({
      path: '/:offerId/favorite',
      method: HttpMethod.Post,
      handler: this.addToFavorite,
      middlewares: [
        new PrivateRouteMiddleware(),
        new ValidateObjectIdMiddleware('offerId'),
        new DocumentExistsMiddleware(this.offerService, 'Offer', 'offerId'),
      ]});
    this.addRoute({
      path: '/:offerId/favorite',
      method: HttpMethod.Delete,
      handler: this.deleteFromFavorite,
      middlewares: [
        new PrivateRouteMiddleware(),
        new ValidateObjectIdMiddleware('offerId'),
        new DocumentExistsMiddleware(this.offerService, 'Offer', 'offerId'),
      ]});
  }

  private getValidLimit(limit?: number): number | undefined {
    return limit !== undefined && !Number.isNaN(limit) && limit > 0 ? limit : undefined;
  }

  private extractParam(param: unknown, name: string): string {
    const value = Array.isArray(param) ? param[0] : param;

    if (typeof value !== 'string'){
      throw new HttpError(
        StatusCodes.BAD_REQUEST,
        `${name} is invalid`,
        'OfferController'
      );
    }

    return value.trim();
  }

  private async ensureOfferOwner(offerId: string, userId: string): Promise<void> {
    const offer = await this.offerService.findById(offerId);
    if (!offer) {
      throw new HttpError(
        StatusCodes.NOT_FOUND,
        `Offer with id ${offerId} not found.`,
        'OfferController',
      );
    }

    const authorId = extractRefId(offer.authorId);

    if (authorId !== userId) {
      throw new HttpError(
        StatusCodes.FORBIDDEN,
        'Only the author can manage this offer',
        'OfferController',
      );
    }
  }

  public async index(req: Request, res: Response): Promise<void> {
    const query = req.query as RequestQuery;
    const offers = await this.offerService.findAll(this.getValidLimit(query.limit));
    const userId = getOptionalUserId(req);
    this.ok(res, fillDTO(OfferPreviewRdo, offers.map((offer) => mapOffer(offer, userId))));
  }


  public async create(req: CreateOfferRequest, res: Response): Promise<void> {
    const userId = getUserId(req, 'OfferController');
    const result = await this.offerService.create({
      ...req.body,
      authorId: userId
    });
    this.created(res, fillDTO(OfferRdo, mapOffer(result, userId)));
  }


  public async update(req: UpdateOfferRequest, res: Response): Promise<void> {
    const {body, params} = req;
    const typedParams = params as OfferIdParam;
    const offerId = this.extractParam(typedParams.offerId, 'offerId');
    const userId = getUserId(req, 'OfferController');

    await this.ensureOfferOwner(offerId, userId);

    const result = await this.offerService.updateById(offerId, body);

    if (!result) {
      throw new HttpError(
        StatusCodes.NOT_FOUND,
        `Offer with id: ${offerId} not found`,
        'OfferController'
      );
    }

    this.ok(res, fillDTO(OfferRdo, mapOffer(result, userId)));
  }


  public async delete(req: Request, res: Response): Promise<void> {
    const params = req.params as OfferIdParam;
    const offerId = this.extractParam(params.offerId, 'offerId');
    const userId = getUserId(req, 'OfferController');

    await this.ensureOfferOwner(offerId, userId);

    await this.offerService.deleteById(offerId);
    await this.commentService.deleteByOfferId(offerId);

    this.noContent(res, null);
  }


  public async show(req: Request, res: Response): Promise<void> {
    const params = req.params as OfferIdParam;
    const offerId = this.extractParam(params.offerId, 'offerId');
    const existOffer = await this.offerService.findById(offerId);
    const userId = getOptionalUserId(req);

    if (!existOffer) {
      throw new HttpError(
        StatusCodes.NOT_FOUND,
        `Offer with id: ${offerId} not found`,
        'OfferController'
      );
    }

    this.ok(res, fillDTO(OfferRdo, mapOffer(existOffer, userId)));
  }


  public async getFavorites(req: Request, res: Response): Promise<void> {
    const userId = getUserId(req, 'OfferController');
    const offers = await this.offerService.findFavorites(userId);
    this.ok(res, fillDTO(OfferPreviewRdo, offers.map((offer) => mapOffer(offer, userId))));
  }


  public async addToFavorite(req: Request, res: Response): Promise<void> {
    const params = req.params as OfferIdParam;
    const offerId = this.extractParam(params.offerId, 'offerId');
    const userId = getUserId(req, 'OfferController');

    await this.offerService.addToFavorite(offerId, userId);
    const result = await this.offerService.findById(offerId);

    if (!result) {
      throw new HttpError(
        StatusCodes.NOT_FOUND,
        `Offer with id: ${offerId} not found`,
        'OfferController'
      );
    }

    this.ok(res, fillDTO(OfferRdo, mapOffer(result, userId)));
  }


  public async deleteFromFavorite(req: Request, res: Response): Promise<void> {
    const params = req.params as OfferIdParam;
    const offerId = this.extractParam(params.offerId, 'offerId');
    const userId = getUserId(req, 'OfferController');

    await this.offerService.deleteFromFavorite(offerId, userId);
    const result = await this.offerService.findById(offerId);

    if (!result) {
      throw new HttpError(
        StatusCodes.NOT_FOUND,
        `Offer with id: ${offerId} mot found`,
        'OfferController'
      );
    }

    this.ok(res, fillDTO(OfferRdo, mapOffer(result, userId)));
  }


  public async getPremium(req: Request, res: Response): Promise<void> {
    const params = req.params as OfferCityParam;
    const city = this.extractParam(params.city, 'city');
    const userId = getOptionalUserId(req);

    if (!Object.values(CityName).includes(city as CityName)) {
      throw new HttpError(
        StatusCodes.BAD_REQUEST,
        `${city} is invalid city`,
        'OfferController',
      );
    }

    const offers = await this.offerService.findPremiumByCity(city);
    this.ok(res, fillDTO(OfferPreviewRdo, offers.map((offer) => mapOffer(offer, userId))));
  }
}
