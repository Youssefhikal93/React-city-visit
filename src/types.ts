/** Latitude/longitude pair, always stored as numbers. */
export interface Position {
  lat: number;
  lng: number;
}

/** One photo attached to a City, identified by its Realtime Database key. */
export interface Memory {
  id: string;
  dataUri: string;
}

/** How precisely an Account remembers when it visited a City. */
export type VisitDatePrecision = "day" | "month";

/** A city as the rest of the app consumes it, id included. */
export interface City {
  id: string;
  cityName: string;
  country: string;
  emoji: string;
  /** ISO 8601 string, or null for rows written before dates were required. */
  date: string | null;
  datePrecision: VisitDatePrecision;
  notes: string;
  visitCount?: number;
  memories: Memory[];
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
  datePrecision: VisitDatePrecision;
  notes: string;
  position: { lat: number | string; lng: number | string };
}

/** Partial edit to an existing City. */
export type CityUpdate = Partial<
  Pick<
    City,
    | "cityName"
    | "country"
    | "emoji"
    | "date"
    | "datePrecision"
    | "notes"
    | "visitCount"
  >
>;

/** The city shape as it actually sits in the Realtime Database. */
export interface StoredCity {
  cityName?: string;
  country?: string;
  emoji?: string;
  date?: string;
  datePrecision?: VisitDatePrecision;
  notes?: string;
  visitCount?: number;
  image?: string | null;
  memories?: Record<string, string>;
  createdAt?: number;
  position?: { lat?: number | string; lng?: number | string };
}

/** A country rolled up from the city list, for the countries view. */
export interface Country {
  country: string;
  emoji: string;
}

/** The signed-in session: an anonymous Firebase uid plus the account it opened. */
export interface AuthUser {
  uid: string;
  /** Lowercased database key. */
  username: string;
  /** Username as typed at sign-up, for display. */
  displayName: string;
}

export interface AuthResult {
  success: boolean;
  error?: string | null;
}
