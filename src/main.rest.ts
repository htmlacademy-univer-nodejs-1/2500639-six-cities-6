import { RestApplication, createRestApplicationContainer } from './rest/index.js';
import { Container } from 'inversify';
import { Component } from './shared/types/index.js';
import 'reflect-metadata';
import { createUserContainer } from './shared/modules/user/index.js';
import { createOfferContainer } from './shared/modules/offer/index.js';
import { createCommentContainer } from './shared/modules/comment/index.js';
import { createAuthContainer } from './shared/modules/auth/auth.container.js';


async function bootstrap() {
  const appContainer = new Container();

  createRestApplicationContainer(appContainer);
  createUserContainer(appContainer);
  createOfferContainer(appContainer);
  createCommentContainer(appContainer);
  createAuthContainer(appContainer);

  const application = appContainer.get<RestApplication>(Component.RestApplication);
  await application.init();
}

bootstrap();
