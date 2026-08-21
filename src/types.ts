/** Latitude/longitude pair, always stored as numbers. */
export interface Position {
  lat: number;
  lng: number;
}

/** A city as the rest of the app consumes it, id included. */
export interface City {
  id: string;
  cityName: string;
  country: string;
  emoji: string;
  /** ISO 8601 string, or null for rows written before dates were required. */
  date: string | null;
  notes: string;
  /** Base64 data URI of the memory snapshot, or null when none is set. */
  image: string | null;
  createdAt: number;
  position: Position;
}

/**
 * What the form hands to `createCity`: no id yet, and lat/lng may still be the
 * strings that came out of the URL query.
 */
export interface NewCity {
  cityName: string;
  country: string;
  emoji: string;
  date: Date | string | null;
  notes: string;
  position: { lat: number | string; lng: number | string };
}

/** Partial edit to an existing city; `image: null` clears the snapshot. */
export type CityUpdate = Partial<
  Pick<City, "cityName" | "country" | "emoji" | "date" | "notes" | "image">
>;

/** The city shape as it actually sits in the Realtime Database. */
export interface StoredCity {
  cityName?: string;
  country?: string;
  emoji?: string;
  date?: string;
  notes?: string;
  image?: string | null;
  createdAt?: number;
  position?: { lat?: number | string; lng?: number | string };
}

/** The signed-in session: an anonymous Firebase uid plus the PIN it opened. */
export interface AuthUser {
  uid: string;
  pin: string;
}

export interface AuthResult {
  success: boolean;
  error?: string | null;
}
