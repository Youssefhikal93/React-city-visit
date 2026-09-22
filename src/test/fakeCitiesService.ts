import type * as citiesApi from "../services/cities";
import { serializeVisitDate } from "../services/visitDate";
import type { City, Memory } from "../types";

type CitiesListener = (cities: City[]) => void;

const LEGACY_MEMORY_ID = "legacy-image";

export interface FakeCity extends City {
  legacyImage?: string;
}

interface FakeStoredCity extends Omit<City, "memories"> {
  image?: string;
  memories: Memory[];
}

export type FakeCitiesService = Pick<
  typeof citiesApi,
  | "subscribeToCities"
  | "fetchCity"
  | "createCity"
  | "updateCity"
  | "deleteCity"
  | "addMemory"
  | "deleteMemory"
>;

const defaultCity: FakeCity = {
  id: "city-1",
  cityName: "Stockholm",
  country: "Sweden",
  emoji: "se",
  date: "2024-01-01T00:00:00.000Z",
  datePrecision: "day",
  notes: "",
  memories: [],
  createdAt: 1,
  position: { lat: 59.3293, lng: 18.0686 },
};

let nextCityId = 1;

export function aCity(overrides: Partial<FakeCity> = {}): FakeCity {
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
  return {
    ...city,
    position: { ...city.position },
    memories: city.memories.map((memory) => ({ ...memory })),
  };
}

function copyStoredCity(city: FakeStoredCity): FakeStoredCity {
  return {
    ...copyCity(city),
    image: city.image,
  };
}

function storeCity(city: FakeCity): FakeStoredCity {
  const { legacyImage, ...storedCity } = city;
  return {
    ...copyCity(storedCity),
    image: legacyImage,
  };
}

function readCity(city: FakeStoredCity): City {
  const { image, ...cityWithoutImage } = city;
  return {
    ...copyCity(cityWithoutImage),
    memories: [
      ...(image
        ? [{ id: LEGACY_MEMORY_ID, dataUri: image }]
        : []),
      ...city.memories.map((memory) => ({ ...memory })),
    ],
  };
}

export function createFakeCitiesService(seedCities: FakeCity[] = []): FakeCitiesService {
  let cities = sortCities(seedCities.map(storeCity));
  let nextId = 1;
  let nextMemoryId = 1;
  const listeners = new Set<CitiesListener>();

  function notifyListeners() {
    const cityList = sortCities(cities).map(readCity);
    listeners.forEach((onCities) => onCities(cityList));
  }

  function cityById(id: string): FakeStoredCity {
    const city = cities.find((savedCity) => savedCity.id === id);
    if (!city) throw new Error("That city is no longer in your list.");
    return copyStoredCity(city);
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
      onCities(sortCities(cities).map(readCity));
      return () => listeners.delete(onCities);
    },
    async fetchCity(_username, id) {
      return readCity(cityById(id));
    },
    async createCity(_username, newCity) {
      const createdCity: FakeStoredCity = {
        id: newCityId(),
        cityName: newCity.cityName,
        country: newCity.country,
        emoji: newCity.emoji,
        date: serializeVisitDate(newCity.date, newCity.datePrecision),
        datePrecision: newCity.datePrecision,
        notes: newCity.notes,
        memories: [],
        createdAt: Math.max(0, ...cities.map((city) => city.createdAt)) + 1,
        position: {
          lat: Number(newCity.position.lat),
          lng: Number(newCity.position.lng),
        },
      };

      cities = [...cities, createdCity];
      notifyListeners();
      return readCity(createdCity);
    },
    async updateCity(_username, id, updates) {
      const updatedCity = { ...cityById(id), ...updates };
      cities = cities.map((city) => (city.id === id ? updatedCity : city));
      notifyListeners();
      return readCity(updatedCity);
    },
    async deleteCity(_username, id) {
      cityById(id);
      cities = cities.filter((city) => city.id !== id);
      notifyListeners();
    },
    async addMemory(_username, id, dataUri) {
      const city = cityById(id);
      const memoryId = `memory-${nextMemoryId}`;
      nextMemoryId += 1;
      const updatedCity = {
        ...city,
        image: undefined,
        memories: [
          ...(city.image
            ? [{ id: LEGACY_MEMORY_ID, dataUri: city.image }]
            : city.memories),
          { id: memoryId, dataUri },
        ],
      };
      cities = cities.map((savedCity) =>
        savedCity.id === id ? updatedCity : savedCity
      );
      notifyListeners();
    },
    async deleteMemory(_username, id, memoryId) {
      const city = cityById(id);
      const updatedCity = {
        ...city,
        image:
          memoryId === LEGACY_MEMORY_ID && city.image ? undefined : city.image,
        memories:
          memoryId === LEGACY_MEMORY_ID && city.image
            ? city.memories
            : city.memories.filter((memory) => memory.id !== memoryId),
      };
      cities = cities.map((savedCity) =>
        savedCity.id === id ? updatedCity : savedCity
      );
      notifyListeners();
    },
  };
}
