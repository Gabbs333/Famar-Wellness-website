import { createClient } from '@supabase/supabase-js';

// Supabase configuration
// You'll need to create a Supabase project and add these to your .env file
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || '';

// Create a single supabase client for interacting with your database
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types (will be generated from Supabase schema)
export interface User {
  id: number;
  username: string;
  password_hash: string;
  created_at: string;
}

export interface Contact {
  id: number;
  name: string;
  email: string | null;
  phone: string | null;
  message: string | null;
  type: string;
  status: string;
  created_at: string;
}

export interface Subscriber {
  id: number;
  email: string;
  created_at: string;
}

export interface Booking {
  id: number;
  service: string;
  date: string;
  time: string;
  client_name: string;
  client_email: string;
  client_phone: string | null;
  status: string;
  google_event_id: string | null;
  created_at: string;
}

export interface Post {
  id: number;
  title: string;
  slug: string;
  content: string;
  excerpt: string | null;
  image_url: string | null;
  published: boolean;
  created_at: string;
  updated_at: string;
}

export interface CmsPage {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  content: string | Record<string, any> | null; // HTML ou JSON
  meta_title: string | null;
  meta_description: string | null;
  meta_keywords: string[] | null;
  featured_image: string | null;
  published: boolean;
  created_at: string;
  updated_at: string;
}

export interface CmsMedia {
  id: string;
  filename: string;
  file_path: string;
  file_type: string;
  file_size: number;
  alt_text: string | null;
  caption: string | null;
  width: number | null;
  height: number | null;
  created_at: string;
}