import { createClient } from "@supabase/supabase-js";
import { Platform } from "react-native";
import { SUPABASE_URL, SUPABASE_ANON_KEY } from "./env";

export interface DreamData {
  dream_text: string;
  mood: string;
  analysis: string;
  symbols: SymbolismItem[];
  user_id: string;
}

export interface SymbolismItem {
  symbol: string;
  meaning: string;
}

export interface SavedDream {
  id: string;
  created_at: string;
  dream_text: string;
  mood: string;
  analysis: string;
  symbols: SymbolismItem[];
  user_id: string;
}

class SupabaseService {
  private supabase;

  constructor() {
    this.supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        persistSession: true,
        // Storage is handled differently on React Native
        storage:
          Platform.OS === "web"
            ? localStorage
            : {
                getItem: async (key: string) => {
                  try {
                    // You can implement AsyncStorage here if needed
                    return null;
                  } catch (e) {
                    return null;
                  }
                },
                setItem: async (key: string, value: string) => {},
                removeItem: async (key: string) => {},
              },
      },
    });
  }

  // Save a dream to Supabase
  async saveDream(dreamData: DreamData): Promise<SavedDream | null> {
    try {
      const { data, error } = await this.supabase
        .from("dreams")
        .insert([dreamData])
        .select()
        .single();

      if (error) {
        console.error("Error saving dream to Supabase:", error);
        return null;
      }

      return data as SavedDream;
    } catch (error) {
      console.error("Exception saving dream to Supabase:", error);
      return null;
    }
  }

  // Get all dreams for a user
  async getDreams(userId = "anonymous"): Promise<SavedDream[]> {
    try {
      const { data, error } = await this.supabase
        .from("dreams")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching dreams from Supabase:", error);
        return [];
      }

      return data as SavedDream[];
    } catch (error) {
      console.error("Exception fetching dreams from Supabase:", error);
      return [];
    }
  }

  // Delete a dream by ID
  async deleteDream(dreamId: string): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from("dreams")
        .delete()
        .eq("id", dreamId);

      if (error) {
        console.error("Error deleting dream from Supabase:", error);
        return false;
      }

      return true;
    } catch (error) {
      console.error("Exception deleting dream from Supabase:", error);
      return false;
    }
  }

  async uploadBase64Image(
    blob: any, // React Native blob object
    bucketName: string,
    fileName: string = `generated-image-${Date.now()}.png`
  ) {
    const { data, error } = await this.supabase.storage
      .from(bucketName)
      .upload(fileName, blob, {
        contentType: blob.type || "image/png",
        cacheControl: "3600",
        upsert: false,
      });
  }
}

// Export a singleton instance
export default new SupabaseService();
