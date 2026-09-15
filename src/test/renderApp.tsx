import { render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { Unsubscribe } from "firebase/database";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { vi } from "vitest";

import CityPage from "../components/City";
import CityList from "../components/CityList";
import CountriesList from "../components/CountriesList";
import Form from "../components/Form";
import { CitiesProvider } from "../context/CitiesContext";
import ProtectedRoute from "../pages/ProtectedRoute";
import AppIndexRedirect from "../pages/AppIndexRedirect";
import AppLayout from "../pages/AppLayout";
import Map from "../components/Map";
import type { City, CityUpdate, NewCity } from "../types";
import { PHONE_MEDIA_QUERY } from "../hooks/useIsPhone";
import {
  createFakeCitiesService,
  type FakeCitiesService,
} from "./fakeCitiesService";

type CitiesApiMock = {
  subscribeToCities: ReturnType<
    typeof vi.fn<
      (
        username: string,
        onCities: (cities: City[]) => void,
        onError: (error: Error) => void
      ) => Unsubscribe
    >
  >;
  fetchCity: ReturnType<
    typeof vi.fn<(username: string, id: string) => Promise<City>>
  >;
  createCity: ReturnType<
    typeof vi.fn<(username: string, city: NewCity) => Promise<City>>
  >;
  updateCity: ReturnType<
    typeof vi.fn<
      (username: string, id: string, updates: CityUpdate) => Promise<City>
    >
  >;
  deleteCity: ReturnType<
    typeof vi.fn<(username: string, id: string) => Promise<void>>
  >;
};

const citiesApi = vi.hoisted<CitiesApiMock>(() => ({
  subscribeToCities: vi.fn(),
  fetchCity: vi.fn(),
  createCity: vi.fn(),
  updateCity: vi.fn(),
  deleteCity: vi.fn(),
}));

vi.mock("../services/cities", () => citiesApi);
vi.mock("../services/firebase", () => ({
  auth: { currentUser: null },
  db: {},
  isFirebaseConfigured: false,
}));
vi.mock("../context/AuthContext", () => ({
  useAuth: () => ({
    user: { uid: "test-uid", username: "tester", displayName: "Tester" },
    isAuthenticated: true,
    isRestoring: false,
    error: null,
    loading: false,
    login: async () => ({ success: true }),
    signup: async () => ({ success: true }),
    logout: async () => undefined,
    clearError: () => undefined,
  }),
}));
vi.mock("../components/Map", async () => {
  const { default: MapStub } = await import("./MapStub");
  return { default: MapStub };
});

export interface RenderAppOptions {
  cities?: City[];
  route?: string;
  viewport?: "phone" | "wide";
}

function installMatchMedia(viewport: "phone" | "wide") {
  window.matchMedia = (query: string): MediaQueryList => {
    const changeListeners = new Set<EventListenerOrEventListenerObject>();
    const legacyListeners = new Set<
      (this: MediaQueryList, event: MediaQueryListEvent) => unknown
    >();
    const mediaQuery: MediaQueryList = {
      matches: viewport === "phone" && query === PHONE_MEDIA_QUERY,
      media: query,
      onchange: null,
      addListener(listener) {
        if (listener) legacyListeners.add(listener);
      },
      removeListener(listener) {
        if (listener) legacyListeners.delete(listener);
      },
      addEventListener(
        _type: string,
        listener: EventListenerOrEventListenerObject | null
      ) {
        if (listener) changeListeners.add(listener);
      },
      removeEventListener(
        _type: string,
        listener: EventListenerOrEventListenerObject | null
      ) {
        if (listener) changeListeners.delete(listener);
      },
      dispatchEvent(event) {
        changeListeners.forEach((listener) => {
          if (typeof listener === "function") listener.call(mediaQuery, event);
          else listener.handleEvent(event);
        });
        legacyListeners.forEach((listener) =>
          listener.call(mediaQuery, event as MediaQueryListEvent)
        );
        return true;
      },
    };

    return mediaQuery;
  };
}

function configureFakeCitiesService(fakeCitiesService: FakeCitiesService) {
  citiesApi.subscribeToCities.mockImplementation(
    fakeCitiesService.subscribeToCities
  );
  citiesApi.fetchCity.mockImplementation(fakeCitiesService.fetchCity);
  citiesApi.createCity.mockImplementation(fakeCitiesService.createCity);
  citiesApi.updateCity.mockImplementation(fakeCitiesService.updateCity);
  citiesApi.deleteCity.mockImplementation(fakeCitiesService.deleteCity);
}

export function renderApp({
  cities = [],
  route = "/app/cities",
  viewport = "wide",
}: RenderAppOptions = {}) {
  installMatchMedia(viewport);
  configureFakeCitiesService(createFakeCitiesService(cities));

  return {
    user: userEvent.setup(),
    ...render(
      <MemoryRouter initialEntries={[route]}>
        <CitiesProvider>
          <Routes>
            <Route
              path="app"
              element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<AppIndexRedirect />} />
              <Route path="map" element={<Map />} />
              <Route path="cities" element={<CityList />} />
              <Route path="countries" element={<CountriesList />} />
              <Route path="cities/:id" element={<CityPage />} />
              <Route path="form" element={<Form />} />
            </Route>
          </Routes>
        </CitiesProvider>
      </MemoryRouter>
    ),
  };
}
