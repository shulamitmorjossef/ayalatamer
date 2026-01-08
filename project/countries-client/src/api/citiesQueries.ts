import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createCityApi,
  deleteCityApi,
  getCitiesByCountryApi,
  updateCityApi,
} from "./citiesApi";

export function useCities(countryId: string) {
  return useQuery({
    queryKey: ["cities", countryId],
    queryFn: () => getCitiesByCountryApi(countryId),
    enabled: !!countryId,
  });
}

export function useCreateCity(countryId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: { name: string; countryId: string }) => createCityApi(body),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["cities", countryId] });
    },
  });
}

export function useUpdateCity(countryId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { id: string; name: string }) => updateCityApi(vars.id, { name: vars.name }),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["cities", countryId] });
    },
  });
}

export function useDeleteCity(countryId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteCityApi(id),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["cities", countryId] });
    },
  });
}
