/**
 * Định nghĩa các Models và Generic API Response Wrapper theo bài học ngày 21/09
 */

export interface Post {
  id: number;
  userId: number;
  title: string;
  body: string;
}

export interface User {
  id: number;
  name: string;
  username: string;
  email: string;
  phone: string;
  website: string;
}

export interface ApiResponse<T> {
  data: T | null;
  status: number;
  error: string | null;
}

/**
 * Type-safe API Client Wrapper sử dụng fetch với Error Handling
 */
export async function apiRequest<T>(url: string, options?: RequestInit): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options?.headers || {})
      }
    });

    if (!response.ok) {
      return {
        data: null,
        status: response.status,
        error: `HTTP Error ${response.status}: ${response.statusText}`
      };
    }

    const data: T = await response.json();
    return {
      data,
      status: response.status,
      error: null
    };
  } catch (err: any) {
    return {
      data: null,
      status: 0,
      error: `Network/Client Error: ${err.message || String(err)}`
    };
  }
}
