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
import { prepareOffer } from '../../helpers/offer.js';
import { CreateOfferDto } from './dto/create-offer.dto.js';
import { StatusCodes } from 'http-status-codes';
import { OfferIdParam } from './types/params-offerid.type.js';
import { OfferCityParam } from './types/params-offerCity.type.js';
import { CreateOfferRequest } from './types/create-offer-request.type.js';
import { UpdateOfferRequest } from './types/update-offer-request.type.js';


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
    this.addRoute({path: '/', method: HttpMethod.Post, handler: this.create, middlewares: [new ValidateDtoMiddleware(CreateOfferDto)]});
    this.addRoute({path: '/favorites', method: HttpMethod.Get, handler: this.getFavorites});
    this.addRoute({path: '/premium/:city', method: HttpMethod.Get, handler: this.getPremium});
    this.addRoute({
      path: '/:offerId',
      method: HttpMethod.Patch,
      handler: this.update,
      middlewares: [
        new ValidateObjectIdMiddleware('offerId'),
        new DocumentExistsMiddleware(this.offerService, 'Offer', 'offerId')
      ]});
    this.addRoute({
      path: '/:offerId',
      method: HttpMethod.Delete,
      handler: this.delete,
      middlewares: [
        new ValidateObjectIdMiddleware('offerId'),
        new DocumentExistsMiddleware(this.offerService, 'Offer', 'offerId')
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
        new ValidateObjectIdMiddleware('offerId'),
        new DocumentExistsMiddleware(this.offerService, 'Offer', 'offerId')
      ]});
    this.addRoute({
      path: '/:offerId/favorite',
      method: HttpMethod.Delete,
      handler: this.deleteFromFavorite,
      middlewares: [
        new ValidateObjectIdMiddleware('offerId'),
        new DocumentExistsMiddleware(this.offerService, 'Offer', 'offerId')
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

  public async index(req: Request, res: Response): Promise<void> {
    const query = req.query as RequestQuery;
    const offers = await this.offerService.findAll(this.getValidLimit(query.limit));
    this.ok(res, fillDTO(OfferRdo, offers.map((offer) => prepareOffer(offer))));
  }


  public async create({body}: CreateOfferRequest, res: Response): Promise<void> {
    const result = await this.offerService.create(body);

    this.created(res, fillDTO(OfferRdo, prepareOffer(result)));
  }


  public async update({body, params}: UpdateOfferRequest, res: Response): Promise<void> {
    const typedParams = params as OfferIdParam;
    const offerId = this.extractParam(typedParams.offerId, 'offerId');

    const result = await this.offerService.updateById(offerId, body);

    if (!result) {
      throw new HttpError(
        StatusCodes.NOT_FOUND,
        `Offer with id: ${offerId} not found`,
        'OfferController'
      );
    }

    this.ok(res, fillDTO(OfferRdo, prepareOffer(result)));
  }


  public async delete(req: Request, res: Response): Promise<void> {
    const params = req.params as OfferIdParam;
    const offerId = this.extractParam(params.offerId, 'offerId');

    await this.offerService.deleteById(offerId);
    await this.commentService.deleteByOfferId(offerId);

    this.noContent(res, null);
  }


  public async show(req: Request, res: Response): Promise<void> {
    const params = req.params as OfferIdParam;
    const offerId = this.extractParam(params.offerId, 'offerId');
    const existOffer = await this.offerService.findById(offerId);

    if (!existOffer) {
      throw new HttpError(
        StatusCodes.NOT_FOUND,
        `Offer with id: ${offerId} not found`,
        'OfferController'
      );
    }

    this.ok(res, fillDTO(OfferRdo, prepareOffer(existOffer)));
  }


  public async getFavorites(req: Request, res: Response): Promise<void> {
    const userId = getUserId(req.headers, 'OfferController');
    const offers = await this.offerService.findFavorites(userId);
    this.ok(res, fillDTO(OfferRdo, offers.map((offer) => prepareOffer(offer))));
  }


  public async addToFavorite(req: Request, res: Response): Promise<void> {
    const params = req.params as OfferIdParam;
    const offerId = this.extractParam(params.offerId, 'offerId');
    const userId = getUserId(req.headers, 'OfferController');

    await this.offerService.addToFavorite(offerId, userId);
    const result = await this.offerService.findById(offerId);

    if (!result) {
      throw new HttpError(
        StatusCodes.NOT_FOUND,
        `Offer with id: ${offerId} not found`,
        'OfferController'
      );
    }

    this.ok(res, fillDTO(OfferRdo, prepareOffer(result)));
  }


  public async deleteFromFavorite(req: Request, res: Response): Promise<void> {
    const params = req.params as OfferIdParam;
    const offerId = this.extractParam(params.offerId, 'offerId');
    const userId = getUserId(req.headers, 'OfferController');

    await this.offerService.deleteFromFavorite(offerId, userId);
    const result = await this.offerService.findById(offerId);

    if (!result) {
      throw new HttpError(
        StatusCodes.NOT_FOUND,
        `Offer with id: ${offerId} mot found`,
        'OfferController'
      );
    }

    this.ok(res, fillDTO(OfferRdo, prepareOffer(result)));
  }


  public async getPremium(req: Request, res: Response): Promise<void> {
    const params = req.params as OfferCityParam;
    const city = this.extractParam(params.city, 'city');
    const offers = await this.offerService.findPremiumByCity(city);
    this.ok(res, fillDTO(OfferRdo, offers.map((offer) => prepareOffer(offer))));
  }
}
