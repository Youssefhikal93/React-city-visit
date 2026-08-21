import { useSearchParams } from "react-router-dom";

/**
 * The lat/lng the map click put in the query string. Both come back as strings
 * (or null), so callers that store them must convert to numbers first.
 */
export function useURLPosition(): [string | null, string | null] {
  const [searchParams] = useSearchParams();

  return [searchParams.get("lat"), searchParams.get("lng")];
}
