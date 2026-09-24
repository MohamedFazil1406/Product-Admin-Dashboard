"use client";

import { useRouter } from "next/navigation";

export default function Navbar() {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem("accessToken");

    router.replace("/login");
  };

  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <button
          type="button"
          onClick={() => router.push("/products")}
          className="text-xl font-bold text-black"
        >
          Product Admin
        </button>

        <button
          type="button"
          onClick={handleLogout}
          className="rounded bg-black px-4 py-2 text-white"
        >
          Logout
        </button>
      </div>
    </header>
  );
}
