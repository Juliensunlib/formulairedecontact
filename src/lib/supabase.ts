import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface ContactRequest {
  id: string;
  typeform_response_id: string;
  submitted_at: string;
  form_id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  message?: string;
  requester_type?: string;
  address?: string;
  city?: string;
  postal_code?: string;
  department?: string;
  country?: string;
  status: 'new' | 'in_progress' | 'contacted' | 'completed' | 'archived';
  priority: 'low' | 'medium' | 'high';
  notes?: string;
  assigned_to?: string;
  raw_data: any;
}

export interface TypeformMetadata {
  typeform_response_id: string;
  status: 'new' | 'in_progress' | 'contacted' | 'completed' | 'archived';
  priority: 'low' | 'medium' | 'high';
  notes?: string;
  assigned_to?: string;
  created_at: string;
  updated_at: string;
}

export async function upsertTypeformMetadata(data: {
  typeform_response_id: string;
  status: string;
  priority: string;
  notes?: string | null;
  assigned_to?: string | null;
}) {
  const { data: existing } = await supabase
    .from('typeform_metadata')
    .select('typeform_response_id')
    .eq('typeform_response_id', data.typeform_response_id)
    .maybeSingle();

  if (existing) {
    const { error: updateError } = await supabase
      .from('typeform_metadata')
      .update({
        status: data.status,
        priority: data.priority,
        notes: data.notes,
        assigned_to: data.assigned_to,
        updated_at: new Date().toISOString(),
      })
      .eq('typeform_response_id', data.typeform_response_id);

    if (updateError) throw updateError;
  } else {
    const { error: insertError } = await supabase
      .from('typeform_metadata')
      .insert({
        typeform_response_id: data.typeform_response_id,
        status: data.status,
        priority: data.priority,
        notes: data.notes,
        assigned_to: data.assigned_to,
      });

    if (insertError) throw insertError;
  }
}
