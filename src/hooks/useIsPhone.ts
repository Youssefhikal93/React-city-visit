import { useEffect, useState } from "react";

export const PHONE_MEDIA_QUERY = "(max-width: 767px)";

/** jsdom ships without matchMedia, and it is absent when there is no window. */
function phoneMediaQuery(): MediaQueryList | null {
  if (typeof window === "undefined" || !window.matchMedia) return null;
  return window.matchMedia(PHONE_MEDIA_QUERY);
}

export function useIsPhone(): boolean {
  const [isPhone, setIsPhone] = useState(
    () => phoneMediaQuery()?.matches ?? false
  );

  useEffect(() => {
    const mediaQuery = phoneMediaQuery();
    if (!mediaQuery) return;
    const updatePhoneMode = () => setIsPhone(mediaQuery.matches);

    updatePhoneMode();
    mediaQuery.addEventListener("change", updatePhoneMode);
    return () => mediaQuery.removeEventListener("change", updatePhoneMode);
  }, []);

  return isPhone;
}
