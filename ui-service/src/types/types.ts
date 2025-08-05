export interface LoginResponse {
  access_token: string;
  token_type: string;
}

export interface Todo {
  id: number;
  title: string;
  description: string;
}
