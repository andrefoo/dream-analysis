import { SupabaseClient, createClient } from "@supabase/supabase-js";

class SupabaseService {
  private static supabase = (() => {
    const supabaseUrl = "https://ekhktoyvoksdlmplgfzs.supabase.co";
    const supabaseKey = process.env.REACT_APP_SUPABASE_KEY as string;
    return createClient(supabaseUrl, supabaseKey);
  })();

  static getPublicUrl(bucket: string, path: string): string {
    return (
      this.supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl || ""
    ).replace("/storage/v1/object/public/", "/storage/v1/render/image/public/");
  }
}

export default SupabaseService;
