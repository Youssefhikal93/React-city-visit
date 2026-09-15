import { screen, within } from "@testing-library/react";
import { aCity } from "./fakeCitiesService";
import { renderApp } from "./renderApp";

it("expands a Country and keeps edited visits when reopening its Cities", async () => {
  const { user } = renderApp({
    viewport: "phone",
    route: "/app/countries",
    cities: [
      aCity({ id: "paris", cityName: "Paris", country: "France", emoji: "fr" }),
      aCity({ id: "oslo", cityName: "Oslo", country: "Norway", emoji: "no" }),
    ],
  });
  await user.click(await screen.findByRole("button", { name: /France/ }));
  expect(screen.getByRole("link", { name: "Paris" })).toBeVisible();
  expect(screen.queryByRole("link", { name: "Oslo" })).not.toBeInTheDocument();
  expect(
    screen.getByRole("button", { name: "Fewer visits to Paris" }),
  ).toBeDisabled();
  await user.click(
    screen.getByRole("button", { name: "More visits to Paris" }),
  );
  expect(
    within(screen.getByRole("group", { name: "Visits to Paris" })).getByText(
      "2",
    ),
  ).toBeVisible();
  await user.click(screen.getByRole("button", { name: /France/ }));
  await user.click(screen.getByRole("button", { name: /France/ }));
  expect(
    within(screen.getByRole("group", { name: "Visits to Paris" })).getByText(
      "2",
    ),
  ).toBeVisible();
  await user.click(screen.getByRole("link", { name: "Paris" }));
  expect(await screen.findByRole("heading", { name: "Paris" })).toBeVisible();
  expect(
    within(screen.getByRole("group", { name: "Visits to Paris" })).getByText(
      "2",
    ),
  ).toBeVisible();
});
