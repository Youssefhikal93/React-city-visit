import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { useCities } from "../context/CitiesContext";
import { mapCityTarget } from "../map/mapBehaviour";
import type { Memory } from "../types";
import { fitWithinLongSide } from "./memoryDimensions";
import Spinner from "./Spinner";

const MAX_MEMORIES = 5;
const MAX_FILE_SIZE = 10 * 1024 * 1024;

const formatDate = (date: string | null) =>
  new window.Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "long",
    year: "numeric",
    weekday: "long",
  }).format(new Date(date ?? Date.now()));

function resizeImage(file: File): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Could not read that Memory."));
    reader.onload = (event) => {
      const source = event.target?.result;
      if (typeof source !== "string") {
        reject(new Error("Could not read that Memory."));
        return;
      }

      const image = new Image();
      image.onerror = () => reject(new Error("That file is not an image."));
      image.onload = () => {
        const dimensions = fitWithinLongSide(image.width, image.height, 800);
        const canvas = document.createElement("canvas");
        canvas.width = dimensions.width;
        canvas.height = dimensions.height;
        const context = canvas.getContext("2d");
        if (!context) {
          reject(new Error("Canvas is unavailable in this browser."));
          return;
        }

        context.drawImage(image, 0, 0, dimensions.width, dimensions.height);
        canvas.toBlob(
          (blob) =>
            blob
              ? resolve(blob)
              : reject(new Error("Could not encode that Memory.")),
          "image/jpeg",
          0.75
        );
      };
      image.src = source;
    };
    reader.readAsDataURL(file);
  });
}

function convertToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") resolve(reader.result);
      else reject(new Error("Could not encode that Memory."));
    };
    reader.onerror = () => reject(new Error("Could not encode that Memory."));
    reader.readAsDataURL(blob);
  });
}

