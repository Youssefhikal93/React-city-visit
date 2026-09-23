import { useState, type ReactNode } from "react";
import { FiChevronDown } from "react-icons/fi";

interface CountrySectionProps {
  id: string;
  title: string;
  icon: ReactNode;
  count: number;
  description: string;
  children: ReactNode;
}

/** A Countries screen section whose heading collapses and expands its body. */
export default function CountrySection({
  id,
  title,
  icon,
  count,
  description,
  children,
}: CountrySectionProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const headingId = `${id}-heading`;
  const bodyId = `${id}-body`;

  return (
    <section aria-labelledby={headingId} className="country-section">
      <h3 className="country-section-heading" id={headingId}>
        <button
          aria-controls={bodyId}
          aria-expanded={isExpanded}
          className="country-section-toggle"
          onClick={() => setIsExpanded((expanded) => !expanded)}
          type="button"
        >
          {icon} {title} <span>{count}</span>
          <FiChevronDown
            aria-hidden="true"
            className={`ml-auto transition-transform ${isExpanded ? "rotate-180" : ""}`}
          />
        </button>
      </h3>
      {isExpanded && (
        <div id={bodyId}>
          <p className="country-section-description">{description}</p>
          {children}
        </div>
      )}
    </section>
  );
}
