import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL as string;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = createClient(url, key);

// ── Types publics ─────────────────────────────────────────────
export interface PublicOrg {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  structure: string | null;
  address: string | null;
  primary_color: string;
  website: string | null;
}

export interface PublicEvent {
  id: string;
  organization_id: string;
  title: string;
  type: string;
  status: string;
  start_at: string;
  end_at: string;
  price: number | null;
  description: string | null;
  photos?: string[] | null;
  capacity?: number | null;
  org?: PublicOrg;
}

export interface PublicCampaign {
  id: string;
  organization_id: string;
  title: string;
  slug: string;
  description: string | null;
  status: string;
  show_member_count: boolean;
  show_collected: boolean;
  max_members: number | null;
  member_count?: number;
  org?: PublicOrg;
  tiers?: { id: string; name: string; amount: number }[];
}

// ── Requêtes publiques ────────────────────────────────────────
export async function fetchPublicOrgs(): Promise<PublicOrg[]> {
  const { data } = await supabase
    .from("organizations")
    .select("id, slug, name, description, structure, address, primary_color, website")
    .order("name");
  return data ?? [];
}

export async function fetchUpcomingEvents(limit = 6): Promise<PublicEvent[]> {
  const now = new Date().toISOString();
  const { data } = await supabase
    .from("evenements")
    .select("id, organization_id, title, type, status, start_at, end_at, price, description")
    .gte("start_at", now)
    .in("status", ["publie", "confirme", "planifie"])
    .order("start_at")
    .limit(limit);
  return data ?? [];
}

export async function fetchPublicCampaigns(): Promise<PublicCampaign[]> {
  const { data } = await supabase
    .from("membership_campaigns")
    .select("id, organization_id, title, slug, description, status, show_member_count, show_collected, max_members")
    .eq("status", "publie")
    .order("created_at", { ascending: false });
  return data ?? [];
}

export async function fetchCampaignTiers(campaignId: string) {
  const { data } = await supabase
    .from("membership_tiers")
    .select("id, name, amount")
    .eq("campaign_id", campaignId)
    .order("amount");
  return data ?? [];
}

/**
 * Nombre réel d'adhérents actifs (toutes orgs confondues).
 * Renvoie `null` si la donnée n'est pas lisible publiquement (RLS) ou en cas
 * d'erreur — l'appelant masque alors la statistique plutôt que d'afficher un faux chiffre.
 */
export async function fetchActiveMemberCount(): Promise<number | null> {
  const { count, error } = await supabase
    .from("organization_members")
    .select("id", { count: "exact", head: true })
    .eq("status", "actif");
  if (error || count == null) return null;
  return count;
}

const EVENT_COLUMNS = "id, organization_id, title, type, status, start_at, end_at, price, description, photos, capacity";

export async function fetchDiscoveryEvents(limit = 100): Promise<PublicEvent[]> {
  const now = new Date().toISOString();
  const { data } = await supabase
    .from("evenements")
    .select("id, organization_id, title, type, status, start_at, end_at, price, description, photos, capacity")
    .eq("show_on_public_site", true)
    .gte("start_at", now)
    .in("status", ["publie", "confirme", "planifie"])
    .order("start_at")
    .limit(limit);
  return data ?? [];
}


const ORG_COLUMNS = "id, slug, name, description, structure, address, primary_color, website";

export interface EventDetailData {
  event: PublicEvent;
  org: PublicOrg | null;
  /** Autres événements à venir du même lieu (bloc « Plus d'événements »). */
  siblings: PublicEvent[];
}

/**
 * Charge le détail public d'un événement par son id : l'événement, son lieu,
 * et jusqu'à 4 autres événements à venir du même lieu. Renvoie `null` si
 * l'événement est introuvable.
 */
export async function fetchEventById(id: string): Promise<EventDetailData | null> {
  const { data: event } = await supabase
    .from("evenements")
    .select(EVENT_COLUMNS)
    .eq("id", id)
    .maybeSingle();
  if (!event) return null;

  const { data: org } = await supabase
    .from("organizations")
    .select(ORG_COLUMNS)
    .eq("id", event.organization_id)
    .maybeSingle();

  const now = new Date().toISOString();
  const { data: siblings } = await supabase
    .from("evenements")
    .select(EVENT_COLUMNS)
    .eq("organization_id", event.organization_id)
    .neq("id", id)
    .gte("start_at", now)
    .in("status", ["publie", "confirme", "planifie"])
    .order("start_at")
    .limit(4);

  return { event, org: org ?? null, siblings: siblings ?? [] };
}
