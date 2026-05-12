const BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

/**
 * REAL API REQUEST FUNCTION
 * -------------------------
 * - No mock data
 * - Every request hits Express + MongoDB
 */
export async function apiRequest(
  endpoint: string,
  options: RequestInit = {}
) {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  // Merge custom headers
  if (options.headers && typeof options.headers === "object") {
    Object.assign(headers, options.headers);
  }

  // Attach auth token if present
  const token = localStorage.getItem("auth_token");
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(
        data.message || `API request failed (${response.status})`
      );
    }

    return data;
  } catch (error) {
    console.error(`API Error [${endpoint}]`, error);
    throw error;
  }
}
