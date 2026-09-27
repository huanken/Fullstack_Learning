export interface Task {
  id: number;
  title: string;
  done: boolean;
  createdAt: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  role?: string;
}

export interface ApiResponse<T = any> {
  data?: T;
  total?: number;
  message?: string;
  error?: string;
}
