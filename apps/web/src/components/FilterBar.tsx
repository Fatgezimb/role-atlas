import {
  BadgeDollarSign,
  Briefcase,
  ChevronDown,
  Filter,
  Gift,
  MapPin,
  Plane,
  UserRoundCog
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { STATE_POINTS } from "../data/stateGeo";
import type { EmploymentType, SearchFilters } from "../types";

type MenuId = "location" | "role" | "employment" | "pay" | "payType" | "benefits" | "bonus" | "relocation" | "more" | null;

interface FilterBarProps {
  filters: SearchFilters;
  onApply: (filters: SearchFilters, nextQuery?: string) => void;
}

const ROLE_OPTIONS = [
  {
    label: "BCBA",
    value: "BCBA",
    query: "Find remote BCBA contract roles over $70/hr with sign-on bonus",
    minHourly: 70
  },
  {
    label: "PMHNP",
    value: "PMHNP",
    query: "Find remote PMHNP contract roles over $90/hr with sign-on bonus",
    minHourly: 90
  },
  {
    label: "Psych NP",
    value: "Psychiatric Nurse Practitioner",
    query: "Find psychiatric nurse practitioner W-2 roles with relocation assistance",
    minHourly: undefined
  }
];

const LOCATION_OPTIONS = [
  { label: "All states", location: "All states", state: undefined },
  { label: "Remote only", location: "Remote only", state: undefined, remote_type: "remote_open_us" },
  ...STATE_POINTS.map((state) => ({ label: state.name, location: state.name, state: state.code, remote_type: undefined }))
] satisfies Array<{ label: string; location: string; state?: string; remote_type?: SearchFilters["remote_type"] }>;

const PAY_OPTIONS = [
  { label: "Any", value: undefined },
  { label: "$70+/hr", value: 70 },
  { label: "$90+/hr", value: 90 },
  { label: "$100+/hr", value: 100 }
] as const;

const BENEFIT_OPTIONS = [
  { label: "Any", value: [] },
  { label: "Health", value: ["Health"] },
  { label: "Health + Dental", value: ["Health", "Dental"] },
  { label: "PTO + 401k", value: ["PTO", "401k"] }
] as const;

export function FilterBar({ filters, onApply }: FilterBarProps) {
  const [openMenu, setOpenMenu] = useState<MenuId>(null);
  const rootRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpenMenu(null);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpenMenu(null);
      }
    }
    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const apply = (nextFilters: SearchFilters, nextQuery?: string) => {
    onApply(nextFilters, nextQuery);
    setOpenMenu(null);
  };

  return (
    <section ref={rootRef} className="filter-bar" aria-label="Job filters">
      <FilterDropdown
        id="location"
        icon={<MapPin size={18} />}
        label="Location"
        openMenu={openMenu}
        value={filters.location ?? "All states"}
        onToggle={setOpenMenu}
      >
        {LOCATION_OPTIONS.map((option) => (
          <MenuOption
            key={option.label}
            active={filters.location === option.location}
            label={option.label}
            onClick={() =>
              apply({
                ...filters,
                location: option.location,
                state: option.state,
                remote_type: option.remote_type
              })
            }
          />
        ))}
      </FilterDropdown>

      <FilterDropdown
        id="role"
        icon={<UserRoundCog size={18} />}
        label="Role"
        openMenu={openMenu}
        value={filters.role ?? "Any"}
        onToggle={setOpenMenu}
      >
        {ROLE_OPTIONS.map((option) => (
          <MenuOption
            key={option.value}
            active={filters.role === option.value}
            label={option.label}
            onClick={() =>
              apply(
                {
                  ...filters,
                  role: option.value,
                  min_hourly: option.minHourly
                },
                option.query
              )
            }
          />
        ))}
      </FilterDropdown>

      <FilterDropdown
        id="employment"
        icon={<Briefcase size={18} />}
        label="Employment Type"
        openMenu={openMenu}
        value={employmentLabel(filters.employment_type)}
        onToggle={setOpenMenu}
      >
        <MenuOption label="Any" active={!filters.employment_type} onClick={() => apply({ ...filters, employment_type: undefined })} />
        <MenuOption label="Contract" active={filters.employment_type === "contract"} onClick={() => apply({ ...filters, employment_type: "contract" })} />
        <MenuOption label="W-2" active={filters.employment_type === "w2"} onClick={() => apply({ ...filters, employment_type: "w2" })} />
      </FilterDropdown>

      <FilterDropdown
        id="pay"
        icon={<BadgeDollarSign size={18} />}
        label="Pay"
        openMenu={openMenu}
        value={filters.min_hourly ? `$${filters.min_hourly}+/hr` : "Any"}
        onToggle={setOpenMenu}
      >
        {PAY_OPTIONS.map((option) => (
          <MenuOption
            key={option.label}
            active={filters.min_hourly === option.value}
            label={option.label}
            onClick={() => apply({ ...filters, min_hourly: option.value })}
          />
        ))}
      </FilterDropdown>

      <FilterDropdown
        id="payType"
        label="W-2 vs Contract"
        openMenu={openMenu}
        value={employmentLabel(filters.employment_type)}
        onToggle={setOpenMenu}
      >
        <MenuOption label="Any" active={!filters.employment_type} onClick={() => apply({ ...filters, employment_type: undefined })} />
        <MenuOption label="Contract" active={filters.employment_type === "contract"} onClick={() => apply({ ...filters, employment_type: "contract" })} />
        <MenuOption label="W-2" active={filters.employment_type === "w2"} onClick={() => apply({ ...filters, employment_type: "w2" })} />
      </FilterDropdown>

      <FilterDropdown
        id="benefits"
        label="Benefits"
        openMenu={openMenu}
        value={filters.benefits?.length ? filters.benefits.join(", ") : "Any"}
        onToggle={setOpenMenu}
      >
        {BENEFIT_OPTIONS.map((option) => (
          <MenuOption
            key={option.label}
            active={(filters.benefits ?? []).join("|") === option.value.join("|")}
            label={option.label}
            onClick={() => apply({ ...filters, benefits: [...option.value] })}
          />
        ))}
      </FilterDropdown>

      <FilterDropdown
        id="bonus"
        icon={<Gift size={18} />}
        label="Bonus"
        openMenu={openMenu}
        value={filters.sign_on_bonus ? "Sign-on bonus" : "Any"}
        onToggle={setOpenMenu}
      >
        <MenuOption label="Any" active={!filters.sign_on_bonus} onClick={() => apply({ ...filters, sign_on_bonus: undefined })} />
        <MenuOption label="Sign-on bonus" active={filters.sign_on_bonus === true} onClick={() => apply({ ...filters, sign_on_bonus: true })} />
      </FilterDropdown>

      <FilterDropdown
        id="relocation"
        icon={<Plane size={18} />}
        label="Relocation"
        openMenu={openMenu}
        value={filters.relocation ? "Included" : "Any"}
        onToggle={setOpenMenu}
      >
        <MenuOption label="Any" active={!filters.relocation} onClick={() => apply({ ...filters, relocation: undefined })} />
        <MenuOption label="Included" active={filters.relocation === true} onClick={() => apply({ ...filters, relocation: true })} />
      </FilterDropdown>

      <div className="filter-dropdown">
        <button
          aria-expanded={openMenu === "more"}
          aria-haspopup="menu"
          className="more-filters"
          data-testid="filter-more"
          type="button"
          onClick={() => setOpenMenu(openMenu === "more" ? null : "more")}
        >
          <Filter size={18} />
          <span>More filters</span>
        </button>
        {openMenu === "more" ? (
          <div className="filter-menu more-filter-menu" role="menu">
            <MenuOption
              label="Show all BCBA roles"
              onClick={() =>
                apply(
                  { ...filters, role: "BCBA", employment_type: undefined, min_hourly: undefined, sign_on_bonus: undefined, relocation: undefined },
                  "Show all BCBA roles"
                )
              }
            />
            <MenuOption label="Include W-2 and contract" onClick={() => apply({ ...filters, employment_type: undefined })} />
            <MenuOption label="Include roles without sign-on bonus" onClick={() => apply({ ...filters, sign_on_bonus: undefined })} />
            <MenuOption label="Clear pay floor" onClick={() => apply({ ...filters, min_hourly: undefined, min_salary: undefined })} />
            <MenuOption
              label="Reset to BCBA contract search"
              onClick={() =>
                apply(
                  { location: "All states", role: "BCBA", employment_type: "contract", min_hourly: 70, sign_on_bonus: true },
                  "Find remote BCBA contract roles over $70/hr with sign-on bonus"
                )
              }
            />
          </div>
        ) : null}
      </div>
    </section>
  );
}

