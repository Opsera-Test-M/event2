export type EventOccasion = 
  | 'birthday' 
  | 'baby_shower' 
  | 'wedding' 
  | 'house_party' 
  | 'festival' 
  | 'corporate' 
  | 'anniversary' 
  | 'graduation' 
  | 'holiday' 
  | 'other';

export type GuestType = 'kids' | 'adults' | 'mixed';
export type FoodPreference = 'veg' | 'non_veg' | 'mixed';
export type StylePreference = 'minimal' | 'luxury' | 'fun' | 'traditional' | 'modern';
export type EventStatus = 'draft' | 'planning' | 'complete';
export type ItemCategory = 
  | 'decor' 
  | 'tableware' 
  | 'lighting' 
  | 'party_supplies' 
  | 'return_gifts'
  | 'starters'
  | 'main_course'
  | 'desserts'
  | 'beverages';

export interface EventFormData {
  name: string;
  occasion: EventOccasion;
  event_date: Date;
  location: string;
  guest_count: number;
  budget: number;
  guest_type: GuestType;
  food_preference: FoodPreference;
  allergies?: string;
  style_preference: StylePreference;
}

export interface EventTheme {
  id: string;
  event_id: string;
  name: string;
  description: string;
  color_palette: string[];
  decor_vibe: string;
  created_at: string;
}

export interface EventItem {
  id: string;
  event_id: string;
  name: string;
  description?: string;
  category: ItemCategory;
  quantity: number;
  estimated_price?: number;
  is_owned: boolean;
  is_veg?: boolean;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Event {
  id: string;
  user_id: string;
  name: string;
  occasion: EventOccasion;
  event_date: string;
  location: string;
  guest_count: number;
  budget: number;
  guest_type: GuestType;
  food_preference: FoodPreference;
  allergies?: string;
  style_preference: StylePreference;
  status: EventStatus;
  selected_theme_id?: string;
  created_at: string;
  updated_at: string;
}

export const OCCASION_LABELS: Record<EventOccasion, string> = {
  birthday: 'Birthday Party',
  baby_shower: 'Baby Shower',
  wedding: 'Wedding',
  house_party: 'House Party',
  festival: 'Festival Celebration',
  corporate: 'Corporate Event',
  anniversary: 'Anniversary',
  graduation: 'Graduation',
  holiday: 'Holiday Party',
  other: 'Other',
};

export const GUEST_TYPE_LABELS: Record<GuestType, string> = {
  kids: 'Kids',
  adults: 'Adults',
  mixed: 'Mixed (Kids & Adults)',
};

export const FOOD_LABELS: Record<FoodPreference, string> = {
  veg: 'Vegetarian',
  non_veg: 'Non-Vegetarian',
  mixed: 'Mixed',
};

export const STYLE_LABELS: Record<StylePreference, string> = {
  minimal: 'Minimal',
  luxury: 'Luxury',
  fun: 'Fun & Playful',
  traditional: 'Traditional',
  modern: 'Modern',
};

export const CATEGORY_LABELS: Record<ItemCategory, string> = {
  decor: 'Decor',
  tableware: 'Tableware',
  lighting: 'Lighting',
  party_supplies: 'Party Supplies',
  return_gifts: 'Return Gifts',
  starters: 'Starters',
  main_course: 'Main Course',
  desserts: 'Desserts',
  beverages: 'Beverages',
};
