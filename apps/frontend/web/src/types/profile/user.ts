export interface UserResponse {
  id: number;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  username: string;
  email: string;
  phone_number: string;
  profile_image: null | string;
  gender: 'male' | 'female';
  status: 'active';
  referral_code: string;
  last_login_at: string;
  posts_count: number;
  friends_count: number;
}

