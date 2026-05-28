import dayjs from 'dayjs';
import { OfferGenerator } from './offer-generator.interface.js';
import { CityName, Conveniences, MockServerData, OfferType, UserType } from '../../types/index.js';
import { generateRandomValue, getRandomItem } from '../../helpers/index.js';
import generator from 'generate-password';

const MIN_PRICE = 100;
const MAX_PRICE = 100000;

const FIRST_WEEK_DAY = 1;
const LAST_WEEK_DAY = 7;

export class TSVOfferGenerator implements OfferGenerator{
  constructor(
    private readonly mockData: MockServerData
  ){}

  generate(): string {
    const title = getRandomItem<string>(this.mockData.titles);
    const description = getRandomItem<string>(this.mockData.descriptions);
    const datePublication = dayjs()
      .subtract(generateRandomValue(FIRST_WEEK_DAY, LAST_WEEK_DAY), 'day')
      .toISOString();
    const city = getRandomItem<CityName>(this.mockData.cities);
    const previewPath = getRandomItem<string>(this.mockData.images);
    const images = this.mockData.images.join(',');
    const isPremium = generateRandomValue(0,1) === 1;
    const isFavorite = generateRandomValue(0,1) === 1;
    const rating = generateRandomValue(1,5,1);
    const type = getRandomItem<string>(Object.keys(OfferType));
    const countRoom = generateRandomValue(1,8);
    const countGuest = generateRandomValue(1,10);
    const rentalPrice = generateRandomValue(MIN_PRICE, MAX_PRICE);
    const convenienceKeys = Object.keys(Conveniences);
    const conveniencesCount = generateRandomValue(1, convenienceKeys.length);
    const conveniences = [...convenienceKeys]
      .sort(() => Math.random() - 0.5)
      .slice(0, conveniencesCount)
      .join(',');
    const authorName = getRandomItem<string>(this.mockData.authors);
    const authorEmail = getRandomItem<string>(this.mockData.emails);
    const authorAvatarPath = getRandomItem<string>(this.mockData.avatarPath);
    const authorPassword = generator.generate({ length: 10, numbers: true });
    const authorType = getRandomItem<string>(Object.keys(UserType));
    const commentsCount = generateRandomValue(0, 100);
    const location = `${generateRandomValue(-90, 90, 6)},${generateRandomValue(-180, 180, 6)}`;

    return [
      title, description, datePublication, city, previewPath, images,
      isPremium, isFavorite, rating, type, countRoom, countGuest, rentalPrice, conveniences,
      authorName, authorEmail, authorAvatarPath, authorPassword, authorType, commentsCount,
      location
    ].join('\t');
  }
}