function FilterDropdown({
  id,
  icon,
  label,
  value,
  openMenu,
  onToggle,
  children
}: {
  id: Exclude<MenuId, null>;
  icon?: ReactNode;
  label: string;
  value: string;
  openMenu: MenuId;
  onToggle: (id: MenuId) => void;
  children: ReactNode;
}) {
  const isOpen = openMenu === id;
  return (
    <div className="filter-dropdown">
      <button
        aria-expanded={isOpen}
        aria-haspopup="menu"
        className="filter-select"
        data-testid={`filter-${id}`}
        type="button"
        onClick={() => onToggle(isOpen ? null : id)}
      >
        {icon}
        <span>
          {label}
          <strong>{value}</strong>
        </span>
        <ChevronDown size={15} />
      </button>
      {isOpen ? (
        <div className="filter-menu" role="menu">
          {children}
        </div>
      ) : null}
    </div>
  );
}

function MenuOption({ label, active, onClick }: { label: string; active?: boolean; onClick: () => void }) {
  return (
    <button className={active ? "active" : ""} role="menuitem" type="button" onClick={onClick}>
      {label}
    </button>
  );
}

function employmentLabel(value?: EmploymentType): string {
  if (value === "contract") {
    return "Contract";
  }
  if (value === "w2") {
    return "W-2";
  }
  return "Any";
}
