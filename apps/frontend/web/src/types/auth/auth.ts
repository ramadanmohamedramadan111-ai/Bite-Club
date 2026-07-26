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

export interface UserMeResponse {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  profile_image: string | null;
  date_of_birth: string | null;
  username: string;
  phone_number: string | null;
  gender: string | null;
  status: string;
  referral_code: string;
  last_login_at: string | null;
}

