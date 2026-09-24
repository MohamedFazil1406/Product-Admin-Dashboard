"use client";

import { useEffect, useState } from "react";

interface SearchInputProps {
  value: string;
  onSearch: (value: string) => void;
}

export default function SearchInput({ value, onSearch }: SearchInputProps) {
  const [input, setInput] = useState(value);

  /*
   * Keep local input synchronized
   * with URL search value.
   */
  useEffect(() => {
    setInput(value);
  }, [value]);

  /*
   * Debounce search.
   */
  useEffect(() => {
    if (input === value) {
      return;
    }

    const timer = setTimeout(() => {
      onSearch(input);
    }, 500);

    return () => {
      clearTimeout(timer);
    };
  }, [input, value, onSearch]);

  return (
    <input
      type="search"
      value={input}
      onChange={(event) => setInput(event.target.value)}
      placeholder="Search products..."
      className="w-full rounded border border-gray-300 bg-white px-3 py-2 text-black placeholder:text-gray-500 md:w-72"
    />
  );
}
