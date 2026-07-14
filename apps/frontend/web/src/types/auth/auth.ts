export interface RestaurantRegistrationResponse {
  id: number;
  email: string;
  phone_number: string;
  category_id: number;
  description: string;
}

export interface UserRegistrationResponse {
  id: number;
  email: string;
  phone_number: string;
  first_name: string;
  last_name: string;
}

export interface UserLoginResponse {
  id: number;
  email: string;
  access_token: string;
  token_type: string;
}

export interface RestaurantLoginResponse {
  id: number;
  email: string;
  access_token: string;
  token_type: string;
}

