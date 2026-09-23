import { useHomeCountry } from "../context/HomeCountryContext";
import CountryPreferenceSelector from "./CountryPreferenceSelector";

export default function PlannedCountrySelector() {
  const {
    plannedCountryCode,
    isLoading,
    loadError,
    savePlannedCountry,
    clearPlannedCountry,
    retryHomeCountryLoad,
  } = useHomeCountry();

  return (
    <CountryPreferenceSelector
      clearCountry={clearPlannedCountry}
      countryCode={plannedCountryCode}
      isLoading={isLoading}
      label="Planned destination"
      loadError={loadError}
      retryLoad={retryHomeCountryLoad}
      saveCountry={savePlannedCountry}
    />
  );
}
