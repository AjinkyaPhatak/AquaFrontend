const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

interface ApiResponse<T> {
  data?: T;
  error?: string;
}

class ApiService {
  private getToken(): string | null {
    if (typeof window !== "undefined") {
      return localStorage.getItem("token");
    }
    return null;
  }

  private getHeaders(includeAuth = true): HeadersInit {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };

    if (includeAuth) {
      const token = this.getToken();
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
    }

    return headers;
  }

  private async handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
    if (!response.ok) {
      const error = await response
        .json()
        .catch(() => ({ message: "An error occurred" }));
      return { error: error.message || "An error occurred" };
    }
    const data = await response.json();
    return { data };
  }

  // Auth endpoints
  async login(email: string, password: string) {
    console.log("[API] POST /auth/login - Attempting login for:", email);
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: this.getHeaders(false),
        body: JSON.stringify({ email, password }),
      });
      const result = await this.handleResponse<{
        user: User;
        access_token: string;
      }>(response);
      console.log(
        "[API] POST /auth/login - Response:",
        result.data ? "Success" : result.error,
      );
      return result;
    } catch (error) {
      console.error("[API] POST /auth/login - Error:", error);
      return {
        error:
          "Unable to connect to server. Please check if backend is running.",
      };
    }
  }

  async register(name: string, email: string, password: string) {
    console.log(
      "[API] POST /auth/register - Attempting registration for:",
      email,
    );
    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: this.getHeaders(false),
        body: JSON.stringify({ name, email, password }),
      });
      const result = await this.handleResponse<{
        user: User;
        access_token: string;
      }>(response);
      console.log(
        "[API] POST /auth/register - Response:",
        result.data ? "Success" : result.error,
      );
      return result;
    } catch (error) {
      console.error("[API] POST /auth/register - Error:", error);
      return {
        error:
          "Unable to connect to server. Please check if backend is running.",
      };
    }
  }

  // These helpers expect a Firebase ID token from the client. The backend should
  // verify the token with Firebase and then create/lookup the corresponding user
  // in its own database, returning the usual {user, access_token} pair.
  async loginWithFirebase(idToken: string) {
    console.log("[API] POST /auth/firebase/login - Sending Firebase ID token");
    try {
      const response = await fetch(`${API_URL}/auth/firebase/login`, {
        method: "POST",
        headers: this.getHeaders(false),
        body: JSON.stringify({ idToken }),
      });
      const result = await this.handleResponse<{
        user: User;
        access_token: string;
      }>(response);
      console.log(
        "[API] POST /auth/firebase/login - Response:",
        result.data ? "Success" : result.error,
      );
      return result;
    } catch (error) {
      console.error("[API] POST /auth/firebase/login - Error:", error);
      return {
        error:
          "Unable to connect to server. Please check if backend is running.",
      };
    }
  }

  async registerWithFirebase(idToken: string) {
    console.log(
      "[API] POST /auth/firebase/register - Sending Firebase ID token",
    );
    try {
      const response = await fetch(`${API_URL}/auth/firebase/register`, {
        method: "POST",
        headers: this.getHeaders(false),
        body: JSON.stringify({ idToken }),
      });
      const result = await this.handleResponse<{
        user: User;
        access_token: string;
      }>(response);
      console.log(
        "[API] POST /auth/firebase/register - Response:",
        result.data ? "Success" : result.error,
      );
      return result;
    } catch (error) {
      console.error("[API] POST /auth/firebase/register - Error:", error);
      return {
        error:
          "Unable to connect to server. Please check if backend is running.",
      };
    }
  }

  async getMe() {
    try {
      const response = await fetch(`${API_URL}/auth/me`, {
        headers: this.getHeaders(),
      });
      return this.handleResponse<User>(response);
    } catch (error) {
      return { error: "Unable to connect to server" };
    }
  }

  // User endpoints
  async getProfile() {
    try {
      const response = await fetch(`${API_URL}/users/profile`, {
        headers: this.getHeaders(),
      });
      return this.handleResponse<User>(response);
    } catch (error) {
      return { error: "Unable to connect to server" };
    }
  }

  async updateProfile(data: { name?: string; avatar?: string }) {
    console.log("[API] PUT /users/profile - Updating profile:", data);
    try {
      const response = await fetch(`${API_URL}/users/profile`, {
        method: "PUT",
        headers: this.getHeaders(),
        body: JSON.stringify(data),
      });
      const result = await this.handleResponse<User>(response);
      console.log(
        "[API] PUT /users/profile - Response:",
        result.data ? "Success" : result.error,
      );
      return result;
    } catch (error) {
      console.error("[API] PUT /users/profile - Error:", error);
      return { error: "Unable to connect to server" };
    }
  }

  // Water Analysis endpoints
  async analyzeWater(file: File, location?: string, notes?: string) {
    console.log(
      "[API] POST /water-analysis/analyze - Analyzing water image:",
      file.name,
      "Location:",
      location,
    );
    try {
      const formData = new FormData();
      formData.append("image", file);
      if (location) formData.append("location", location);
      if (notes) formData.append("notes", notes);

      const token = this.getToken();
      const response = await fetch(`${API_URL}/water-analysis/analyze`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });
      const result = await this.handleResponse<WaterAnalysis>(response);
      console.log(
        "[API] POST /water-analysis/analyze - Response:",
        result.data
          ? `Success - Safety Score: ${result.data.overallSafetyScore}`
          : result.error,
      );
      return result;
    } catch (error) {
      console.error("[API] POST /water-analysis/analyze - Error:", error);
      return {
        error:
          "Unable to connect to server. Please check if backend is running.",
      };
    }
  }

  async getAnalysisHistory(page = 1, limit = 10) {
    try {
      const response = await fetch(
        `${API_URL}/water-analysis/history?page=${page}&limit=${limit}`,
        {
          headers: this.getHeaders(),
        },
      );
      return this.handleResponse<{
        analyses: WaterAnalysis[];
        total: number;
        pages: number;
        currentPage: number;
      }>(response);
    } catch (error) {
      return { error: "Unable to connect to server" };
    }
  }

  async getAnalysisStats() {
    try {
      const response = await fetch(`${API_URL}/water-analysis/stats`, {
        headers: this.getHeaders(),
      });
      return this.handleResponse<WaterAnalysisStats>(response);
    } catch (error) {
      return { error: "Unable to connect to server" };
    }
  }

  async getAnalysisById(id: string) {
    try {
      const response = await fetch(`${API_URL}/water-analysis/${id}`, {
        headers: this.getHeaders(),
      });
      return this.handleResponse<WaterAnalysis>(response);
    } catch (error) {
      return { error: "Unable to connect to server" };
    }
  }

  async deleteAnalysis(id: string) {
    console.log("[API] DELETE /water-analysis/:id - Deleting analysis:", id);
    try {
      const response = await fetch(`${API_URL}/water-analysis/${id}`, {
        method: "DELETE",
        headers: this.getHeaders(),
      });
      const result = await this.handleResponse<{ message: string }>(response);
      console.log(
        "[API] DELETE /water-analysis/:id - Response:",
        result.data ? "Success" : result.error,
      );
      return result;
    } catch (error) {
      console.error("[API] DELETE /water-analysis/:id - Error:", error);
      return { error: "Unable to connect to server" };
    }
  }
}

// Types
export interface User {
  _id: string;
  id?: string;
  name: string;
  email: string;
  avatar?: string;
  role: string;
  totalAnalyses: number;
  createdAt?: string;
}

export interface WaterParameter {
  value: number;
  status: "safe" | "warning" | "unsafe";
  description: string;
}

export interface WaterAnalysis {
  _id: string;
  userId: string;
  imagePath: string;
  overallSafetyScore: number;
  safetyStatus: "safe" | "warning" | "unsafe";
  parameters: {
    ph: WaterParameter;
    turbidity: WaterParameter;
    algaeLevel: WaterParameter;
    bacteriaCount: WaterParameter;
    temperature: WaterParameter;
    contaminationRisk: WaterParameter;
  };
  recommendations: string[];
  detailedAnalysis: string;
  waterType: string;
  potentialContaminants: string[];
  location?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface WaterAnalysisStats {
  totalAnalyses: number;
  safeCount: number;
  warningCount: number;
  unsafeCount: number;
  averageSafetyScore: number;
  recentAnalyses: WaterAnalysis[];
}

export const apiService = new ApiService();
