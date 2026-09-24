"use client";

import { useEffect, useState } from "react";

interface SearchInputProps {
  value: string;
  onSearch: (value: string) => void;
}

export default function SearchInput({ value, onSearch }: SearchInputProps) {
  const [input, setInput] = useState(value);

  useEffect(() => {
    setInput(value);
  }, [value]);

  useEffect(() => {
    const timer = setTimeout(() => {
      onSearch(input);
    }, 500);

    return () => {
      clearTimeout(timer);
    };
  }, [input, onSearch]);

  return (
    <input
      type="search"
      value={input}
      onChange={(event) => setInput(event.target.value)}
      placeholder="Search products..."
      className="w-full rounded border px-3 py-2 md:w-72"
    />
  );
}
