import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";

import { CitiesProvider } from "../context/CitiesContext";
import type { City } from "../types";
import VisitDateEditor from "./VisitDateEditor";

const citiesApi = vi.hoisted(() => ({
  subscribeToCities: vi.fn(),
  updateCity: vi.fn(),
}));

vi.mock("../services/cities", () => citiesApi);
vi.mock("../services/countryLists", () => ({
  removeCountryFromList: vi.fn(async () => undefined),
}));
vi.mock("../context/AuthContext", () => ({
  useAuth: () => ({ user: { username: "tester" } }),
}));

const city: City = {
  id: "stockholm",
  cityName: "Stockholm",
  country: "Sweden",
  emoji: "se",
  date: "2024-01-02T00:00:00.000Z",
  datePrecision: "day",
  notes: "Keep these notes.",
  visitCount: 3,
  memories: [{ id: "memory-1", dataUri: "data:image/jpeg;base64,abc" }],
  createdAt: 1,
  position: { lat: 59.3293, lng: 18.0686 },
};

function renderEditor(cityForEditor = city) {
  const onCancel = vi.fn();
  const onSaved = vi.fn();
  citiesApi.subscribeToCities.mockImplementation(
    (_username: string, onCities: (cities: City[]) => void) => {
      onCities([cityForEditor]);
      return () => undefined;
    },
  );

  return {
    onCancel,
    onSaved,
    user: userEvent.setup(),
    ...render(
      <CitiesProvider>
        <VisitDateEditor
          city={cityForEditor}
          onCancel={onCancel}
          onSaved={onSaved}
        />
      </CitiesProvider>,
    ),
  };
}

beforeEach(() => {
  citiesApi.updateCity.mockReset();
  citiesApi.subscribeToCities.mockReset();
});

test("keeps the editor visible while its visit-date save is pending", async () => {
  let finishSave: (savedCity: City) => void = () => undefined;
  citiesApi.updateCity.mockImplementation(
    () =>
      new Promise<City>((resolve) => {
        finishSave = resolve;
      }),
  );
  const { onSaved, user } = renderEditor();

  await user.click(screen.getByRole("button", { name: "Save visit date" }));

  expect(screen.getByRole("button", { name: "Saving..." })).toBeDisabled();
  expect(screen.getByRole("button", { name: "Cancel" })).toBeDisabled();

  finishSave(city);
  await waitFor(() => expect(onSaved).toHaveBeenCalledOnce());
  expect(citiesApi.updateCity).toHaveBeenCalledWith("tester", "stockholm", {
    date: "2024-01-02T00:00:00.000Z",
    datePrecision: "day",
  });
});

test("keeps the selected visit date ready to retry after a save error", async () => {
  citiesApi.updateCity.mockRejectedValue(new Error("Firebase unavailable"));
  const { onSaved, user } = renderEditor();

  await user.click(screen.getByRole("button", { name: "Save visit date" }));

  expect(
    await screen.findByRole("alert"),
  ).toHaveTextContent("Couldn't save the visit date. Please try again.");
  expect(onSaved).not.toHaveBeenCalled();
  expect(screen.getByRole("button", { name: "Save visit date" })).toBeEnabled();
});

test("cancels without updating a City", async () => {
  const { onCancel, user } = renderEditor();

  await user.click(screen.getByRole("button", { name: "Cancel" }));

  expect(onCancel).toHaveBeenCalledOnce();
  expect(citiesApi.updateCity).not.toHaveBeenCalled();
});

test("does not save when no valid visit date is selected", async () => {
  const { user } = renderEditor();

  fireEvent.change(screen.getByLabelText("Visit date"), {
    target: { value: "not a date" },
  });

  await user.click(screen.getByRole("button", { name: "Save visit date" }));

  expect(screen.getByRole("alert")).toHaveTextContent(
    "Choose a valid visit date.",
  );
  expect(citiesApi.updateCity).not.toHaveBeenCalled();
});

test("does not close the editor when no City was saved", async () => {
  citiesApi.updateCity.mockResolvedValue(null);
  const { onSaved, user } = renderEditor();

  await user.click(screen.getByRole("button", { name: "Save visit date" }));

  expect(await screen.findByRole("alert")).toHaveTextContent(
    "Couldn't save the visit date. Please try again.",
  );
  expect(onSaved).not.toHaveBeenCalled();
});
