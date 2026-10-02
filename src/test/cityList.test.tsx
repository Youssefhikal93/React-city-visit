import { screen } from "@testing-library/react";

import { aCity } from "./fakeCitiesService";
import { renderApp } from "./renderApp";

it("lists Cities by most recent visit, undated last", async () => {
  renderApp({
    route: "/app/cities",
    cities: [
      aCity({ id: "athens", cityName: "Athens", date: "2020-05-01T00:00:00.000Z" }),
      aCity({ id: "berlin", cityName: "Berlin", date: null }),
      aCity({ id: "cairo", cityName: "Cairo", date: "2024-05-01T00:00:00.000Z" }),
      aCity({ id: "dublin", cityName: "Dublin", date: "2022-05-01T00:00:00.000Z" }),
    ],
  });

  await screen.findByText("Cairo");
  const names = ["Athens", "Berlin", "Cairo", "Dublin"]
    .map((name) => ({ name, node: screen.getByText(name) }))
    .sort((first, second) =>
      first.node.compareDocumentPosition(second.node) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1,
    )
    .map(({ name }) => name);
  expect(names).toEqual(["Cairo", "Dublin", "Athens", "Berlin"]);
});
