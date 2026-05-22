export const OfferValidationMessage = {
  title: {
    minLength: 'Minimum title length must be 10',
    maxLength: 'Maximum title length must be 100',
    invalidFormat: 'title must be a string'
  },

  description: {
    minLength: 'Minimum description length must be 20',
    maxLength: 'Maximum description length must be 1024',
    invalidFormat: 'description must be a string'
  },

  datePublication: {
    invalidFormat: 'datePublication must be a valid ISO date'
  },

  city: {
    invalidFormat: 'city must be one of six cities'
  },

  previewPath: {
    invalidFormat: 'previewPath is required'
  },

  images: {
    invalidFormat: 'images must be an array of 6 strings',
    countFiled: 'images count must be exacly 6'
  },

  isPremium: {
    invalidFormat: 'isPremium must be boolean'
  },

  isFavourites: {
    invalidFormat: 'isFavourites must be boolean'
  },

  rating: {
    invalidFormat: 'rating must be a number',
    rangeField: 'min rating is 1, max rating is 5'
  },

  type: {
    invalidFormat: 'type must be one of types: apartment, house, room, hotel'
  },

  countRoom: {
    min: 'minimum count rooms must be 1',
    max:'maximum count rooms must be 8',
    invalidFormat: 'countRoom must be en integer'
  },

  countGuest: {
    min: 'minimum count guests must be 1',
    max:'maximum count guests must be 10',
    invalidFormat: 'countGuest must be an integer'
  },

  rentalPrice: {
    min: 'minimum rental price must be 100',
    max:'maximum rental price must be 100000',
    invalidFormat: 'rentalPrice must be an integer'
  },

  conveniences: {
    invalidFormat: 'conveniences must be one or more of Conveniences: Breakfast, Air conditioning, Laptop friendly workspace, Baby seat, Washer, Towels, Fridge',
  },

  commentCount: {
    invalidFormat: 'commentCount must be a non-negative integer'
  },

  location: {
    invalidFormat: 'location object is required'
  },

  latitude: {
    invalidFormat: 'latitude must be a number',
    rangeField: 'latitude must be between -90 and 90'
  },

  longitude: {
    invalidFormat: 'longitude must be a number',
    rangeField: 'longitude must be between -180 and 180'
  }
} as const;
