import { screen, within } from "@testing-library/react";

import { aCity } from "./fakeCitiesService";
import { renderApp } from "./renderApp";

function section(name: string): HTMLElement {
  return screen.getByRole("region", { name: new RegExp(`^${name}`) });
}

it("shows Lived in, Visited, and Planned sections in that order", async () => {
  renderApp({
    route: "/app/countries",
    cities: [aCity({ id: "paris", country: "France", emoji: "fr" })],
    countryLists: { livedInCountryCodes: ["se"], plannedCountryCodes: ["is"] },
  });

  const headings = (await screen.findAllByRole("heading", { level: 3 })).map(
    (heading) => heading.textContent?.replace(/\d+$/, "").trim(),
  );
  expect(headings).toEqual(["Lived in", "Visited", "Planned"]);
  expect(within(section("Lived in")).getByText("Sweden")).toBeVisible();
  expect(within(section("Visited")).getByText("France")).toBeVisible();
  expect(within(section("Planned")).getByText("Iceland")).toBeVisible();
});

it("lists a lived-in Country that also holds Cities in both sections", async () => {
  renderApp({
    route: "/app/countries",
    cities: [aCity({ id: "paris", country: "France", emoji: "fr" })],
    countryLists: { livedInCountryCodes: ["fr"] },
  });

  expect(await within(section("Lived in")).findByText("France")).toBeVisible();
  expect(within(section("Visited")).getByText("France")).toBeVisible();
  expect(
    screen.getByRole("heading", { level: 2, name: /Countries/ }),
  ).toHaveTextContent("1");
});

it.each([
  ["Lived in", "no", "Norway"],
  ["Planned", "jp", "Japan"],
])("adds several Countries to %s and removes one", async (title, code, name) => {
  const { user } = renderApp({ route: "/app/countries" });
  const picker = await screen.findByRole("combobox", {
    name: `Add a Country to ${title}`,
  });
  expect(within(section(title)).getByText(/No .* Countries yet/)).toBeVisible();

  await user.selectOptions(picker, code);
  await user.selectOptions(picker, "it");

  const list = within(section(title)).getByRole("list", { name: title });
  expect(within(list).getByText(name)).toBeVisible();
  expect(within(list).getByText("Italy")).toBeVisible();
  expect(
    within(picker).queryByRole("option", { name }),
  ).not.toBeInTheDocument();

  await user.click(
    screen.getByRole("button", { name: `Remove ${name} from ${title}` }),
  );
  expect(within(list).queryByText(name)).not.toBeInTheDocument();
  expect(within(list).getByText("Italy")).toBeVisible();
});

it("allows the same Country on both lists", async () => {
  const { user } = renderApp({
    route: "/app/countries",
    countryLists: { livedInCountryCodes: ["eg"] },
  });

  await user.selectOptions(
    await screen.findByRole("combobox", { name: "Add a Country to Planned" }),
    "eg",
  );

  expect(within(section("Lived in")).getByText("Egypt")).toBeVisible();
  expect(within(section("Planned")).getByText("Egypt")).toBeVisible();
});
