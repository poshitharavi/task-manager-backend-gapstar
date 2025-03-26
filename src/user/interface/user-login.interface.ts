export interface UserPayload {
  sub: number;
  name: string;
  userName: string;
}

export interface LoginResponse {
  name: string;
  userName: string;
  token: string;
}
