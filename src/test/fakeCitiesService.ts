import type * as citiesApi from "../services/cities";
import type { City, NewCity } from "../types";

type CitiesListener = (cities: City[]) => void;

export type FakeCitiesService = Pick<
  typeof citiesApi,
  | "subscribeToCities"
  | "fetchCity"
  | "createCity"
  | "updateCity"
  | "deleteCity"
>;

const defaultCity: City = {
  id: "city-1",
  cityName: "Stockholm",
  country: "Sweden",
  emoji: "se",
  date: "2024-01-01T00:00:00.000Z",
  notes: "",
  image: null,
  createdAt: 1,
  position: { lat: 59.3293, lng: 18.0686 },
};

let nextCityId = 1;

export function aCity(overrides: Partial<City> = {}): City {
  const id = overrides.id ?? `city-${nextCityId}`;
  if (!overrides.id) nextCityId += 1;

  return {
    ...defaultCity,
    ...overrides,
    id,
    position: overrides.position ?? { ...defaultCity.position },
  };
}

function sortCities(cities: City[]): City[] {
  return [...cities].sort((firstCity, secondCity) => {
    return firstCity.createdAt - secondCity.createdAt;
  });
}

function copyCity(city: City): City {
  return { ...city, position: { ...city.position } };
}

function serializeDate(date: NewCity["date"]): string {
  if (!date) return new Date().toISOString();
  return date instanceof Date ? date.toISOString() : new Date(date).toISOString();
}

export function createFakeCitiesService(seedCities: City[] = []): FakeCitiesService {
  let cities = sortCities(seedCities.map(copyCity));
  let nextId = 1;
  const listeners = new Set<CitiesListener>();

  function notifyListeners() {
    const cityList = sortCities(cities).map(copyCity);
    listeners.forEach((onCities) => onCities(cityList));
  }

  function cityById(id: string): City {
    const city = cities.find((savedCity) => savedCity.id === id);
    if (!city) throw new Error("That city is no longer in your list.");
    return copyCity(city);
  }

  function newCityId(): string {
    let id = `city-${nextId}`;
    while (cities.some((city) => city.id === id)) {
      nextId += 1;
      id = `city-${nextId}`;
    }
    nextId += 1;
    return id;
  }

  return {
    subscribeToCities(_username, onCities, _onError) {
      listeners.add(onCities);
      onCities(sortCities(cities).map(copyCity));
      return () => listeners.delete(onCities);
    },
    async fetchCity(_username, id) {
      return cityById(id);
    },
    async createCity(_username, newCity) {
      const createdCity: City = {
        id: newCityId(),
        cityName: newCity.cityName,
        country: newCity.country,
        emoji: newCity.emoji,
        date: serializeDate(newCity.date),
        notes: newCity.notes,
        image: null,
        createdAt: Math.max(0, ...cities.map((city) => city.createdAt)) + 1,
        position: {
          lat: Number(newCity.position.lat),
          lng: Number(newCity.position.lng),
        },
      };

      cities = [...cities, createdCity];
      notifyListeners();
      return copyCity(createdCity);
    },
    async updateCity(_username, id, updates) {
      const updatedCity = { ...cityById(id), ...updates };
      cities = cities.map((city) => (city.id === id ? updatedCity : city));
      notifyListeners();
      return copyCity(updatedCity);
    },
    async deleteCity(_username, id) {
      cityById(id);
      cities = cities.filter((city) => city.id !== id);
      notifyListeners();
    },
  };
}
