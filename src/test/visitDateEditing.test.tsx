import { fireEvent, screen, within } from "@testing-library/react";

import { visitDateForPicker } from "../services/visitDate";
import { aCity } from "./fakeCitiesService";
import { renderApp } from "./renderApp";

it("edits a City to month-only precision without changing its notes or visit count", async () => {
  const { user } = renderApp({
    route: "/app/cities/stockholm",
    cities: [
      aCity({
        id: "stockholm",
        cityName: "Stockholm",
        date: "2024-01-02T00:00:00.000Z",
        datePrecision: "day",
        notes: "A snowy weekend.",
        visitCount: 3,
      }),
    ],
  });

  await user.click(await screen.findByRole("button", { name: "Edit visit date" }));
  await user.click(screen.getByLabelText("Month and year"));
  fireEvent.change(screen.getByLabelText("Visit date"), {
    target: { value: "04/2024" },
  });
  await user.click(screen.getByRole("button", { name: "Save visit date" }));

  expect(await screen.findByText("April 2024")).toBeVisible();
  expect(screen.getByText("A snowy weekend.")).toBeVisible();
  expect(
    within(screen.getByRole("group", { name: "Visits to Stockholm" })).getByText(
      "3",
    ),
  ).toBeVisible();
});

it("lets a legacy City without a saved date add a full visit date", async () => {
  const { user } = renderApp({
    route: "/app/cities/legacy",
    cities: [
      aCity({
        id: "legacy",
        cityName: "Legacy City",
        date: null,
        datePrecision: "day",
      }),
    ],
  });

  expect(await screen.findByText("No visit date saved yet.")).toBeVisible();
  await user.click(screen.getByRole("button", { name: "Add visit date" }));
  fireEvent.change(screen.getByLabelText("Visit date"), {
    target: { value: "05/04/2024" },
  });
  await user.click(screen.getByRole("button", { name: "Save visit date" }));

  expect(await screen.findByText(/April 5, 2024/)).toBeVisible();
});

it("uses the intended local calendar month for a month-only UTC record", () => {
  const pickerDate = visitDateForPicker(
    "2024-03-01T00:00:00.000Z",
    "month",
  );

  expect(pickerDate).not.toBeNull();
  expect(pickerDate?.getFullYear()).toBe(2024);
  expect(pickerDate?.getMonth()).toBe(2);
  expect(pickerDate?.getDate()).toBe(1);
});
