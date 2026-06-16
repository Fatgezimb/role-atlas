import { RefreshCw, Search, SlidersHorizontal, Layers3 } from "lucide-react";

interface TopBarProps {
  query: string;
  isScraping: boolean;
  onQueryChange: (query: string) => void;
  onSearch: () => void;
  onScrape: () => void;
}

export function TopBar({ query, isScraping, onQueryChange, onSearch, onScrape }: TopBarProps) {
  return (
    <header className="topbar">
      <form
        className="search-command"
        onSubmit={(event) => {
          event.preventDefault();
          onSearch();
        }}
      >
        <Search size={22} />
        <input
          aria-label="Natural language job search"
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
        />
        <button className="icon-button" type="button" aria-label="Tune search">
          <SlidersHorizontal size={20} />
        </button>
      </form>
      <button className="source-button" type="button" onClick={onScrape}>
        <Layers3 size={18} />
        <span>Sources</span>
        <strong>26 jobs</strong>
      </button>
      <button className="scrape-status" type="button" onClick={onScrape}>
        <span>
          Scrape status
          <small>{isScraping ? "Running now" : "Updated 2m ago"}</small>
        </span>
        <em>{isScraping ? "Syncing" : "Live"}</em>
        <RefreshCw size={18} className={isScraping ? "spinning" : ""} />
      </button>
    </header>
  );
}
