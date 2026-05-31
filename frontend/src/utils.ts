import { MAX_PERCENT_STARS_WIDTH, STARS_COUNT } from './const';

export const formatDate = (date: string) => {
  try {
    const d = new Date(date);
    if (Number.isNaN(d.getTime())) {
      return 'Unknown date';
    }

    return new Intl.DateTimeFormat(
      'en-US',
      {'month':'long','year':'numeric'}
    ).format(d);
  } catch {
    return 'Unknown date';
  }
};

export const getStarsWidth = (rating: number) =>
  `${(MAX_PERCENT_STARS_WIDTH * Math.round(rating)) / STARS_COUNT}%`;

export const getRandomElement = <T>(array: readonly T[]): T => array[Math.floor(Math.random() * array.length)];
export const pluralize = (str: string, count: number) => count === 1 ? str : `${str}s`;
export const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);

export class Token {
  private static _name = 'six-cities-auth-token';

  static get() {
    const token = localStorage.getItem(this._name);

    return token ?? '';
  }

  static save(token: string) {
    localStorage.setItem(this._name, token);
  }

  static drop() {
    localStorage.removeItem(this._name);
  }
}
