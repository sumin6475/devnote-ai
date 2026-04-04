import { Search } from "lucide-react";

interface SearchPanelProps {
  query: string;
  onQueryChange: (q: string) => void;
}

const SearchPanel = ({ query, onQueryChange }: SearchPanelProps) => {
  return (
    <div className="border-b border-border px-4 py-3">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder="태그, 키워드로 검색..."
          className="w-full rounded-lg border border-input bg-background py-2 pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          autoFocus
        />
      </div>
    </div>
  );
};

export default SearchPanel;
