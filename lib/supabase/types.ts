/**
 * Supabase database types.
 * Regenerate after schema changes with:
 *   npx supabase gen types typescript --project-id <your-project-ref> > lib/supabase/types.ts
 */
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  public: {
    Tables: {
      waitlist: {
        Row: {
          id: number
          created_at: string
          email: string
          name: string | null
          phone: string | null
          source: string | null
          interested_in: string | null
          notes: string | null
        }
        Insert: {
          id?: number
          created_at?: string
          email: string
          name?: string | null
          phone?: string | null
          source?: string | null
          interested_in?: string | null
          notes?: string | null
        }
        Update: {
          id?: number
          created_at?: string
          email?: string
          name?: string | null
          phone?: string | null
          source?: string | null
          interested_in?: string | null
          notes?: string | null
        }
        Relationships: []
      }
      commission_orders: {
        Row: {
          id: number
          created_at: string
          updated_at: string
          customer_name: string
          customer_email: string
          customer_phone: string | null
          service_type: string
          style: string | null
          description: string
          reference_links: string | null
          budget: string | null
          deadline: string | null
          status: string
          quoted_price: number | null
          internal_notes: string | null
          adjustment_label: string | null
          adjustment_amount: number | null
          adjustment_reason: string | null
          // — migration 0006 additions —
          order_number: string | null
          customer_id: number | null
          bucket_slug: string | null
          product_slug: string | null
          tier_slug: string | null
          style_tags: string[] | null
          reference_urls: string[] | null
          quantity: string | null
          budget_range: string | null
          budget_context: string | null
          extras_count: number | null
          bundle_token: boolean | null
          quote_base_cents: number | null
          quote_addons: Json
          commercial_uplift: boolean | null
          quote_total_cents: number | null
          stripe_session_id: string | null
          stripe_payment_intent: string | null
          stripe_balance_session_id: string | null
          stripe_balance_payment_intent: string | null
          deposit_cents: number | null
          deposit_paid_at: string | null
          balance_paid_at: string | null
        }
        Insert: {
          id?: number
          created_at?: string
          updated_at?: string
          customer_name: string
          customer_email: string
          customer_phone?: string | null
          service_type: string
          style?: string | null
          description: string
          reference_links?: string | null
          budget?: string | null
          deadline?: string | null
          status?: string
          quoted_price?: number | null
          internal_notes?: string | null
          adjustment_label?: string | null
          adjustment_amount?: number | null
          adjustment_reason?: string | null
          order_number?: string | null
          customer_id?: number | null
          bucket_slug?: string | null
          product_slug?: string | null
          tier_slug?: string | null
          style_tags?: string[] | null
          reference_urls?: string[] | null
          quantity?: string | null
          budget_range?: string | null
          budget_context?: string | null
          extras_count?: number | null
          bundle_token?: boolean | null
          quote_base_cents?: number | null
          quote_addons?: Json
          commercial_uplift?: boolean | null
          quote_total_cents?: number | null
          stripe_session_id?: string | null
          stripe_payment_intent?: string | null
          stripe_balance_session_id?: string | null
          stripe_balance_payment_intent?: string | null
          deposit_cents?: number | null
          deposit_paid_at?: string | null
          balance_paid_at?: string | null
        }
        Update: {
          id?: number
          created_at?: string
          updated_at?: string
          customer_name?: string
          customer_email?: string
          customer_phone?: string | null
          service_type?: string
          style?: string | null
          description?: string
          reference_links?: string | null
          budget?: string | null
          deadline?: string | null
          status?: string
          quoted_price?: number | null
          internal_notes?: string | null
          adjustment_label?: string | null
          adjustment_amount?: number | null
          adjustment_reason?: string | null
          order_number?: string | null
          customer_id?: number | null
          bucket_slug?: string | null
          product_slug?: string | null
          tier_slug?: string | null
          style_tags?: string[] | null
          reference_urls?: string[] | null
          quantity?: string | null
          budget_range?: string | null
          budget_context?: string | null
          extras_count?: number | null
          bundle_token?: boolean | null
          quote_base_cents?: number | null
          quote_addons?: Json
          commercial_uplift?: boolean | null
          quote_total_cents?: number | null
          stripe_session_id?: string | null
          stripe_payment_intent?: string | null
          stripe_balance_session_id?: string | null
          stripe_balance_payment_intent?: string | null
          deposit_cents?: number | null
          deposit_paid_at?: string | null
          balance_paid_at?: string | null
        }
        Relationships: []
      }
      customers: {
        Row: {
          id: number
          email: string
          name: string | null
          phone: string | null
          source: string | null
          notes: string | null
          first_seen_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          email: string
          name?: string | null
          phone?: string | null
          source?: string | null
          notes?: string | null
          first_seen_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          email?: string
          name?: string | null
          phone?: string | null
          source?: string | null
          notes?: string | null
          first_seen_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      order_status_log: {
        Row: {
          id: number
          order_id: number
          status: string
          by_user: string | null
          note: string | null
          created_at: string
        }
        Insert: {
          id?: number
          order_id: number
          status: string
          by_user?: string | null
          note?: string | null
          created_at?: string
        }
        Update: {
          id?: number
          order_id?: number
          status?: string
          by_user?: string | null
          note?: string | null
          created_at?: string
        }
        Relationships: []
      }
      order_messages: {
        Row: {
          id: number
          order_id: number
          direction: 'inbound' | 'outbound'
          channel: 'email' | 'admin_note' | 'system'
          subject: string | null
          body: string
          created_at: string
        }
        Insert: {
          id?: number
          order_id: number
          direction: 'inbound' | 'outbound'
          channel: 'email' | 'admin_note' | 'system'
          subject?: string | null
          body: string
          created_at?: string
        }
        Update: {
          id?: number
          order_id?: number
          direction?: 'inbound' | 'outbound'
          channel?: 'email' | 'admin_note' | 'system'
          subject?: string | null
          body?: string
          created_at?: string
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          id: number
          customer_id: number
          tier_slug: 'subscription-companion' | 'subscription-gm'
          stripe_subscription_id: string
          stripe_customer_id: string | null
          status: 'active' | 'paused' | 'cancelled'
          next_bill_date: string | null
          cycle_anchor_day: number
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          customer_id: number
          tier_slug: 'subscription-companion' | 'subscription-gm'
          stripe_subscription_id: string
          stripe_customer_id?: string | null
          status?: 'active' | 'paused' | 'cancelled'
          next_bill_date?: string | null
          cycle_anchor_day?: number
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          customer_id?: number
          tier_slug?: 'subscription-companion' | 'subscription-gm'
          stripe_subscription_id?: string
          stripe_customer_id?: string | null
          status?: 'active' | 'paused' | 'cancelled'
          next_bill_date?: string | null
          cycle_anchor_day?: number
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      subscription_cycles: {
        Row: {
          id: number
          subscription_id: number
          cycle_start: string
          ships_on: string
          items_planned: Json
          items_delivered: Json
          status: 'upcoming' | 'sketching' | 'painting' | 'shipped' | 'skipped'
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: number
          subscription_id: number
          cycle_start: string
          ships_on: string
          items_planned?: Json
          items_delivered?: Json
          status?: 'upcoming' | 'sketching' | 'painting' | 'shipped' | 'skipped'
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: number
          subscription_id?: number
          cycle_start?: string
          ships_on?: string
          items_planned?: Json
          items_delivered?: Json
          status?: 'upcoming' | 'sketching' | 'painting' | 'shipped' | 'skipped'
          notes?: string | null
          created_at?: string
        }
        Relationships: []
      }
      addons: {
        Row: {
          id: number
          slug: string
          name: string
          description: string | null
          flat_cents: number | null
          percent_uplift: number | null
          display_text: string
          sort_order: number
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          slug: string
          name: string
          description?: string | null
          flat_cents?: number | null
          percent_uplift?: number | null
          display_text: string
          sort_order?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          slug?: string
          name?: string
          description?: string | null
          flat_cents?: number | null
          percent_uplift?: number | null
          display_text?: string
          sort_order?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      portfolio_pieces: {
        Row: {
          id: number
          created_at: string
          updated_at: string
          slug: string
          title: string
          category: string
          description: string | null
          image_url: string
          thumbnail_url: string | null
          additional_images: string[] | null
          tags: string[] | null
          commissioned_by: string | null
          tools_used: string | null
          hours_spent: number | null
          style: string | null
          is_featured: boolean
          is_published: boolean
          seo_title: string | null
          seo_description: string | null
          sort_order: number
        }
        Insert: {
          id?: number
          created_at?: string
          updated_at?: string
          slug: string
          title: string
          category: string
          description?: string | null
          image_url: string
          thumbnail_url?: string | null
          additional_images?: string[] | null
          tags?: string[] | null
          commissioned_by?: string | null
          tools_used?: string | null
          hours_spent?: number | null
          style?: string | null
          is_featured?: boolean
          is_published?: boolean
          seo_title?: string | null
          seo_description?: string | null
          sort_order?: number
        }
        Update: {
          id?: number
          created_at?: string
          updated_at?: string
          slug?: string
          title?: string
          category?: string
          description?: string | null
          image_url?: string
          thumbnail_url?: string | null
          additional_images?: string[] | null
          tags?: string[] | null
          commissioned_by?: string | null
          tools_used?: string | null
          hours_spent?: number | null
          style?: string | null
          is_featured?: boolean
          is_published?: boolean
          seo_title?: string | null
          seo_description?: string | null
          sort_order?: number
        }
        Relationships: []
      }
      blog_posts: {
        Row: {
          id: number
          created_at: string
          updated_at: string
          published_at: string | null
          slug: string
          title: string
          excerpt: string | null
          content: string
          featured_image: string | null
          category: string
          tags: string[] | null
          author_name: string
          is_published: boolean
          read_time_minutes: number | null
          seo_title: string | null
          seo_description: string | null
          is_pillar: boolean
          pillar_genre: string | null
        }
        Insert: {
          id?: number
          created_at?: string
          updated_at?: string
          published_at?: string | null
          slug: string
          title: string
          excerpt?: string | null
          content: string
          featured_image?: string | null
          category: string
          tags?: string[] | null
          author_name: string
          is_published?: boolean
          read_time_minutes?: number | null
          seo_title?: string | null
          seo_description?: string | null
          is_pillar?: boolean
          pillar_genre?: string | null
        }
        Update: {
          id?: number
          created_at?: string
          updated_at?: string
          published_at?: string | null
          slug?: string
          title?: string
          excerpt?: string | null
          content?: string
          featured_image?: string | null
          category?: string
          tags?: string[] | null
          author_name?: string
          is_published?: boolean
          read_time_minutes?: number | null
          seo_title?: string | null
          seo_description?: string | null
          is_pillar?: boolean
          pillar_genre?: string | null
        }
        Relationships: []
      }
      services: {
        Row: {
          id: number
          created_at: string
          updated_at: string
          slug: string
          name: string
          bucket: string
          eyebrow: string | null
          lede: string | null
          description: string | null
          pricing_mode: string
          pricing: Json
          turnaround_low_days: number | null
          turnaround_high_days: number | null
          revisions_included: number | null
          resolution: string | null
          included: Json
          examples: Json
          faq: Json
          bundle_with_slugs: string[]
          bundle_uplift_cents: number | null
          genre_tags: string[]
          is_published: boolean
          is_featured_homepage: boolean
          featured_order: number | null
          sort_order: number
          seo_title: string | null
          seo_description: string | null
        }
        Insert: {
          id?: number
          created_at?: string
          updated_at?: string
          slug: string
          name: string
          bucket: string
          eyebrow?: string | null
          lede?: string | null
          description?: string | null
          pricing_mode?: string
          pricing?: Json
          turnaround_low_days?: number | null
          turnaround_high_days?: number | null
          revisions_included?: number | null
          resolution?: string | null
          included?: Json
          examples?: Json
          faq?: Json
          bundle_with_slugs?: string[]
          bundle_uplift_cents?: number | null
          genre_tags?: string[]
          is_published?: boolean
          is_featured_homepage?: boolean
          featured_order?: number | null
          sort_order?: number
          seo_title?: string | null
          seo_description?: string | null
        }
        Update: {
          id?: number
          created_at?: string
          updated_at?: string
          slug?: string
          name?: string
          bucket?: string
          eyebrow?: string | null
          lede?: string | null
          description?: string | null
          pricing_mode?: string
          pricing?: Json
          turnaround_low_days?: number | null
          turnaround_high_days?: number | null
          revisions_included?: number | null
          resolution?: string | null
          included?: Json
          examples?: Json
          faq?: Json
          bundle_with_slugs?: string[]
          bundle_uplift_cents?: number | null
          genre_tags?: string[]
          is_published?: boolean
          is_featured_homepage?: boolean
          featured_order?: number | null
          sort_order?: number
          seo_title?: string | null
          seo_description?: string | null
        }
        Relationships: []
      }
      reviews: {
        Row: {
          id: number
          created_at: string
          customer_name: string
          customer_role: string | null
          content: string
          rating: number
          service_type: string | null
          is_approved: boolean
          is_featured: boolean
          avatar_url: string | null
        }
        Insert: {
          id?: number
          created_at?: string
          customer_name: string
          customer_role?: string | null
          content: string
          rating: number
          service_type?: string | null
          is_approved?: boolean
          is_featured?: boolean
          avatar_url?: string | null
        }
        Update: {
          id?: number
          created_at?: string
          customer_name?: string
          customer_role?: string | null
          content?: string
          rating?: number
          service_type?: string | null
          is_approved?: boolean
          is_featured?: boolean
          avatar_url?: string | null
        }
        Relationships: []
      }
      slots: {
        Row: {
          id: number
          created_at: string
          slot_month: string
          slot_number: number
          status: string
          reserved_email: string | null
          reserved_name: string | null
          reserved_phone: string | null
          order_id: number | null
          notes: string | null
        }
        Insert: {
          id?: number
          created_at?: string
          slot_month: string
          slot_number: number
          status?: string
          reserved_email?: string | null
          reserved_name?: string | null
          reserved_phone?: string | null
          order_id?: number | null
          notes?: string | null
        }
        Update: {
          id?: number
          created_at?: string
          slot_month?: string
          slot_number?: number
          status?: string
          reserved_email?: string | null
          reserved_name?: string | null
          reserved_phone?: string | null
          order_id?: number | null
          notes?: string | null
        }
        Relationships: []
      }
      inquiries: {
        Row: {
          id: number
          created_at: string
          name: string
          email: string
          message: string
          is_read: boolean
          is_archived: boolean
        }
        Insert: {
          id?: number
          created_at?: string
          name: string
          email: string
          message: string
          is_read?: boolean
          is_archived?: boolean
        }
        Update: {
          id?: number
          created_at?: string
          name?: string
          email?: string
          message?: string
          is_read?: boolean
          is_archived?: boolean
        }
        Relationships: []
      }
    }
    Views: { [_ in never]: never }
    Functions: { [_ in never]: never }
    Enums: { [_ in never]: never }
    CompositeTypes: { [_ in never]: never }
  }
}
