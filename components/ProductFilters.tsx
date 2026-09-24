interface ProductFiltersProps {
  categories: string[];
  category: string;
  sortBy: string;
  order: "asc" | "desc";
  onCategoryChange: (value: string) => void;
  onSortChange: (value: string) => void;
  onOrderChange: (value: "asc" | "desc") => void;
}

export default function ProductFilters({
  categories,
  category,
  sortBy,
  order,
  onCategoryChange,
  onSortChange,
  onOrderChange,
}: ProductFiltersProps) {
  return (
    <div className="flex flex-col gap-3 md:flex-row">
      <select
        value={category}
        onChange={(event) => onCategoryChange(event.target.value)}
        className="rounded border px-3 py-2"
      >
        <option value="">All categories</option>

        {categories.map((item) => (
          <option key={item} value={item}>
            {item}
          </option>
        ))}
      </select>

      <select
        value={sortBy}
        onChange={(event) => onSortChange(event.target.value)}
        className="rounded border px-3 py-2"
      >
        <option value="">No sorting</option>

        <option value="title">Title</option>

        <option value="price">Price</option>

        <option value="rating">Rating</option>
      </select>

      {sortBy && (
        <select
          value={order}
          onChange={(event) =>
            onOrderChange(event.target.value as "asc" | "desc")
          }
          className="rounded border px-3 py-2"
        >
          <option value="asc">Ascending</option>

          <option value="desc">Descending</option>
        </select>
      )}
    </div>
  );
}
