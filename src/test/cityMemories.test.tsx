import { fireEvent, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { aCity } from "./fakeCitiesService";
import { renderApp } from "./renderApp";

const firstMemory = { id: "memory-a", dataUri: "data:image/jpeg;base64,first" };
const secondMemory = { id: "memory-b", dataUri: "data:image/jpeg;base64,second" };

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

function renderCity(memories = [firstMemory]) {
  return renderApp({
    cities: [aCity({ id: "stockholm", cityName: "Stockholm", memories })],
    route: "/app/cities/stockholm",
  });
}

describe("City Memories", () => {
  it("shows the one Memory read from a legacy City", async () => {
    renderApp({
      cities: [
        aCity({
          id: "stockholm",
          cityName: "Stockholm",
          memories: [{ id: "legacy-image", dataUri: "data:image/jpeg;base64,legacy" }],
        }),
      ],
      route: "/app/cities/stockholm",
    });

    expect(await screen.findAllByRole("button", { name: /View Memory/ })).toHaveLength(1);
  });

  it("adds a Memory to the grid", async () => {
    vi.stubGlobal(
      "Image",
      class {
        width = 1600;
        height = 1200;
        onload: ((event: Event) => void) | null = null;
        onerror: ((event: Event) => void) | null = null;

        set src(_value: string) {
          this.onload?.(new Event("load"));
        }
      }
    );
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue({
      drawImage: vi.fn(),
    } as unknown as CanvasRenderingContext2D);
    vi.spyOn(HTMLCanvasElement.prototype, "toBlob").mockImplementation((callback) => {
      callback(new Blob(["memory"], { type: "image/jpeg" }));
    });

    const { user } = renderCity();
    const input = await screen.findByLabelText("Add a Memory");
    await user.upload(input, new File(["memory"], "memory.jpg", { type: "image/jpeg" }));

    await waitFor(() => {
      expect(screen.getAllByRole("button", { name: /View Memory/ })).toHaveLength(2);
    });
  });

  it("deletes only the selected Memory", async () => {
    vi.stubGlobal("confirm", vi.fn(() => true));
    const { user } = renderCity([firstMemory, secondMemory]);

    await screen.findByRole("button", { name: "Delete Memory 1" });
    await user.click(screen.getByRole("button", { name: "Delete Memory 1" }));

    await waitFor(() => {
      expect(screen.getAllByRole("button", { name: /View Memory/ })).toHaveLength(1);
    });
    expect(screen.getByRole("img", { name: "Memory 1 from Stockholm" })).toHaveAttribute(
      "src",
      secondMemory.dataUri
    );
  });

  it("disables adding after five Memories and explains why", async () => {
    renderCity([
      firstMemory,
      secondMemory,
      { id: "memory-c", dataUri: "data:image/jpeg;base64,third" },
      { id: "memory-d", dataUri: "data:image/jpeg;base64,fourth" },
      { id: "memory-e", dataUri: "data:image/jpeg;base64,fifth" },
    ]);

    expect(await screen.findByRole("button", { name: "Add a Memory" })).toBeDisabled();
    expect(screen.getByText("A City can hold up to five Memories.")).toBeVisible();
  });

  it("enlarges a Memory and returns to the grid when closed", async () => {
    const { user } = renderCity();

    await user.click(await screen.findByRole("button", { name: "View Memory 1" }));
    expect(screen.getByRole("dialog", { name: "Enlarged Memory" })).toBeVisible();

    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog", { name: "Enlarged Memory" })).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "View Memory 1" }));

    await user.click(screen.getByRole("button", { name: "Close enlarged Memory" }));
    expect(screen.queryByRole("dialog", { name: "Enlarged Memory" })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "View Memory 1" })).toBeVisible();
  });

  it("shows an error for a non-image file without adding a Memory", async () => {
    renderCity();
    const input = await screen.findByLabelText("Add a Memory");

    fireEvent.change(input, {
      target: { files: [new File(["text"], "notes.txt", { type: "text/plain" })] },
    });

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Choose an image file for this Memory."
    );
    expect(screen.getAllByRole("button", { name: /View Memory/ })).toHaveLength(1);
  });
});
