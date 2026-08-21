import { useState } from "react";

import type { Position } from "../types";

interface GeolocationHook {
  getPosition: () => void;
  error: string | null;
  isLoading: boolean;
  position: Position | null;
}

export function useGeolocation(
  defaultPosition: Position | null = null
): GeolocationHook {
  const [isLoading, setIsLoading] = useState(false);
  const [position, setPosition] = useState<Position | null>(defaultPosition);
  const [error, setError] = useState<string | null>(null);

  function getPosition(): void {
    if (!navigator.geolocation) {
      setError("Your browser does not support geolocation");
      return;
    }

    setIsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setPosition({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
        setIsLoading(false);
      },
      (err) => {
        setError(err.message);
        setIsLoading(false);
      }
    );
  }

  return { getPosition, error, isLoading, position };
}
