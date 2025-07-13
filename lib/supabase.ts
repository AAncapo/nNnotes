import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://hcjbaiblpzmiztigpmwi.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhjamJhaWJscHptaXp0aWdwbXdpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIzMzI2MzEsImV4cCI6MjA2NzkwODYzMX0.MWWUrIuEs4yFWidnJDbksQbKg_BdKh3FwnrH4OhJ0I0";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
