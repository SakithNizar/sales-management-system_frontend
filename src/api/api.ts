const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080/api";

// Mock data for testing
const mockRoutes = [
  { _id: "route_1", routeName: "MAIN STREET ROUTE", city: "Colombo" },
  { _id: "route_2", routeName: "KANDY ROAD", city: "Kandy" },
  { _id: "route_3", routeName: "GALLE ROUTE", city: "Galle" },
  { _id: "route_4", routeName: "NEGOMBO CIRCUIT", city: "Negombo" },
];

const mockUsers = [
  { _id: "user_1", fullName: "Nuwan Silva", username: "nuwan_silva", email: "nuwan@erp.com", phoneNumber: "0771234567", role: "salesman", status: "active" },
  { _id: "user_2", fullName: "Kamal Perera", username: "kamal_p", email: "kamal@erp.com", phoneNumber: "0772345678", role: "salesman", status: "active" },
  { _id: "user_3", fullName: "Admin User", username: "admin", email: "admin@erp.com", phoneNumber: "0773456789", role: "admin", status: "active" },
];

// Store for assigned routes (simulating database)
let assignedRoutes: Record<string, string[]> = {
  user_1: ["route_1", "route_2"],
  user_2: ["route_3"],
};

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

  // Handle mock routes endpoint
  if (endpoint === "/routes" && options.method !== "POST") {
    console.log("Mock: Returning routes");
    return Promise.resolve(mockRoutes);
  }

  // Handle mock users endpoint
  if (endpoint === "/users" && options.method !== "POST") {
    console.log("Mock: Returning users");
    return Promise.resolve(mockUsers);
  }

  // Handle GET assigned routes for a user
  if (endpoint.match(/^\/users\/([^/]+)\/routes$/) && options.method !== "POST") {
    const userId = endpoint.split("/")[2];
    const routes = assignedRoutes[userId] || [];
    console.log(`Mock: Returning assigned routes for ${userId}:`, routes);
    return Promise.resolve({ routes });
  }

  if (endpoint.match(/^\/users\/([^/]+)\/assign-routes$/) && options.method === "POST") {
    const userId = endpoint.split("/")[2];
    try {
      const body = JSON.parse(options.body as string);
      const routeIds = body.routeIds ?? body.routes ?? [];
      assignedRoutes[userId] = routeIds;
      console.log(`Mock: Assigned routes to ${userId}:`, routeIds);
      return Promise.resolve({ success: true, assignedRoutes: routeIds });
    } catch (error) {
      console.error("Error parsing request body:", error);
      throw error;
    }
  }

  if (endpoint.match(/^\/users\/([^/]+)\/routes$/) && options.method === "POST") {
    const userId = endpoint.split("/")[2];
    try {
      const body = JSON.parse(options.body as string);
      const routeIds = body.routeIds ?? body.routes ?? [];
      assignedRoutes[userId] = routeIds;
      console.log(`Mock: Assigned routes (legacy path) to ${userId}:`, routeIds);
      return Promise.resolve({ success: true, assignedRoutes: routeIds });
    } catch (error) {
      console.error("Error parsing request body:", error);
      throw error;
    }
  }

  // Handle mock create user
  if (endpoint === "/users" && options.method === "POST") {
    try {
      const body = JSON.parse(options.body as string);
      const newUser = {
        _id: `user_${Date.now()}`,
        ...body,
        createdAt: new Date().toISOString(),
      };
      mockUsers.push(newUser);
      console.log("Mock: Created user:", newUser);
      return Promise.resolve(newUser);
    } catch (error) {
      console.error("Error creating user:", error);
      throw error;
    }
  }

  // Handle mock delete user
  if (endpoint.match(/^\/users\/[^/]+$/) && options.method === "DELETE") {
    const userId = endpoint.split("/")[2];
    const index = mockUsers.findIndex((u) => u._id === userId);
    if (index > -1) {
      mockUsers.splice(index, 1);
      console.log("Mock: Deleted user:", userId);
      return Promise.resolve({ success: true });
    }
  }

  // Handle mock user search by username
  if (endpoint.match(/^\/users\/[^/]+$/) && !options.method) {
    const username = endpoint.split("/")[2];
    const user = mockUsers.find((u) => u.username === username);
    if (user) {
      console.log("Mock: Found user by username:", username);
      return Promise.resolve(user);
    }
    return Promise.reject(new Error("User not found"));
  }

  // Try actual API call for real backend
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