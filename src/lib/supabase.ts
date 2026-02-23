import { createBrowserClient } from '@supabase/ssr'
import { createClient, SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder'

export type Database = {
  public: {
    Tables: {
      page_settings: {
        Row: {
          id: number
          background_image_url: string | null
          header_title: string | null
          header_subtitle: string | null
          footer_logo_url: string | null
          footer_text: string | null
          footer_email: string | null
          footer_link_url: string | null
          footer_link_label: string | null
        }
        Insert: {
          id?: number
          background_image_url?: string | null
          header_title?: string | null
          header_subtitle?: string | null
          footer_logo_url?: string | null
          footer_text?: string | null
          footer_email?: string | null
          footer_link_url?: string | null
          footer_link_label?: string | null
        }
        Update: {
          id?: number
          background_image_url?: string | null
          header_title?: string | null
          header_subtitle?: string | null
          footer_logo_url?: string | null
          footer_text?: string | null
          footer_email?: string | null
          footer_link_url?: string | null
          footer_link_label?: string | null
        }
      }
      links: {
        Row: {
          id: number
          title: string
          image_url: string | null
          landing_url: string
          display_order: number
          is_active: boolean
          click_count: number
        }
        Insert: {
          id?: number
          title: string
          image_url?: string | null
          landing_url: string
          display_order: number
          is_active?: boolean
          click_count?: number
        }
        Update: {
          id?: number
          title?: string
          image_url?: string | null
          landing_url?: string
          display_order?: number
          is_active?: boolean
          click_count?: number
        }
      }
      page_views: {
        Row: {
          id: number
          visited_at: string
          user_agent: string | null
          referrer: string | null
        }
        Insert: {
          id?: number
          visited_at?: string
          user_agent?: string | null
          referrer?: string | null
        }
        Update: {
          id?: number
          visited_at?: string
          user_agent?: string | null
          referrer?: string | null
        }
      }
      admins: {
        Row: {
          id: string
          email: string
          invited_by: string | null
          created_at: string
        }
        Insert: {
          id?: string
          email: string
          invited_by?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          invited_by?: string | null
          created_at?: string
        }
      }
    }
  }
}

// Client for use in Browser
export const createClientComponentClient = () => {
  return createBrowserClient<Database>(supabaseUrl, supabaseAnonKey)
}

// Singleton for browser-side usage (backwards compatibility)
let supabaseInstance: SupabaseClient<Database> | null = null

export const getSupabase = () => {
  if (typeof window === 'undefined') {
    return createClient<Database>(supabaseUrl, supabaseAnonKey)
  }
  if (supabaseInstance) return supabaseInstance;
  supabaseInstance = createClientComponentClient() as SupabaseClient<Database>
  return supabaseInstance
}

// Keep a proxy for backwards compatibility but initialize lazily
export const supabase = new Proxy({} as SupabaseClient<Database>, {
  get(target, prop) {
    const client = getSupabase();
    return (client as any)[prop];
  }
});