function City() {
  const [isAddingMemory, setIsAddingMemory] = useState(false);
  const [memoryError, setMemoryError] = useState("");
  const [selectedMemory, setSelectedMemory] = useState<Memory | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentCity, getCity, isLoading, addMemory, deleteMemory } = useCities();

  useEffect(() => {
    if (id) getCity(id);
  }, [id, getCity]);

  const memories = currentCity?.memories;

  useEffect(() => {
    if (
      selectedMemory &&
      !memories?.some((memory) => memory.id === selectedMemory.id)
    ) {
      setSelectedMemory(null);
    }
  }, [memories, selectedMemory]);

  useEffect(() => {
    if (!selectedMemory) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setSelectedMemory(null);
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedMemory]);

  async function uploadMemory(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file || !id || isAddingMemory) return;

    setMemoryError("");
    if (!file.type.startsWith("image/")) {
      setMemoryError("Choose an image file for this Memory.");
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      setMemoryError("That Memory must be 10MB or smaller.");
      return;
    }

    setIsAddingMemory(true);
    try {
      const optimizedMemory = await resizeImage(file);
      await addMemory(id, await convertToBase64(optimizedMemory));
    } catch (error) {
      console.error("Error adding Memory:", error);
      setMemoryError("Couldn't add that Memory. Please try again.");
    } finally {
      setIsAddingMemory(false);
    }
  }

  async function removeMemory(memory: Memory) {
    if (!id || !window.confirm("Delete this Memory?")) return;

    setMemoryError("");
    try {
      await deleteMemory(id, memory.id);
    } catch (error) {
      console.error("Error deleting Memory:", error);
      setMemoryError("Couldn't delete that Memory. Please try again.");
    }
  }

  if (isLoading || !currentCity) return <Spinner />;

  const { cityName, emoji, date, notes } = currentCity;
  const cityMemories = memories ?? [];
  const cannotAddMemory = cityMemories.length >= MAX_MEMORIES;

  return (
    <article className="w-full min-w-0 max-w-4xl mx-auto font-manrope">
      <div className="overflow-hidden rounded-xl border border-dark-2/50 bg-gradient-to-br from-dark-2 to-dark-1 shadow-2xl sm:rounded-2xl">
        <header className="border-b border-dark-2/30 bg-gradient-to-r from-brand-1/10 to-brand-2/10 px-4 py-5 sm:px-8 sm:py-10 md:px-10 md:py-12">
          <div className="flex flex-col gap-5 sm:gap-6">
            <div className="flex flex-col gap-3">
              <h2 className="text-xs font-extrabold uppercase tracking-wider text-light-1 sm:text-sm">
                City name
              </h2>
              <div className="flex min-w-0 flex-wrap items-center gap-3 sm:gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-light-2/20 bg-gradient-to-br from-light-2/10 to-light-2/5 shadow-lg sm:h-16 sm:w-16">
                  <img
                    src={`https://flagcdn.com/48x36/${emoji.toLowerCase()}.png`}
                    alt={`Flag of ${emoji.toUpperCase()}`}
                    className="h-6 w-8 rounded object-cover shadow-sm sm:h-8 sm:w-10"
                    onError={(event) => {
                      const flag = event.currentTarget;
                      flag.style.display = "none";
                      const fallback = flag.nextElementSibling;
                      if (fallback instanceof HTMLElement) fallback.style.display = "inline";
                    }}
                  />
                  <span className="hidden text-2xl sm:text-3xl">{emoji}</span>
                </div>
                <h1 className="min-w-0 break-words text-2xl font-bold leading-tight text-light-2 sm:text-3xl md:text-4xl lg:text-5xl">
                  {cityName}
                </h1>
              </div>
            </div>
            <div className="flex flex-col gap-2 sm:gap-3">
              <h2 className="text-xs font-extrabold uppercase tracking-wider text-light-1 sm:text-sm">
                You went to {cityName} on
              </h2>
              <p className="text-base font-medium text-light-2 sm:text-lg md:text-xl">
                {formatDate(date)}
              </p>
            </div>
          </div>
        </header>

        <div className="space-y-6 p-4 sm:space-y-10 sm:p-8 md:p-10">
          {notes && (
            <section className="rounded-xl border border-dark-2/30 bg-dark-2/50 p-4 sm:p-6">
              <h2 className="mb-3 text-xs font-extrabold uppercase tracking-wider text-light-1 sm:mb-4 sm:text-sm">
                Your notes
              </h2>
              <div className="rounded-lg border-l-4 border-brand-2 bg-dark-1/30 p-3 sm:p-4">
                <p className="break-words whitespace-pre-wrap text-sm leading-relaxed text-light-2 sm:text-base md:text-lg">
                  {notes}
                </p>
              </div>
            </section>
          )}

          <section className="space-y-4" aria-labelledby="memories-heading">
            <h2 id="memories-heading" className="text-xs font-extrabold uppercase tracking-wider text-light-1 sm:text-sm">
              Memories
            </h2>
            {cityMemories.length > 0 ? (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
                {cityMemories.map((memory, index) => (
                  <div key={memory.id} className="relative overflow-hidden rounded-xl border border-dark-2/30 bg-dark-2/40 shadow-lg">
                    <button
                      type="button"
                      onClick={() => setSelectedMemory(memory)}
                      aria-label={`View Memory ${index + 1}`}
                      className="block aspect-square w-full focus:outline-none focus:ring-2 focus:ring-brand-2"
                    >
                      <img
                        src={memory.dataUri}
                        alt={`Memory ${index + 1} from ${cityName}`}
                        className="h-full w-full object-cover"
                      />
                    </button>
                    <button
                      type="button"
                      onClick={() => removeMemory(memory)}
                      aria-label={`Delete Memory ${index + 1}`}
                      className="absolute right-2 top-2 min-h-9 rounded-lg bg-red-700 px-3 text-xs font-bold uppercase text-white shadow-lg transition-colors hover:bg-red-800 focus:outline-none focus:ring-2 focus:ring-red-500"
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="rounded-xl border-2 border-dashed border-dark-2/50 bg-dark-2/20 p-5 text-center text-sm text-light-1/70 sm:p-8 sm:text-base">
                No Memories yet. Add a photo to remember this City.
              </p>
            )}

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isAddingMemory || cannotAddMemory}
                className="min-h-11 rounded-xl bg-gradient-to-r from-brand-2 to-brand-1 px-6 py-3 text-sm font-bold uppercase text-dark-0 transition-all hover:from-brand-1 hover:to-brand-2 focus:outline-none focus:ring-2 focus:ring-brand-2 disabled:cursor-not-allowed disabled:opacity-50 sm:text-base"
              >
                {isAddingMemory ? "Adding Memory..." : "Add a Memory"}
              </button>
              {cannotAddMemory && (
                <p className="text-sm text-light-1" role="status">
                  A City can hold up to five Memories.
                </p>
              )}
              {isAddingMemory && (
                <p className="text-sm text-light-1" role="status">
                  Preparing your Memory…
                </p>
              )}
            </div>
            {memoryError && (
              <p role="alert" className="rounded-lg border border-red-500/60 bg-red-950/40 p-3 text-sm text-red-100">
                {memoryError}
              </p>
            )}
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              onChange={uploadMemory}
              disabled={isAddingMemory || cannotAddMemory}
              aria-label="Add a Memory"
              className="hidden"
            />
          </section>

          <section className="rounded-xl border border-dark-2/30 bg-dark-2/30 p-4 sm:p-6">
            <h2 className="mb-3 text-xs font-extrabold uppercase tracking-wider text-light-1 sm:mb-4 sm:text-sm">
              Learn more
            </h2>
            <a
              href={`https://en.wikipedia.org/wiki/${cityName}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex break-words text-base font-semibold text-brand-1 hover:text-brand-2 hover:underline focus:text-brand-2 focus:underline sm:text-lg"
            >
              Check out {cityName} on Wikipedia &rarr;
            </a>
          </section>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => navigate(mapCityTarget(currentCity))}
              className="min-h-11 rounded-xl bg-brand-2 px-6 py-3 font-semibold text-dark-1 transition-colors hover:bg-brand-1 focus:outline-none focus:ring-2 focus:ring-brand-2"
            >
              Show on map
            </button>
            <button
              onClick={() => navigate(-1)}
              className="min-h-11 rounded-xl border border-brand-1/60 bg-dark-1 px-6 py-3 font-semibold text-light-2 transition-colors hover:border-brand-2 hover:bg-brand-2 hover:text-dark-1 focus:outline-none focus:ring-2 focus:ring-brand-2"
            >
              &larr; Back
            </button>
          </div>
        </div>
      </div>

      {selectedMemory && (
        <div role="dialog" aria-modal="true" aria-label="Enlarged Memory" className="fixed inset-0 z-[1000] flex items-center justify-center bg-dark-0/90 p-4">
          <div className="relative max-h-full max-w-4xl">
            <img
              src={selectedMemory.dataUri}
              alt={`Enlarged Memory from ${cityName}`}
              className="max-h-[85vh] max-w-full rounded-xl object-contain shadow-2xl"
            />
            <button
              type="button"
              onClick={() => setSelectedMemory(null)}
              aria-label="Close enlarged Memory"
              className="absolute right-2 top-2 min-h-11 rounded-xl bg-dark-0/90 px-4 font-bold text-light-2 shadow-lg focus:outline-none focus:ring-2 focus:ring-brand-2"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </article>
  );
}

export default City;
