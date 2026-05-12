export type Json = string | number | boolean | null | { [key: string]: Json } | Json[]

export interface Database {
  public: {
    Tables: {
      events: {
        Row: {
          id: string
          name: string
          starts_at: string | null
          ends_at: string | null
          status: 'draft' | 'live' | 'finished'
          timer_duration_seconds: number
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          starts_at?: string | null
          ends_at?: string | null
          status?: 'draft' | 'live' | 'finished'
          timer_duration_seconds?: number
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          starts_at?: string | null
          ends_at?: string | null
          status?: 'draft' | 'live' | 'finished'
          timer_duration_seconds?: number
          created_at?: string
        }
        Relationships: []
      }
      teams: {
        Row: {
          id: string
          event_id: string
          name: string
          team_number: number
          login_code: string
          score: number
          budget_remaining: number
          photo_count: number
          war_cry: string | null
          created_at: string
        }
        Insert: {
          id?: string
          event_id: string
          name: string
          team_number: number
          login_code: string
          score?: number
          budget_remaining?: number
          photo_count?: number
          war_cry?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          event_id?: string
          name?: string
          team_number?: number
          login_code?: string
          score?: number
          budget_remaining?: number
          photo_count?: number
          war_cry?: string | null
          created_at?: string
        }
        Relationships: []
      }
      team_zones: {
        Row: {
          id: string
          team_id: string
          zone_id: string
          unlocked_at: string
        }
        Insert: {
          id?: string
          team_id: string
          zone_id: string
          unlocked_at?: string
        }
        Update: {
          id?: string
          team_id?: string
          zone_id?: string
          unlocked_at?: string
        }
        Relationships: []
      }
      completions: {
        Row: {
          id: string
          team_id: string
          game_id: number
          submitted_at: string
          photo_url: string | null
          points_awarded: number
          status: 'pending' | 'approved' | 'rejected'
        }
        Insert: {
          id?: string
          team_id: string
          game_id: number
          submitted_at?: string
          photo_url?: string | null
          points_awarded: number
          status?: 'pending' | 'approved' | 'rejected'
        }
        Update: {
          id?: string
          team_id?: string
          game_id?: number
          submitted_at?: string
          photo_url?: string | null
          points_awarded?: number
          status?: 'pending' | 'approved' | 'rejected'
        }
        Relationships: []
      }
      broadcasts: {
        Row: {
          id: string
          event_id: string
          message: string
          sent_by: string
          sent_at: string
        }
        Insert: {
          id?: string
          event_id: string
          message: string
          sent_by?: string
          sent_at?: string
        }
        Update: {
          id?: string
          event_id?: string
          message?: string
          sent_by?: string
          sent_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      live_leaderboard: {
        Row: {
          id: string
          event_id: string
          name: string
          team_number: number
          score: number
          budget_remaining: number
          photo_count: number
          approved_count: number
          pending_count: number
          rank: number
        }
        Relationships: []
      }
    }
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}

export type TeamRow = Database['public']['Tables']['teams']['Row']
export type EventRow = Database['public']['Tables']['events']['Row']
export type CompletionRow = Database['public']['Tables']['completions']['Row']
export type BroadcastRow = Database['public']['Tables']['broadcasts']['Row']
export type LeaderboardRow = Database['public']['Views']['live_leaderboard']['Row']
