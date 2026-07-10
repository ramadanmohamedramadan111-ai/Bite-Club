export type ItemOption = {
  id: string;
  name: string;
  price: number;
};

export type ItemOptionGroup = {
  id: string;
  title: string;
  required: boolean;
  type: 'single' | 'multiple';
  minSelections?: number;
  maxSelections?: number;
  options: ItemOption[];
};

export type MenuItem = {
  id: number;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  categories: string[];
  likesCount: number;
  preparationTime: number;
  available: boolean;
  stock?: number;
  restaurantId: number;
  image: string;
  options: ItemOptionGroup[];
};
