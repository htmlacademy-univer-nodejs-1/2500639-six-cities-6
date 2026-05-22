import { inject, injectable } from 'inversify';
import { AnonymousRouteMiddleware, BaseController, HttpError, HttpMethod, PrivateRouteMiddleware, UploadFileMiddleware, ValidateDtoMiddleware } from '../../libs/rest/index.js';
import { Component } from '../../types/index.js';
import { Logger } from '../../libs/logger/index.js';
import { Request, Response } from 'express';
import { UserService, UserRdo, CreateUserDto, LoggedUserRdo } from './index.js';
import { RestSchema, Config } from '../../libs/config/index.js';
import { StatusCodes } from 'http-status-codes';
import { fillDTO, getUserId } from '../../helpers/common.js';
import { CreateUserRequest } from './types/create-user-request.type.js';
import { LoginUserRequest } from './types/login-user-request.type.js';
import { LoginUserDto } from './dto/login-user.dto.js';
import { prepareUser } from '../../helpers/user.js';
import { AuthService } from '../auth/auth-service.interface.js';
import type { RequestWithTokenPayload } from '../auth/index.js';

@injectable()
export class UserController extends BaseController {
  constructor(
    @inject(Component.Logger) protected readonly logger: Logger,
    @inject(Component.UserService) private readonly userService: UserService,
    @inject(Component.Config) private readonly configService: Config<RestSchema>,
    @inject(Component.AuthService) private readonly authService: AuthService,
  ) {
    super(logger);

    this.logger.info('Register routes for UserController...');

    this.addRoute({
      path: '/register',
      method: HttpMethod.Post,
      handler: this.create,
      middlewares: [
        new AnonymousRouteMiddleware(),
        new ValidateDtoMiddleware(CreateUserDto)
      ]});
    this.addRoute({
      path: '/login',
      method: HttpMethod.Post,
      handler: this.login,
      middlewares: [
        new ValidateDtoMiddleware(LoginUserDto)
      ]});
    this.addRoute({
      path: '/profile',
      method: HttpMethod.Get,
      handler: this.profile,
      middlewares: [
        new PrivateRouteMiddleware(),
      ]
    });
    this.addRoute({
      path: '/logout',
      method: HttpMethod.Post,
      handler: this.logout,
      middlewares: [
        new PrivateRouteMiddleware(),
      ]
    });
    this.addRoute({
      path: '/avatar',
      method: HttpMethod.Post,
      handler: this.uploadAvatar,
      middlewares: [
        new PrivateRouteMiddleware(),
        new UploadFileMiddleware(this.configService.get('UPLOAD_DIRECTORY'), 'avatar'),
      ]
    });
    this.addRoute({
      path: '/login',
      method: HttpMethod.Get,
      handler: this.checkAuth,
      middlewares: [
        new PrivateRouteMiddleware(),
      ]
    });
  }

  public async uploadAvatar(req: Request, res: Response): Promise<void> {
    const userId = getUserId(req, 'UserController');

    if (!req.file) {
      throw new HttpError(
        StatusCodes.BAD_REQUEST,
        'Avatar file is required',
        'UserController',
      );
    }

    const avatarPath = `/upload/${req.file.filename}`;
    const updatedUser = await this.userService.updateAvatarById(userId.trim(), avatarPath);

    if (!updatedUser) {
      throw new HttpError(
        StatusCodes.NOT_FOUND,
        `User with id ${userId} not found.`,
        'UserController',
      );
    }

    this.ok(res, fillDTO(UserRdo, prepareUser(updatedUser)));
  }

  public async create({body}: CreateUserRequest, res: Response): Promise<void> {
    const existUser = await this.userService.findByEmail(body.email);

    if (existUser) {
      throw new HttpError(
        StatusCodes.CONFLICT,
        `User with email "${body.email}" exist`,
        'UserController'
      );
    }

    const result = await this.userService.create(body, this.configService.get('SALT'));
    this.created(res, fillDTO(UserRdo, prepareUser(result)));
  }

  public async login({body}: LoginUserRequest, res: Response): Promise<void> {
    const user = await this.authService.verify(body);
    const token = await this.authService.authenticate(user);
    const responseData = fillDTO(LoggedUserRdo, {
      email: user.email,
      token
    });

    this.ok(res, responseData);
  }

  public async profile(req: Request, res: Response): Promise<void> {
    const userId = getUserId(req, 'UserController');
    const existUser = await this.userService.findById(userId);

    if(!existUser) {
      throw new HttpError(
        StatusCodes.UNAUTHORIZED,
        'Unauthorized user',
        'UserController'
      );
    }

    this.ok(res, fillDTO(UserRdo, prepareUser(existUser)));
  }

  public async logout(req: Request, res: Response): Promise<void> {
    getUserId(req, 'UserController');
    this.noContent(res, null);
  }

  public async checkAuth(req: RequestWithTokenPayload, res: Response) {
    const email = req.tokenPayload?.email;

    if (!email) {
      throw new HttpError (
        StatusCodes.UNAUTHORIZED,
        'Unauthorized',
        'UserController'
      );
    }

    const foundedUser = await this.userService.findByEmail(email);

    if(!foundedUser) {
      throw new HttpError (
        StatusCodes.UNAUTHORIZED,
        'Unauthorized',
        'UserController'
      );
    }

    this.ok(res, fillDTO(UserRdo, prepareUser(foundedUser)));
  }
}
