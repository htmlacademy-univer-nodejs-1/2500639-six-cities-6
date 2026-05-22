import { DocumentType } from '@typegoose/typegoose';
import { Conveniences, Offer, OfferType, UserType, CityName } from '../types/index.js';
import { OfferEntity } from '../modules/offer/offer.entity.js';
import { Cities } from '../constants/cities.js';

export function createOffer(offerData: string): Offer{
  const [
    title, description, datePublication, city, previewPath, images,
    isPremium, isFavorite, rating, type, countRoom, countGuest, rentalPrice, conveniences,
    authorName, authorEmail, authorAvatarPath, authorPassword, authorType, commentsCount, location
  ] = offerData.replace('\n', '').split('\t');

  const Offerlocation = {
    latitude: Number.parseFloat(location.split(',')[0]),
    longitude: Number.parseFloat(location.split(',')[1])
  };

  const author = {
    name: authorName,
    email: authorEmail,
    avatarPath: authorAvatarPath,
    password: authorPassword,
    type: UserType[authorType as keyof typeof UserType]
  };

  return{
    title,
    description,
    datePublication: new Date(datePublication),
    city: CityName[city as keyof typeof CityName],
    previewPath,
    images: images.split(','),
    isPremium: isPremium === 'true',
    isFavourites: isFavorite === 'true',
    rating: Number.parseFloat(rating),
    type: OfferType[type.toLowerCase() as keyof typeof OfferType],
    countRoom: Number.parseInt(countRoom, 10),
    countGuest: Number.parseInt(countGuest, 10),
    rentalPrice: Number.parseInt(rentalPrice, 10),
    conveniences: conveniences.split(',').map((convenience) => Conveniences[convenience as keyof typeof Conveniences]),
    author,
    commentCount: Number.parseInt(commentsCount, 10),
    location: Offerlocation
  };
}


export function prepareOffer(offer: DocumentType<OfferEntity>) {
  const plain = offer.toObject() as OfferEntity;
  const city = Cities[plain.city];

  return {
    ...plain,
    id: String(offer._id),
    city: {
      name: city.name,
      location: city.location
    }
  };
}

export function extractRefId(entity: unknown): string {
  if (typeof entity === 'string') {
    return entity;
  }

  if (typeof entity === 'object' && entity !== null && '_id' in entity) {
    return String((entity as { _id: unknown })._id);
  }

  return String(entity);
}

export function mapOffer(offer: DocumentType<OfferEntity>, userId?: string) {
  const preparedOffer = prepareOffer(offer);
  const favoriteByUsers = offer.favoriteByUsers ?? [];
  const isFavorite = userId
    ? favoriteByUsers.some((favoriteUser) => extractRefId(favoriteUser) === userId)
    : false;

  return {
    ...preparedOffer,
    isFavorite
  };
}
