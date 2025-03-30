import { SupabaseClient, createClient } from "@supabase/supabase-js";
import { SymbolismItem } from "./types";

// Define the dream data structure for Supabase
export interface DreamData {
  id?: string;
  created_at?: string;
  dream_text: string;
  mood: string;
  analysis: string;
  symbols: SymbolismItem[];
  user_id?: string;
}

class SupabaseService {
  private static supabase = (() => {
    const supabaseUrl = "https://ekhktoyvoksdlmplgfzs.supabase.co";
    const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_KEY as string;
    return createClient(supabaseUrl, supabaseKey);
  })();

  static getPublicUrl(bucket: string, path: string): string {
    return (
      this.supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl || ""
    ).replace("/storage/v1/object/public/", "/storage/v1/render/image/public/");
  }

  // Save a dream to the database
  static async saveDream(dreamData: DreamData): Promise<DreamData | null> {
    try {
      const { data, error } = await this.supabase
        .from('dreams')
        .insert([
          {
            dream_text: dreamData.dream_text,
            mood: dreamData.mood,
            analysis: dreamData.analysis,
            symbols: dreamData.symbols,
            user_id: dreamData.user_id || 'anonymous'
          }
        ])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error saving dream:', error);
      return null;
    }
  }

  // Get all dreams for a user
  static async getDreams(userId: string = 'anonymous'): Promise<DreamData[]> {
    try {
      const { data, error } = await this.supabase
        .from('dreams')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching dreams:', error);
      return [];
    }
  }

  // Delete a dream by ID
  static async deleteDream(dreamId: string): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from('dreams')
        .delete()
        .eq('id', dreamId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting dream:', error);
      return false;
    }
  }

  // Get a single dream by ID
  static async getDreamById(dreamId: string): Promise<DreamData | null> {
    try {
      const { data, error } = await this.supabase
        .from('dreams')
        .select('*')
        .eq('id', dreamId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching dream:', error);
      return null;
    }
  }
}

export default SupabaseService;
