import { useEffect, useState } from "react";

export const PHONE_MEDIA_QUERY = "(max-width: 767px)";

export function useIsPhone(): boolean {
  const [isPhone, setIsPhone] = useState(
    () => window.matchMedia(PHONE_MEDIA_QUERY).matches
  );

  useEffect(() => {
    const mediaQuery = window.matchMedia(PHONE_MEDIA_QUERY);
    const updatePhoneMode = () => setIsPhone(mediaQuery.matches);

    updatePhoneMode();
    mediaQuery.addEventListener("change", updatePhoneMode);
    return () => mediaQuery.removeEventListener("change", updatePhoneMode);
  }, []);

  return isPhone;
}
