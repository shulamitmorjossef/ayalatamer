// file: src/api/citiesApi.ts
import { http } from "./http";

export type CountryRef =
  | string
  | {
      _id: string;
      name?: string;
      code?: string;
      flag?: string;
    };

export type City = {
  _id: string;
  name: string;
  countryId: CountryRef;
};

export async function getCitiesByCountryApi(countryId: string) {
  const { data } = await http.get<City[]>(`/cities/by-country/${countryId}`);
  return data;
}

export async function createCityApi(body: { name: string; countryId: string }) {
  const { data } = await http.post<City>("/cities", body);
  return data;
}

export async function updateCityApi(id: string, body: { name: string }) {
  const { data } = await http.put<City>(`/cities/${id}`, body);
  return data;
}

export async function deleteCityApi(id: string) {
  await http.delete(`/cities/${id}`);
}
