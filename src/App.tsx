import { useEffect, useState } from "react";
import { Nav } from "./components/Nav";
import { HeroScroll } from "./components/HeroScroll";
import { StatsSection } from "./components/StatsSection";
import { EventsSection } from "./components/EventsSection";
import { MembershipsSection } from "./components/MembershipsSection";
import { PricingSection } from "./components/PricingSection";
import { ManifestoSection } from "./components/ManifestoSection";
import { Footer } from "./components/Footer";
import {
  fetchPublicOrgs,
  fetchUpcomingEvents,
  fetchPublicCampaigns,
  type PublicOrg,
  type PublicEvent,
  type PublicCampaign,
} from "./lib/supabase";

export default function App() {
  const [orgs, setOrgs] = useState<PublicOrg[]>([]);
  const [events, setEvents] = useState<PublicEvent[]>([]);
  const [campaigns, setCampaigns] = useState<PublicCampaign[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetchPublicOrgs(),
      fetchUpcomingEvents(6),
      fetchPublicCampaigns(),
    ]).then(([o, e, c]) => {
      setOrgs(o);
      setEvents(e);
      setCampaigns(c);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center" style={{ background: "var(--cream)" }}>
        <div className="flex flex-col items-center gap-4">
          <span className="flex size-12 items-center justify-center rounded-xl text-lg font-extrabold text-white" style={{ background: "linear-gradient(135deg, var(--coral), var(--coral-dark))" }}>
            CM
          </span>
          <div className="h-1 w-32 overflow-hidden rounded-full" style={{ background: "var(--peach-pale)" }}>
            <div className="h-full w-1/2 animate-pulse rounded-full" style={{ background: "var(--coral)" }} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Nav />
      <main>
        <HeroScroll orgs={orgs} />
        <StatsSection
          orgCount={orgs.length}
          memberCount={orgs.length * 47} // estimatif — à brancher sur vraie donnée
          eventCount={events.length}
        />
        <EventsSection events={events} orgs={orgs} />
        <MembershipsSection campaigns={campaigns} orgs={orgs} />
        <PricingSection />
        <ManifestoSection />
      </main>
      <Footer />
    </>
  );
}
