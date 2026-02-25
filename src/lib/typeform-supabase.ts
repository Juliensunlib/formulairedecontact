import { supabase } from './supabase';

export interface TypeformResponse {
  id: string;
  response_id: string;
  form_id: string;
  submitted_at: string;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  entreprise: string;
  secteur: string;
  besoin: string;
  message: string;
  raw_data: any;
  priority: string;
  status: string;
  partner: string | null;
  assigned_to: string | null;
  created_at: string;
  updated_at: string;
}

export async function fetchTypeformResponsesFromSupabase(): Promise<TypeformResponse[]> {
  const { data, error } = await supabase
    .from('typeform_responses')
    .select('*')
    .order('submitted_at', { ascending: false });

  if (error) {
    throw new Error(`Erreur Supabase: ${error.message}`);
  }

  return data || [];
}

export async function updateTypeformResponseMetadata(
  responseId: string,
  updates: {
    status?: string;
    priority?: string;
    partner?: string | null;
    assigned_to?: string | null;
  }
): Promise<void> {
  const { error } = await supabase
    .from('typeform_responses')
    .update(updates)
    .eq('response_id', responseId);

  if (error) {
    throw new Error(`Erreur mise à jour: ${error.message}`);
  }
}

export async function syncAllTypeformResponses(): Promise<{
  success: boolean;
  total_fetched: number;
  inserted: number;
  updated: number;
  errors: number;
  message: string;
}> {
  const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/sync-typeform-complete`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Erreur de synchronisation: ${response.status} - ${errorText}`);
  }

  return await response.json();
}
