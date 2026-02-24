import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface ContactRequest {
  id: string;
  response_id?: string;
  typeform_response_id: string;
  submitted_at: string;
  form_id: string;
  name: string;
  nom?: string;
  prenom?: string;
  email: string;
  phone?: string;
  telephone?: string;
  company?: string;
  entreprise?: string;
  message?: string;
  besoin?: string;
  secteur?: string;
  requester_type?: string;
  address?: string;
  address_line2?: string;
  city?: string;
  postal_code?: string;
  department?: string;
  country?: string;
  state_region?: string;
  motif?: string;
  status: 'new' | 'to_contact' | 'qualified' | 'out_of_criteria' | 'to_relaunch';
  priority: 'low' | 'medium' | 'high';
  notes?: string;
  assigned_to?: string;
  partner?: string;
  raw_data: any;
}

export interface TypeformMetadata {
  typeform_response_id: string;
  status: 'new' | 'to_contact' | 'qualified' | 'out_of_criteria' | 'to_relaunch';
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

export interface Collaborator {
  id: string;
  name: string;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export async function fetchCollaborators(): Promise<Collaborator[]> {
  const { data, error } = await supabase
    .from('collaborators')
    .select('*')
    .eq('active', true)
    .order('name', { ascending: true });

  if (error) {
    throw new Error(`Erreur lors du chargement des collaborateurs: ${error.message}`);
  }

  return data || [];
}
