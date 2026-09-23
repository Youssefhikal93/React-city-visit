import { fireEvent, screen, waitFor, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { aCity, createFakeCitiesService } from "./fakeCitiesService";
import { renderApp } from "./renderApp";

const firstMemory = { id: "memory-a", dataUri: "data:image/jpeg;base64,first" };
const secondMemory = { id: "memory-b", dataUri: "data:image/jpeg;base64,second" };

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

function renderCity(memories = [firstMemory], legacyImage?: string) {
  return renderApp({
    cities: [
      aCity({ id: "stockholm", cityName: "Stockholm", memories, legacyImage }),
    ],
    route: "/app/cities/stockholm",
  });
}

function mockImageResize() {
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
  const drawImage = vi.fn();
  vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue({
    drawImage,
  } as unknown as CanvasRenderingContext2D);
  return drawImage;
}

const photoSources = [
  ["Gallery", "Choose a Memory from Gallery"],
  ["Camera", "Take a Memory with Camera"],
] as const;

describe("City Memories", () => {
  it("shows the one Memory read from a legacy City", async () => {
    renderApp({
      cities: [
        aCity({
          id: "stockholm",
          cityName: "Stockholm",
          legacyImage: "data:image/jpeg;base64,legacy",
        }),
      ],
      route: "/app/cities/stockholm",
    });

    expect(await screen.findAllByRole("button", { name: /View Memory/ })).toHaveLength(1);
  });

  it("offers exactly Gallery and Camera as photo-source actions", async () => {
    const { user } = renderCity();
    const addMemoryButton = await screen.findByRole("button", { name: "Add a Memory" });
    await user.click(addMemoryButton);

    const sheet = screen.getByRole("dialog", { name: "Add a Memory" });
    expect(
      within(sheet)
        .getAllByRole("button")
        .map((button) => button.textContent?.trim())
        .filter((name) => name === "Gallery" || name === "Camera")
    ).toEqual(["Gallery", "Camera"]);

    expect(screen.getByLabelText("Choose a Memory from Gallery")).not.toHaveAttribute(
      "capture"
    );
    expect(screen.getByLabelText("Take a Memory with Camera")).toHaveAttribute(
      "capture",
      "environment"
    );
  });

  it.each(photoSources)("resizes a selected %s Memory before saving", async (source, inputLabel) => {
    const drawImage = mockImageResize();
    const toBlob = vi
      .spyOn(HTMLCanvasElement.prototype, "toBlob")
      .mockImplementation((callback, type, quality) => {
        expect(type).toBe("image/jpeg");
        expect(quality).toBe(0.75);
        callback(new Blob(["memory"], { type: "image/jpeg" }));
      });

    const { user } = renderCity();
    const addMemoryButton = await screen.findByRole("button", { name: "Add a Memory" });
    await user.click(addMemoryButton);
    await user.click(screen.getByRole("button", { name: source }));

    const input = screen.getByLabelText(inputLabel);
    await user.upload(input, new File(["memory"], "memory.jpg", { type: "image/jpeg" }));

    await waitFor(() => {
      expect(screen.getAllByRole("button", { name: /View Memory/ })).toHaveLength(2);
    });
    expect(drawImage).toHaveBeenCalledWith(expect.any(Image), 0, 0, 800, 600);
    expect(toBlob).toHaveBeenCalledTimes(1);
    await waitFor(() => expect(addMemoryButton).toHaveFocus());
  });

  it("dismisses the source sheet with Escape or its backdrop and returns focus", async () => {
    const { user } = renderCity();
    const addMemoryButton = await screen.findByRole("button", { name: "Add a Memory" });
    await user.click(addMemoryButton);

    expect(screen.getByRole("button", { name: "Gallery" })).toHaveFocus();
    await user.tab();
    expect(screen.getByRole("button", { name: "Camera" })).toHaveFocus();
    await user.tab();
    expect(screen.getByRole("button", { name: "Close photo source options" })).toHaveFocus();
    await user.tab();
    expect(screen.getByRole("button", { name: "Gallery" })).toHaveFocus();
    await user.keyboard("{Escape}");

    await waitFor(() => expect(addMemoryButton).toHaveFocus());
    expect(screen.queryByRole("dialog", { name: "Add a Memory" })).not.toBeInTheDocument();

    await user.click(addMemoryButton);
    fireEvent.mouseDown(screen.getByRole("dialog", { name: "Add a Memory" }));
    await waitFor(() => expect(addMemoryButton).toHaveFocus());
  });

  it("returns focus without saving when the native chooser is cancelled", async () => {
    const { user } = renderCity();
    const addMemoryButton = await screen.findByRole("button", { name: "Add a Memory" });
    await user.click(addMemoryButton);
    await user.click(screen.getByRole("button", { name: "Gallery" }));

    fireEvent(
      screen.getByLabelText("Choose a Memory from Gallery"),
      new Event("cancel", { bubbles: true })
    );

    expect(screen.getAllByRole("button", { name: /View Memory/ })).toHaveLength(1);
    await waitFor(() => expect(addMemoryButton).toHaveFocus());
  });

  it("shows resize failures without saving and lets the Account retry", async () => {
    mockImageResize();
    vi.spyOn(HTMLCanvasElement.prototype, "toBlob")
      .mockImplementationOnce((callback) => callback(null))
      .mockImplementationOnce((callback) =>
        callback(new Blob(["memory"], { type: "image/jpeg" }))
      );

    const { user } = renderCity();
    const galleryInput = await screen.findByLabelText("Choose a Memory from Gallery");

    await user.click(screen.getByRole("button", { name: "Add a Memory" }));
    await user.click(screen.getByRole("button", { name: "Gallery" }));
    await user.upload(galleryInput, new File(["memory"], "memory.jpg", { type: "image/jpeg" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Couldn't add that Memory. Please try again."
    );
    expect(screen.getAllByRole("button", { name: /View Memory/ })).toHaveLength(1);
    await waitFor(() => expect(screen.getByRole("button", { name: "Add a Memory" })).toHaveFocus());

    await user.click(screen.getByRole("button", { name: "Add a Memory" }));
    await user.click(screen.getByRole("button", { name: "Gallery" }));
    await user.upload(galleryInput, new File(["memory"], "memory.jpg", { type: "image/jpeg" }));

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

  it("counts a legacy Memory toward the five-Memory limit", async () => {
    renderCity([
      secondMemory,
      { id: "memory-c", dataUri: "data:image/jpeg;base64,third" },
      { id: "memory-d", dataUri: "data:image/jpeg;base64,fourth" },
      { id: "memory-e", dataUri: "data:image/jpeg;base64,fifth" },
    ], "data:image/jpeg;base64,legacy");

    expect(await screen.findByRole("button", { name: "Add a Memory" })).toBeDisabled();
    expect(screen.getByText("A City can hold up to five Memories.")).toBeVisible();
  });

  it("lets a legacy City add four Memories before reaching the limit", async () => {
    const cities = createFakeCitiesService([
      aCity({
        id: "stockholm",
        legacyImage: "data:image/jpeg;base64,legacy",
      }),
    ]);

    for (const dataUri of ["one", "two", "three", "four"]) {
      await cities.addMemory("tester", "stockholm", `data:image/jpeg;base64,${dataUri}`);
    }

    await expect(cities.fetchCity("tester", "stockholm")).resolves.toMatchObject({
      memories: [
        { id: "legacy-image", dataUri: "data:image/jpeg;base64,legacy" },
        { id: "memory-1", dataUri: "data:image/jpeg;base64,one" },
        { id: "memory-2", dataUri: "data:image/jpeg;base64,two" },
        { id: "memory-3", dataUri: "data:image/jpeg;base64,three" },
        { id: "memory-4", dataUri: "data:image/jpeg;base64,four" },
      ],
    });
  });

  it("deletes a legacy Memory without deleting other converged Memories", async () => {
    const cities = createFakeCitiesService([
      aCity({
        id: "stockholm",
        memories: [
          { id: "legacy-image", dataUri: "data:image/jpeg;base64,legacy" },
          secondMemory,
        ],
      }),
    ]);

    await cities.deleteMemory("tester", "stockholm", "legacy-image");

    await expect(cities.fetchCity("tester", "stockholm")).resolves.toMatchObject({
      memories: [secondMemory],
    });
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

  it("returns focus after rejecting a non-image file without saving", async () => {
    const { user } = renderCity();
    const addMemoryButton = await screen.findByRole("button", { name: "Add a Memory" });
    const input = await screen.findByLabelText("Choose a Memory from Gallery");

    await user.click(addMemoryButton);
    await user.click(screen.getByRole("button", { name: "Gallery" }));

    fireEvent.change(input, {
      target: { files: [new File(["text"], "notes.txt", { type: "text/plain" })] },
    });

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Choose an image file for this Memory."
    );
    expect(screen.getAllByRole("button", { name: /View Memory/ })).toHaveLength(1);
    await waitFor(() => expect(addMemoryButton).toHaveFocus());
  });
});
