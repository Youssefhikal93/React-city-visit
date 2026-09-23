import { screen } from "@testing-library/react";

import { aCity } from "./fakeCitiesService";
import { renderApp } from "./renderApp";

const fullVisitDate = "2024-03-31T00:00:00.000Z";
const legacyListDate = new Intl.DateTimeFormat("en", {
  day: "numeric",
  month: "short",
  year: "numeric",
}).format(new Date(fullVisitDate));
const legacyDetailDate = new Intl.DateTimeFormat("en", {
  day: "numeric",
  month: "long",
  year: "numeric",
  weekday: "long",
}).format(new Date(fullVisitDate));

it("renders a month-only City visit without inventing a day", async () => {
  const { user } = renderApp({
    cities: [
      aCity({
        id: "march",
        cityName: "March City",
        date: "2024-03-01T00:00:00.000Z",
        datePrecision: "month",
      }),
    ],
  });

  const monthOnlyDate = await screen.findByText("Mar 2024");
  expect(monthOnlyDate).toHaveAttribute("datetime", "2024-03");

  await user.click(screen.getByRole("link", { name: /March City/ }));
  expect(await screen.findByText("March 2024")).toBeVisible();
  expect(screen.queryByText(/Sunday|Monday|Tuesday|Wednesday|Thursday|Friday|Saturday/)).not.toBeInTheDocument();
});

it("keeps a full-date City visit's legacy rendering", async () => {
  const { user } = renderApp({
    cities: [
      aCity({
        id: "day",
        cityName: "Day City",
        date: fullVisitDate,
        datePrecision: "day",
      }),
    ],
  });

  expect(await screen.findByText(legacyListDate)).toBeVisible();
  await user.click(screen.getByRole("link", { name: /Day City/ }));
  expect(await screen.findByText(legacyDetailDate)).toBeVisible();
});
