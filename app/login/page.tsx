"use client";

import { FormEvent, useEffect, useState } from "react";

import { useRouter } from "next/navigation";

import { login } from "@/services/auth.service";

export default function LoginPage() {
  const router = useRouter();

  const [username, setUsername] = useState("");

  const [password, setPassword] = useState("");

  const [error, setError] = useState("");

  const [loading, setLoading] = useState(false);

  /*
   * If already logged in,
   * don't allow access to /login.
   */
  useEffect(() => {
    const token = localStorage.getItem("accessToken");

    if (token) {
      router.replace("/products");
    }
  }, [router]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    /*
     * Prevent duplicate login requests.
     */
    if (loading) {
      return;
    }

    setError("");

    if (!username.trim() || !password.trim()) {
      setError("Username and password are required.");

      return;
    }

    try {
      setLoading(true);

      const user = await login({
        username: username.trim(),
        password: password.trim(),
      });

      /*
       * Store authentication token.
       */
      localStorage.setItem("accessToken", user.accessToken);

      /*
       * Replace instead of push so
       * Back doesn't immediately return
       * to the login page.
       */
      router.replace("/products");
    } catch {
      setError("Invalid username or password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-md rounded-xl bg-white p-8 shadow">
        <h1 className="mb-6 text-2xl font-bold text-black">Product Admin</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Username */}

          <div>
            <label
              htmlFor="username"
              className="mb-1 block text-sm font-medium text-black"
            >
              Username
            </label>

            <input
              id="username"
              type="text"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              className="w-full rounded border border-gray-300 bg-white px-3 py-2 text-black"
              placeholder="emilys"
              autoComplete="username"
            />
          </div>

          {/* Password */}

          <div>
            <label
              htmlFor="password"
              className="mb-1 block text-sm font-medium text-black"
            >
              Password
            </label>

            <input
              id="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded border border-gray-300 bg-white px-3 py-2 text-black"
              placeholder="Password"
              autoComplete="current-password"
            />
          </div>

          {/* Error */}

          {error && <p className="text-sm text-red-600">{error}</p>}

          {/* Login button */}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded bg-black px-4 py-2 text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
    </main>
  );
}
