import { ContactRequest } from '../lib/supabase';
import { TypeformResponse } from '../lib/typeform-supabase';

export function mapTypeformResponseToContact(response: TypeformResponse): ContactRequest {
  const fullName = [response.prenom, response.nom].filter(Boolean).join(' ') || response.email;

  return {
    id: response.id,
    response_id: response.response_id,
    typeform_response_id: response.response_id,
    submitted_at: response.submitted_at,
    form_id: response.form_id,
    name: fullName,
    nom: response.nom,
    prenom: response.prenom,
    email: response.email || '',
    phone: response.telephone,
    telephone: response.telephone,
    company: response.entreprise,
    entreprise: response.entreprise,
    message: response.message,
    besoin: response.besoin,
    secteur: response.secteur,
    status: response.status as 'new' | 'to_contact' | 'qualified' | 'out_of_criteria' | 'to_relaunch',
    priority: response.priority as 'low' | 'medium' | 'high',
    partner: response.partner || undefined,
    assigned_to: response.assigned_to || '',
    notes: (response as any).notes || '',
    requester_type: (response as any).requester_type || '',
    address: (response as any).address || '',
    address_line2: (response as any).address_line2 || '',
    city: (response as any).city || '',
    postal_code: (response as any).postal_code || '',
    state_region: (response as any).state_region || '',
    country: (response as any).country || '',
    department: (response as any).department || '',
    raw_data: response.raw_data,
  };
}
