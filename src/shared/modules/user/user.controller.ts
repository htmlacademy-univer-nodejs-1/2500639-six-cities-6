import { inject, injectable } from 'inversify';
import { BaseController, DocumentExistsMiddleware, HttpError, HttpMethod, UploadFileMiddleware, ValidateDtoMiddleware, ValidateObjectIdMiddleware } from '../../libs/rest/index.js';
import { Component } from '../../types/index.js';
import { Logger } from '../../libs/logger/index.js';
import { Request, Response } from 'express';
import { UserService, UserRdo, CreateUserDto } from './index.js';
import { RestSchema, Config } from '../../libs/config/index.js';
import { StatusCodes } from 'http-status-codes';
import { fillDTO, getUserId } from '../../helpers/common.js';
import { createSHA256 } from '../../helpers/hash.js';
import { CreateUserRequest } from './types/create-user-request.type.js';
import { LoginUserRequest } from './types/login-user-request.type.js';
import { LoginUserDto } from './dto/login-user.dto.js';
import { prepareUser } from '../../helpers/user.js';
import { UserIdParams } from './types/params-userid.type.js';

@injectable()
export class UserController extends BaseController {
  constructor(
    @inject(Component.Logger) protected readonly logger: Logger,
    @inject(Component.UserService) private readonly userService: UserService,
    @inject(Component.Config) private readonly configService: Config<RestSchema>,
  ) {
    super(logger);

    this.logger.info('Register routes for UserController...');

    this.addRoute({
      path: '/register',
      method: HttpMethod.Post,
      handler: this.create,
      middlewares: [
        new ValidateDtoMiddleware(CreateUserDto)
      ]});
    this.addRoute({
      path: '/login',
      method: HttpMethod.Post,
      handler: this.login,
      middlewares: [
        new ValidateDtoMiddleware(LoginUserDto)
      ]});
    this.addRoute({path: '/checkAuth', method: HttpMethod.Get, handler: this.checkAuth});
    this.addRoute({path: '/logout', method: HttpMethod.Post, handler: this.logout});
    this.addRoute({
      path: '/:userId/avatar',
      method: HttpMethod.Post,
      handler: this.uploadAvatar,
      middlewares: [
        new ValidateObjectIdMiddleware('userId'),
        new UploadFileMiddleware(this.configService.get('UPLOAD_DIRECTORY'), 'avatar'),
        new DocumentExistsMiddleware(this.userService, 'User', 'userId')
      ]
    });
  }

  public async uploadAvatar(req: Request, res: Response): Promise<void> {
    const params = req.params as UserIdParams;
    const userId = params.userId;

    if (!userId || typeof userId !== 'string'){
      throw new HttpError(
        StatusCodes.BAD_REQUEST,
        `${userId} is invalid`,
        'UserController'
      );
    }

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
    const existUser = await this.userService.findByEmail(body.email);

    if (!existUser){
      throw new HttpError(
        StatusCodes.UNAUTHORIZED,
        `User with email ${body.email} not found`,
        'UserController'
      );
    }

    const passwordHash = createSHA256(body.password, this.configService.get('SALT'));
    const isValidPassword = passwordHash === existUser.getPassword();

    if(!isValidPassword) {
      throw new HttpError(
        StatusCodes.UNAUTHORIZED,
        'Incorrect email or password',
        'UserController'
      );
    }

    this.ok(res, {token: String(existUser._id)});
  }

  public async checkAuth(req: Request, res: Response): Promise<void> {
    const userId = getUserId(req.headers, 'UserController');
    const existUser = await this.userService.findById(userId);

    if(!existUser) {
      throw new HttpError(
        StatusCodes.UNAUTHORIZED,
        'Unauthorizad user',
        'UserController'
      );
    }

    this.ok(res, fillDTO(UserRdo, prepareUser(existUser)));
  }

  public async logout(req: Request, res: Response): Promise<void> {
    getUserId(req.headers, 'UserController');
    this.ok(res, {message: 'Logout completed'});
  }
}
