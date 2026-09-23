import { act, render, waitFor } from "@testing-library/react";
import { vi } from "vitest";

import { CitiesProvider, useCities } from "../context/CitiesContext";
import type { NewCity } from "../types";
import { aCity } from "./fakeCitiesService";

const citiesApi = vi.hoisted(() => ({
  subscribeToCities: vi.fn(),
  createCity: vi.fn(),
}));
const countryListsApi = vi.hoisted(() => ({
  removeCountryFromList: vi.fn(),
}));

vi.mock("../services/cities", () => citiesApi);
vi.mock("../services/countryLists", () => countryListsApi);
vi.mock("../context/AuthContext", () => ({
  useAuth: () => ({ user: { username: "tester" } }),
}));

const newCity: NewCity = {
  cityName: "Reykjavík",
  country: "Iceland",
  emoji: "IS",
  date: "2025-06-01",
  datePrecision: "day",
  notes: "",
  position: { lat: 64.14, lng: -21.94 },
};

let createCity: (city: NewCity) => Promise<unknown> = async () => undefined;

function CreateCityProbe() {
  createCity = useCities().createCity;
  return null;
}

beforeEach(() => {
  vi.clearAllMocks();
  citiesApi.subscribeToCities.mockImplementation((_username, onCities) => {
    onCities([]);
    return () => undefined;
  });
  countryListsApi.removeCountryFromList.mockResolvedValue(undefined);
});

it("takes a planned Country off the list once a City is added there", async () => {
  citiesApi.createCity.mockResolvedValue(
    aCity({ id: "reykjavik", cityName: "Reykjavík", country: "Iceland", emoji: "IS" }),
  );
  render(
    <CitiesProvider>
      <CreateCityProbe />
    </CitiesProvider>,
  );

  await act(async () => {
    await createCity(newCity);
  });

  await waitFor(() =>
    expect(countryListsApi.removeCountryFromList).toHaveBeenCalledWith(
      "tester",
      "planned",
      "is",
    ),
  );
});

it("leaves the planned list alone when the City isn't saved", async () => {
  citiesApi.createCity.mockRejectedValue(new Error("Write denied."));
  render(
    <CitiesProvider>
      <CreateCityProbe />
    </CitiesProvider>,
  );

  await act(async () => {
    await createCity(newCity);
  });

  expect(countryListsApi.removeCountryFromList).not.toHaveBeenCalled();
});
