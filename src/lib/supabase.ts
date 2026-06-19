import { createClient } from "@supabase/supabase-js";
import { mergeSiteContent, type SiteContent } from "./siteContent";

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

export interface PublicEstablishment {
  id: string;
  name: string;
  slug: string;
  city: string | null;
  latitude: number | null;
  longitude: number | null;
  organization_id: string;
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

/** Établissements actifs géolocalisés (lat/lng saisis via l'autocomplétion admin) → carte. */
export async function fetchPublicEstablishments(): Promise<PublicEstablishment[]> {
  const { data } = await supabase
    .from("establishments")
    .select("id, name, slug, city, latitude, longitude, organization_id")
    .eq("active", true)
    .not("latitude", "is", null)
    .not("longitude", "is", null);
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

// ══════════════════════════════════════════════════════════════
//  Fiche d'un lieu — casaminga.com/<slug>  (belle URL, vitrine)
//  Lecture seule : tout le transactionnel renvoie vers admin.casaminga.com.
// ══════════════════════════════════════════════════════════════

export const ADMIN_BASE = "https://admin.casaminga.com";

export interface LieuOrg extends PublicOrg {
  hours: string | null;
}

export interface LieuCampaign extends PublicCampaign {
  tiers: { id: string; name: string; amount: number }[];
}

export interface LieuSpace {
  id: string;
  name: string;
  type: string | null;
  capacity: number | null;
  area: number | null;
  price_hour: number | null;
  price_day: number | null;
  price_person: number | null;
  description: string | null;
  photos: string[] | null;
}

export interface LieuData {
  org: LieuOrg;
  title: string;
  seoDescription: string | null;
  content: SiteContent;
  /** Événements publics à venir, triés (page d'accueil = 6 premiers). */
  events: PublicEvent[];
  campaigns: LieuCampaign[];
  spaces: LieuSpace[];
}

const LIEU_ORG_COLUMNS =
  "id, slug, name, description, structure, address, hours, primary_color, website";

/**
 * Charge la vitrine publique d'un lieu par son slug d'organisation.
 *
 * Renvoie `null` si l'org n'existe pas OU si son site n'est pas publié
 * (RLS : public_sites lisible uniquement quand status='publie'). Toutes les
 * sous-ressources (events, campagnes, espaces) reposent sur leurs policies
 * de lecture publique respectives.
 */
export async function fetchLieuBySlug(slug: string): Promise<LieuData | null> {
  const { data: org } = await supabase
    .from("organizations")
    .select(LIEU_ORG_COLUMNS)
    .eq("slug", slug)
    .maybeSingle();
  if (!org) return null;

  // Gate de publication : le site doit exister ET être publié.
  const { data: site } = await supabase
    .from("public_sites")
    .select("title, seo_description, content_blocks, status")
    .eq("organization_id", org.id)
    .eq("status", "publie")
    .maybeSingle();
  if (!site) return null;

  const now = new Date().toISOString();
  const [eventsRes, campaignsRes, spacesRes] = await Promise.all([
    supabase
      .from("evenements")
      .select(EVENT_COLUMNS)
      .eq("organization_id", org.id)
      .eq("show_on_public_site", true)
      .gte("start_at", now)
      .in("status", ["publie", "confirme", "planifie"])
      .order("start_at"),
    supabase
      .from("membership_campaigns")
      .select("id, organization_id, title, slug, description, status, show_member_count, show_collected, max_members")
      .eq("organization_id", org.id)
      .eq("status", "publie")
      .order("created_at", { ascending: false }),
    supabase
      .from("spaces")
      .select("id, name, type, capacity, area, price_hour, price_day, price_person, description, photos")
      .eq("organization_id", org.id)
      .eq("status", "disponible")
      .order("created_at", { ascending: false }),
  ]);

  const events = (eventsRes.data ?? []) as PublicEvent[];
  const spaces = (spacesRes.data ?? []) as LieuSpace[];

  // Tiers des campagnes (en parallèle).
  const campaignsRaw = campaignsRes.data ?? [];
  const campaigns: LieuCampaign[] = await Promise.all(
    campaignsRaw.map(async (cp) => ({
      ...(cp as PublicCampaign),
      tiers: await fetchCampaignTiers(cp.id),
    }))
  );

  return {
    org: org as LieuOrg,
    title: site.title ?? org.name,
    seoDescription: site.seo_description ?? null,
    content: mergeSiteContent(site.content_blocks),
    events,
    campaigns,
    spaces,
  };
}
