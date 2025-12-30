import axios from "axios";

export type Country = {
  _id: string;
  name: string;
  flag: string;
  population: number;
  region: string;
};

export type CountryPayload = Omit<Country, "_id">;

type ApiMessageResponse = { message: string };

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? "http://localhost:5000",
  headers: { "Content-Type": "application/json" },
});

const assertId = (id: string) => {
  if (!id?.trim()) throw new Error("Missing id");
};

/* ===== Queries ===== */
export const getCountries = async (): Promise<Country[]> => {
  const res = await api.get<Country[]>("/countries");
  return res.data;
};

export const getCountryById = async (id: string): Promise<Country> => {
  assertId(id);
  const res = await api.get<Country>(`/countries/${id}`);
  return res.data;
};

/* ===== Mutations ===== */
export const createCountry = async (payload: CountryPayload): Promise<Country> => {
  const res = await api.post<Country>("/countries", payload);
  return res.data;
};

export const updateCountry = async (
  id: string,
  payload: CountryPayload
): Promise<Country> => {
  assertId(id);
  const res = await api.put<Country>(`/countries/${id}`, payload);
  return res.data;
};

export const deleteCountry = async (id: string): Promise<ApiMessageResponse> => {
  assertId(id);
  const res = await api.delete<ApiMessageResponse>(`/countries/${id}`);
  return res.data;
};
