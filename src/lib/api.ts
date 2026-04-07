const API_URL = process.env.NEXT_PUBLIC_API_URL || "/api";

interface ApiResponse<T> {
  data?: T;
  error?: string;
}

interface RequestOptions {
  method?: string;
  body?: BodyInit | null;
  includeAuth?: boolean;
  isFormData?: boolean;
}

class ApiService {
  private getToken(): string | null {
    if (typeof window !== "undefined") {
      return localStorage.getItem("token");
    }

    return null;
  }

  private getApiUrl(): string {
    if (!API_URL) {
      console.error("API URL NOT DEFINED");
      throw new Error("API URL NOT DEFINED");
    }

    return API_URL.replace(/\/+$/, "");
  }

  private buildUrl(path: string): string {
    return `${this.getApiUrl()}/${path.replace(/^\/+/, "")}`;
  }

  private getHeaders({
    includeAuth = true,
    isFormData = false,
  }: Pick<RequestOptions, "includeAuth" | "isFormData"> = {}): HeadersInit {
    const token = includeAuth ? this.getToken() : null;
    const headers: Record<string, string> = {};

    if (!isFormData) {
      headers["Content-Type"] = "application/json";
    }

    if (includeAuth) {
      headers["Authorization"] = token ? `Bearer ${token}` : "";
    }

    return headers;
  }

  private async handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
    const responseText = await response.text();
    const responseData = responseText
      ? (() => {
          try {
            return JSON.parse(responseText) as T | { message?: string; error?: string };
          } catch {
            return responseText;
          }
        })()
      : null;

    if (!response.ok) {
      const errorPayload =
        typeof responseData === "object" && responseData !== null
          ? (responseData as { message?: string; error?: string })
          : null;

      const errorMessage =
        errorPayload?.error || errorPayload?.message || "An error occurred";

      return { error: errorMessage };
    }

    return { data: responseData as T };
  }

  private async request<T>(
    path: string,
    {
      method = "GET",
      body = null,
      includeAuth = true,
      isFormData = false,
    }: RequestOptions = {},
  ): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(this.buildUrl(path), {
        method,
        headers: this.getHeaders({ includeAuth, isFormData }),
        body,
      });

      return await this.handleResponse<T>(response);
    } catch (error) {
      console.error("API ERROR:", error);
      return { error: "Unable to connect to server" };
    }
  }

  async login(email: string, password: string) {
    return this.request<{ user: User; access_token: string }>("auth/login", {
      method: "POST",
      includeAuth: false,
      body: JSON.stringify({ email, password }),
    });
  }

  async register(name: string, email: string, password: string) {
    return this.request<{ user: User; access_token: string }>("auth/register", {
      method: "POST",
      includeAuth: false,
      body: JSON.stringify({ name, email, password }),
    });
  }

  async loginWithFirebase(idToken: string) {
    return this.request<{ user: User; access_token: string }>(
      "auth/firebase/login",
      {
        method: "POST",
        includeAuth: false,
        body: JSON.stringify({ idToken }),
      },
    );
  }

  async registerWithFirebase(idToken: string) {
    return this.request<{ user: User; access_token: string }>(
      "auth/firebase/register",
      {
        method: "POST",
        includeAuth: false,
        body: JSON.stringify({ idToken }),
      },
    );
  }

  async getMe() {
    return this.request<User>("auth/me");
  }

  async getProfile() {
    return this.request<User>("users/profile");
  }

  async updateProfile(data: { name?: string; avatar?: string }) {
    return this.request<User>("users/profile", {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async analyzeWater(file: File, location?: string, notes?: string) {
    const formData = new FormData();
    formData.append("image", file);

    if (location) {
      formData.append("location", location);
    }

    if (notes) {
      formData.append("notes", notes);
    }

    return this.request<WaterAnalysis>("water-analysis/analyze", {
      method: "POST",
      body: formData,
      isFormData: true,
    });
  }

  async getAnalysisHistory(page = 1, limit = 10) {
    return this.request<{
      analyses: WaterAnalysis[];
      total: number;
      pages: number;
      currentPage: number;
    }>(`water-analysis/history?page=${page}&limit=${limit}`);
  }

  async getAnalysisStats() {
    return this.request<WaterAnalysisStats>("water-analysis/stats");
  }

  async getAnalysisById(id: string) {
    return this.request<WaterAnalysis>(`water-analysis/${id}`);
  }

  async deleteAnalysis(id: string) {
    return this.request<{ message: string }>(`water-analysis/${id}`, {
      method: "DELETE",
    });
  }
}

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
    foamCoverage: WaterParameter;
    algaeDensity: WaterParameter;
    shorelineResidue: WaterParameter;
    waterDiscoloration: WaterParameter;
    stagnationIndex: WaterParameter;
    surfaceVolatility: WaterParameter;
  };
  recommendations: string[];
  detailedAnalysis: string;
  waterType: string;
  potentialContaminants: string[];
  frothStage: "stable" | "watch" | "forming" | "imminent";
  estimatedTimeToFrothHours: number;
  estimatedTimeToFrothLabel: string;
  frothConfidence: number;
  estimatedFrothCoveragePercent: number;
  keyDrivers: string[];
  mlPredictionLabel: "Low Risk" | "Medium Risk" | "High Risk";
  mlPredictedClass: "low" | "medium" | "high";
  mlConfidence: number;
  mlProbabilities: Record<string, number>;
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
