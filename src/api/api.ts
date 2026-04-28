const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080/api";

export async function apiRequest(endpoint: string, options: RequestInit = {}) {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  // Merge existing headers if any
  if (options.headers) {
    const existingHeaders = typeof options.headers === 'object' ? options.headers : {};
    Object.assign(headers, existingHeaders);
  }

  // Add auth token if available
  const token = localStorage.getItem('auth_token');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `API request failed with status ${response.status}`);
    }

    return response.json();
  } catch (error) {
    console.error(`API Error [${endpoint}]:`, error);
    throw error;
  }
}