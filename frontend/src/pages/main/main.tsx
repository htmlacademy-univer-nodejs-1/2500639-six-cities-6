import { useEffect, useRef } from 'react';

import CardList from '../../components/card-list/card-list';
import CitiesList from '../../components/cities-list/cities-list';
import { useAppDispatch, useAppSelector } from '../../hooks';
import { setCity } from '../../store/site-process/site-process';
import { getCity } from '../../store/site-process/selectors';
import { getOffers } from '../../store/site-data/selectors';

const Main = (): JSX.Element => {
  const dispatch = useAppDispatch();
  const activeCity = useAppSelector(getCity);
  const offers = useAppSelector(getOffers);
  const isCitySynced = useRef(false);

  useEffect(() => {
    if (isCitySynced.current || offers.length === 0) {
      return;
    }

    const hasOffersInActiveCity = offers.some((offer) => offer.city.name === activeCity.name);

    if (!hasOffersInActiveCity) {
      dispatch(setCity(offers[0].city.name));
    }

    isCitySynced.current = true;
  }, [activeCity.name, dispatch, offers]);

  return (
    <main className="page__main page__main--index">
      <h1 className="visually-hidden">Cities</h1>
      <div className="tabs">
        <section className="locations container">
          <CitiesList />
        </section>
      </div>
      <div className="cities">
        <CardList />
      </div>
    </main>
  );
};

export default Main;
