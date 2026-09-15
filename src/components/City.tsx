import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { useCities } from "../context/CitiesContext";
import Spinner from "./Spinner";

const formatDate = (date: string | null) =>
  new window.Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "long",
    year: "numeric",
    weekday: "long",
  }).format(new Date(date ?? Date.now()));

interface ResizeOptions {
  maxWidth: number;
  maxHeight: number;
  quality: number;
  fileType: string;
}

function resizeImage(file: File, options: ResizeOptions): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Could not read that image."));
    reader.onload = (event) => {
      const source = event.target?.result;
      if (typeof source !== "string") {
        reject(new Error("Could not read that image."));
        return;
      }

      const image = new Image();
      image.onerror = () => reject(new Error("That file is not an image."));
      image.onload = () => {
        let width = image.width;
        let height = image.height;

        if (width > options.maxWidth) {
          height *= options.maxWidth / width;
          width = options.maxWidth;
        }
        if (height > options.maxHeight) {
          width *= options.maxHeight / height;
          height = options.maxHeight;
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const context = canvas.getContext("2d");
        if (!context) {
          reject(new Error("Canvas is unavailable in this browser."));
          return;
        }

        context.drawImage(image, 0, 0, width, height);
        canvas.toBlob(
          (blob) =>
            blob ? resolve(blob) : reject(new Error("Could not encode image.")),
          options.fileType,
          options.quality
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
      else reject(new Error("Could not encode image."));
    };
    reader.onerror = () => reject(new Error("Could not encode image."));
    reader.readAsDataURL(blob);
  });
}

function City() {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentCity, getCity, isLoading, updateCity } = useCities();

  useEffect(() => {
    if (id) getCity(id);
  }, [id, getCity]);

  async function uploadMemory(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file || !id) return;

    if (file.size > 5 * 1024 * 1024) {
      alert("Image must be smaller than 5MB");
      return;
    }

    setIsUploading(true);
    try {
      const optimizedImage = await resizeImage(file, {
        maxWidth: 400,
        maxHeight: 400,
        quality: 0.7,
        fileType: "image/jpeg",
      });
      await updateCity(id, { image: await convertToBase64(optimizedImage) });
    } catch (error) {
      console.error("Error processing image:", error);
      alert("Error processing image");
    } finally {
      setIsUploading(false);
    }
  }

  async function deleteMemory() {
    if (!id || !window.confirm("Are you sure you want to delete this image?")) {
      return;
    }

    try {
      await updateCity(id, { image: null });
    } catch (error) {
      console.error("Error deleting image:", error);
      alert("Error deleting image");
    }
  }

  if (isLoading || !currentCity) return <Spinner />;

  const { cityName, emoji, date, notes, image } = currentCity;

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

          <section className="space-y-4">
            <h2 className="text-xs font-extrabold uppercase tracking-wider text-light-1 sm:text-sm">
              Memories
            </h2>
            {image ? (
              <div className="space-y-4 sm:space-y-6">
                <div className="relative overflow-hidden rounded-xl border border-dark-2/30 shadow-2xl">
                  <img
                    src={image}
                    alt={`Memory from ${cityName}`}
                    className="h-auto max-h-96 w-full object-cover"
                  />
                </div>
                <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="min-h-11 flex-1 rounded-xl bg-gradient-to-r from-brand-2 to-brand-2/90 px-6 py-3 text-sm font-bold uppercase text-dark-0 transition-all hover:from-brand-2/90 hover:to-brand-2 focus:outline-none focus:ring-2 focus:ring-brand-2 sm:text-base"
                  >
                    Change Image
                  </button>
                  <button
                    onClick={deleteMemory}
                    className="min-h-11 flex-1 rounded-xl bg-gradient-to-r from-red-600 to-red-700 px-6 py-3 text-sm font-bold uppercase text-white transition-all hover:from-red-700 hover:to-red-800 focus:outline-none focus:ring-2 focus:ring-red-500 sm:text-base"
                  >
                    Delete Image
                  </button>
                </div>
              </div>
            ) : (
              <div className="rounded-xl border-2 border-dashed border-dark-2/50 bg-gradient-to-br from-dark-2/20 to-dark-1/20 p-5 text-center sm:p-12">
                <div className="space-y-4">
                  <p className="text-sm text-light-1/70 sm:text-base">
                    No memory uploaded yet. Add a photo to remember this moment!
                  </p>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="min-h-11 w-full rounded-xl bg-gradient-to-r from-brand-2 to-brand-1 px-6 py-3 text-sm font-bold uppercase text-dark-0 transition-all hover:from-brand-1 hover:to-brand-2 focus:outline-none focus:ring-2 focus:ring-brand-2 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto sm:text-base"
                  >
                    {isUploading ? "Uploading..." : "Upload a Memory"}
                  </button>
                </div>
              </div>
            )}
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              onChange={uploadMemory}
              disabled={isUploading}
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

          <button
            onClick={() => navigate(-1)}
            className="min-h-11 rounded-xl border border-brand-1/60 bg-dark-1 px-6 py-3 font-semibold text-light-2 transition-colors hover:border-brand-2 hover:bg-brand-2 hover:text-dark-1 focus:outline-none focus:ring-2 focus:ring-brand-2"
          >
            &larr; Back
          </button>
        </div>
      </div>
    </article>
  );
}

export default City;
