import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://wfmtjwyfvaozimiibbso.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY || ''

// Create a real client if keys exist, otherwise a no-op proxy so the app runs in demo mode
export const supabase = supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : new Proxy({}, {
      get(_, prop) {
        if (prop === 'from') return () => ({
          select: () => ({ order: () => ({ data: null, error: null }), eq: () => ({ order: () => ({ data: null, error: null }), select: () => ({ data: null, error: null }) }), in: () => ({ order: () => ({ data: null, error: null }) }), data: null, error: null }),
          update: () => ({ eq: () => ({ select: () => ({ data: null, error: null }) }) }),
          insert: () => ({ select: () => ({ data: null, error: null }) }),
          delete: () => ({ eq: () => ({ data: null, error: null }) }),
        })
        if (prop === 'channel') return () => ({
          on: function() { return this },
          subscribe: function() { return this },
        })
        if (prop === 'removeChannel') return () => {}
        return () => {}
      }
    })

export const isDemo = !supabaseAnonKey
