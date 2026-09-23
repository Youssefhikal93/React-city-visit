import { useHomeCountry } from "../context/HomeCountryContext";
import CountryPreferenceSelector from "./CountryPreferenceSelector";

export default function HomeCountrySelector() {
  const {
    countryCode,
    isLoading,
    loadError,
    saveHomeCountry,
    clearHomeCountry,
    retryHomeCountryLoad,
  } = useHomeCountry();

  return (
    <CountryPreferenceSelector
      clearCountry={clearHomeCountry}
      countryCode={countryCode}
      isLoading={isLoading}
      label="Home Country"
      loadError={loadError}
      retryLoad={retryHomeCountryLoad}
      saveCountry={saveHomeCountry}
    />
  );
}
