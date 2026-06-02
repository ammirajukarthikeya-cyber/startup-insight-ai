const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

function getHeaders() {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  }
  return headers;
}

export const api = {
  async get<T = any>(endpoint: string): Promise<T> {
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: "GET",
      headers: getHeaders(),
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({ detail: "Request failed" }));
      throw new Error(err.detail || "Request failed");
    }
    return response.json();
  },

  async post<T = any>(endpoint: string, body?: any): Promise<T> {
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: "POST",
      headers: getHeaders(),
      body: body ? JSON.stringify(body) : undefined,
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({ detail: "Request failed" }));
      throw new Error(err.detail || "Request failed");
    }
    return response.json();
  },

  async put<T = any>(endpoint: string, body?: any): Promise<T> {
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: "PUT",
      headers: getHeaders(),
      body: body ? JSON.stringify(body) : undefined,
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({ detail: "Request failed" }));
      throw new Error(err.detail || "Request failed");
    }
    return response.json();
  },

  async delete<T = any>(endpoint: string): Promise<T> {
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: "DELETE",
      headers: getHeaders(),
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({ detail: "Request failed" }));
      throw new Error(err.detail || "Request failed");
    }
    return response.json();
  },
};
