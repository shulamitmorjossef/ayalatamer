import axios from 'axios';
import { Country, ICountry } from '../models/Country';

const REST_COUNTRIES_URL = 'https://restcountries.com/v3.1/all?fields=name,flags,population,region';

export const fetchAndSaveCountries = async (): Promise<void> => {
  const countriesCount = await Country.countDocuments();

  if (countriesCount > 0) {
    console.log('Countries already exist in database');
    return;
  }

  const response = await axios.get(REST_COUNTRIES_URL);

  const countries: Partial<ICountry>[] = response.data.map((country: any) => ({
    name: country?.name?.common,
    flag: country?.flags?.png,
    population: country?.population,
    region: country?.region,
  }));

  await Country.insertMany(countries);

  console.log('Countries fetched and saved successfully');
};
