import { inject, injectable } from 'inversify';
import { createOffer, getMongoURI } from '../../shared/helpers/index.js';
import { DatabaseClient } from '../../shared/libs/database-client/index.js';
import { TSVFileReader } from '../../shared/libs/file-reader/index.js';
import { Logger } from '../../shared/libs/logger/index.js';
import { OfferService } from '../../shared/modules/offer/index.js';
import { UserService } from '../../shared/modules/user/index.js';
import { Component, Offer } from '../../shared/types/index.js';
import { DEFAULT_DB_PORT, DEFAULT_USER_PASSWORD } from './command.constants.js';

import { Command } from './command.interface.js';

@injectable()
export class ImportCommand implements Command{
  private salt!: string;

  constructor(
    @inject(Component.Logger) private readonly logger: Logger,
    @inject(Component.OfferService) private readonly offerService: OfferService,
    @inject(Component.UserService) private readonly userService: UserService,
    @inject(Component.DatabaseClient) private readonly databaseClient: DatabaseClient
  ) {
    this.onImportedLine = this.onImportedLine.bind(this);
    this.onCompleteImport = this.onCompleteImport.bind(this);
  }

  public getName(): string {
    return '--import';
  }

  private buildMongoURI(args: string[]): { uri: string; salt: string } {
    if (args.length === 2) {
      const [uri, salt] = args;
      return { uri, salt };
    }

    if (args.length === 5) {
      const [login, password, host, dbName, salt] = args;

      const uri = getMongoURI(
        login,
        password,
        host,
        DEFAULT_DB_PORT,
        dbName
      );

      return { uri, salt };
    }

    throw new Error(
      'Invalid number of arguments for --import command'
    );
  }

  public async execute(fileName: string, ...params: string[]): Promise<void> {
    const { uri, salt } = this.buildMongoURI(params);

    this.salt = salt;

    this.logger.info('Trying to connect to MongoDB…');

    await this.databaseClient.connect(uri);

    const fileReader = new TSVFileReader(fileName.trim());

    fileReader.on('line', this.onImportedLine);
    fileReader.on('end', this.onCompleteImport);

    try{
      await fileReader.read();
    }catch(error){
      this.logger.error(`Can't import data from file: ${fileName}`, error as Error);
    }
  }

  private async onImportedLine(line: string, resolve: () => void): Promise<void> {
    const offer = createOffer(line);
    await this.saveOffer(offer);
    resolve();
  }

  private onCompleteImport(count: number): void {
    this.logger.info(`${count} rows imported`);
    this.databaseClient.disconnect();
  }

  private async saveOffer(offer: Offer): Promise<void> {
    const user = await this.userService.findOrCreate({...offer.author, password: DEFAULT_USER_PASSWORD }, this.salt);

    await this.offerService.create({
      title: offer.title,
      description: offer.description,
      datePublication: offer.datePublication,
      city: offer.city,
      previewPath: offer.previewPath,
      images: offer.images,
      isPremium: offer.isPremium,
      isFavourites: offer.isFavourites,
      rating: offer.rating,
      type: offer.type,
      countRoom: offer.countRoom,
      countGuest: offer.countGuest,
      rentalPrice: offer.rentalPrice,
      conveniences: offer.conveniences,
      authorId: user.id,
      commentCount: offer.commentCount,
      location: offer.location
    });
  }
}
