import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getCountries, getCountryById, createCountry, updateCountry, deleteCountry } from "./countryApi";
import type { Country, CountryPayload } from "./countryApi";

/* ================= QUERIES ================= */

export const useCountriesQuery = () => useQuery({
  queryKey: ["countries"],
  queryFn: getCountries,
});

export const useCountryQuery = (id?: string) => useQuery({
  queryKey: ["country", id],
  queryFn: () => getCountryById(id!),
  enabled: !!id,
});

/* ================= MUTATIONS ================= */

export const useCountryMutations = () => {
  const qc = useQueryClient();

  return {
    create: useMutation({
      mutationFn: (payload: CountryPayload) => createCountry(payload),
      onSuccess: (created) => {
        qc.setQueryData<Country[]>(["countries"], (old) => old ? [...old, created] : [created]);
      },
    }),

    update: useMutation({
      mutationFn: ({ id, payload }: { id: string; payload: CountryPayload }) => updateCountry(id, payload),
      onSuccess: (updated) => {
        qc.setQueryData<Country[]>(["countries"], (old) =>
          old ? old.map(c => (c._id === updated._id ? updated : c)) : []
        );
        qc.setQueryData(["country", updated._id], updated);
      },
    }),

    remove: useMutation({
      mutationFn: (id: string) => deleteCountry(id),
      onSuccess: (_, id) => {
        qc.setQueryData<Country[]>(["countries"], (old) =>
          old ? old.filter(c => c._id !== id) : []
        );
      },
    }),
  };
};
