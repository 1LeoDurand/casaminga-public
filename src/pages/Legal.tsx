import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { SiteHeader } from "../components/SiteHeader";
import { SiteFooter } from "../components/SiteFooter";
import { usePageMeta } from "../lib/seo";

/**
 * Mentions légales et politique de confidentialité.
 *
 * Calquées sur celles de sejour.casaminga.com, avec une différence qu'il ne
 * fallait surtout pas recopier : ce site n'est pas édité par l'entreprise
 * individuelle mais par **l'association La Manufacture des Pays**. C'est la
 * condition même du Google Ad Grant, et le pied de page comme la page contact
 * l'annoncent déjà ; des mentions légales qui diraient autre chose ruineraient
 * la cohérence de l'ensemble.
 *
 * Le contenu de la politique de confidentialité n'est pas un modèle recopié :
 * il décrit ce que le site fait réellement, relevé dans un navigateur le
 * 2026-09-09. Deux cookies, tous deux de Google Analytics, aucun stockage
 * local, et six services tiers contactés. Une politique générique aurait
 * annoncé des traitements inexistants et tu son seul traceur réel.
 */

const UPDATED = "9 septembre 2026";

function LegalPage({ title, intro, children }: { title: string; intro: string; children: ReactNode }) {
  return (
    <div style={{ background: "var(--cream)", minHeight: "100vh" }}>
      <SiteHeader />
      <main>
        <section className="wrap" style={{ paddingTop: "clamp(48px,7vw,84px)", paddingBottom: "clamp(48px,7vw,80px)" }}>
          <span className="eyebrow">Informations légales</span>
          <h1 style={{ maxWidth: "18ch" }}>{title}</h1>
          <p className="lead" style={{ marginTop: "18px" }}>{intro}</p>
          <p className="mt-3 text-sm" style={{ color: "var(--gray)" }}>
            Dernière mise à jour : {UPDATED}
          </p>
          {/* 68 caractères par ligne : au-delà, l'oeil perd la ligne suivante,
              et ces pages sont déjà assez ingrates à lire. */}
          <div className="mt-10 flex flex-col gap-9" style={{ maxWidth: "68ch" }}>
            {children}
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}

function Bloc({ titre, children }: { titre: string; children: ReactNode }) {
  return (
    <section>
      <h2>{titre}</h2>
      <div
        className="mt-3 flex flex-col gap-3 text-[15px]"
        style={{ color: "var(--black-soft)", lineHeight: 1.7 }}
      >
        {children}
      </div>
    </section>
  );
}

/** Ligne d'un tableau d'identité (libellé à gauche, valeur à droite). */
function Ligne({ cle, children }: { cle: string; children: ReactNode }) {
  return (
    <>
      <dt style={{ color: "var(--gray)" }}>{cle}</dt>
      <dd style={{ margin: 0, color: "var(--black-soft)" }}>{children}</dd>
    </>
  );
}

/**
 * Tableau d'identité : libellé au-dessus de la valeur sur mobile, côte à côte
 * à partir de 640 px. En deux colonnes dès 320 px, « Établissement secondaire »
 * et une adresse postale ne tenaient pas ensemble et poussaient la page à
 * 410 px de large, ce que l'audit a signalé aussitôt. Les `minmax(0, ...)`
 * autorisent chaque colonne à se comprimer, ce qu'un `auto` refuse.
 */
const DL_CLASS =
  "m-0 grid grid-cols-1 gap-x-5 gap-y-1 text-[15px] " +
  "sm:grid-cols-[minmax(0,auto)_minmax(0,1fr)] sm:gap-y-2";

export function MentionsLegales() {
  usePageMeta({
    title: "Mentions légales | Casaminga",
    description:
      "Éditeur, directeur de publication, hébergeur et propriété intellectuelle du site casaminga.com, édité par l'association La Manufacture des Pays.",
    canonical: "/mentions-legales",
  });

  return (
    <LegalPage
      title="Mentions légales"
      intro="Qui édite ce site, qui l'héberge, et à qui s'adresser."
    >
      <Bloc titre="Éditeur du site">
        <p>
          Le site <strong>casaminga.com</strong> est édité par l'association
          <strong> La Manufacture des Pays</strong>, association régie par la loi du
          1<sup>er</sup> juillet 1901. Casaminga est la plateforme numérique de
          l'association.
        </p>
        <dl className={DL_CLASS}>
          <Ligne cle="Statut">Association déclarée (loi 1901)</Ligne>
          <Ligne cle="RNA">W342002465, inscrite le 12/10/2016</Ligne>
          <Ligne cle="SIREN">824 820 856</Ligne>
          <Ligne cle="SIRET (siège)">824 820 856 00014</Ligne>
          <Ligne cle="TVA">FR49824820856</Ligne>
          <Ligne cle="Siège">
            Atelier Bernard Kohn, La Distillerie
            <br />
            10 rue de la sous-préfecture, 34700 Lodève
          </Ligne>
          <Ligne cle="Établissement secondaire">
            Tiers-lieu Bernard Kohn, Saint-Mandé
          </Ligne>
          <Ligne cle="Email">
            <a href="mailto:manufacturedespays@gmail.com">manufacturedespays@gmail.com</a>
          </Ligne>
          <Ligne cle="Téléphone">
            <a href="tel:+33611831112">06 11 83 11 12</a>
          </Ligne>
        </dl>
      </Bloc>

      <Bloc titre="Directeur de la publication">
        <p>
          Le représentant légal de l'association La Manufacture des Pays, en sa
          qualité d'éditeur du site.
        </p>
      </Bloc>

      <Bloc titre="Hébergement">
        <p>Le site est hébergé par :</p>
        <p>
          <strong>Infomaniak Network SA</strong>
          <br />
          Rue Eugène-Marziano 25, 1227 Les Acacias (Genève), Suisse
          <br />
          Téléphone : +41 22 820 35 44
          <br />
          <a href="https://www.infomaniak.com" target="_blank" rel="noopener noreferrer">
            infomaniak.com
          </a>
        </p>
        <p>
          Les données de la plateforme sont hébergées par <strong>Supabase</strong>,
          sur des serveurs situés en Irlande (Union européenne).
        </p>
      </Bloc>

      <Bloc titre="Propriété intellectuelle">
        <p>
          Les textes, visuels, logo et charte graphique de ce site sont protégés par
          le droit de la propriété intellectuelle. Toute reproduction ou
          représentation, totale ou partielle, sans autorisation préalable de
          l'éditeur, est interdite.
        </p>
        <p>
          Les contenus publiés par les lieux du réseau restent la propriété de leurs
          auteurs. Les événements repris d'agendas publics ouverts restent la
          propriété de leurs organisateurs et sont diffusés sous
          <strong> Licence Ouverte / Open Licence</strong> ; chaque fiche indique sa
          provenance et renvoie à sa source.
        </p>
      </Bloc>

      <Bloc titre="Responsabilité">
        <p>
          L'éditeur s'efforce d'assurer l'exactitude des informations diffusées mais
          ne saurait être tenu responsable des erreurs, des omissions, ni de
          l'indisponibilité du service. Les informations pratiques d'un événement
          (horaires, tarif, inscription) sont celles communiquées par son
          organisateur : elles peuvent changer sans que ce site en soit informé.
        </p>
        <p>
          Les liens vers des sites tiers sont fournis à titre informatif. L'éditeur
          n'exerce aucun contrôle sur leur contenu.
        </p>
      </Bloc>

      <Bloc titre="Données personnelles">
        <p>
          Le traitement de vos données est décrit dans la{" "}
          <Link to="/confidentialite">politique de confidentialité</Link>.
        </p>
      </Bloc>
    </LegalPage>
  );
}

export function Confidentialite() {
  usePageMeta({
    title: "Politique de confidentialité | Casaminga",
    description:
      "Ce que casaminga.com collecte, les deux cookies de mesure d'audience qu'il dépose, les services tiers qu'il contacte, et comment exercer vos droits.",
    canonical: "/confidentialite",
  });

  return (
    <LegalPage
      title="Politique de confidentialité"
      intro="Ce site ne demande ni compte, ni inscription, ni formulaire. Voici précisément ce qu'il collecte malgré tout, et comment vous y opposer."
    >
      <Bloc titre="Responsable du traitement">
        <p>
          <strong>La Manufacture des Pays</strong>, association loi 1901, RNA
          W342002465, dont le siège est Atelier Bernard Kohn, La Distillerie,
          10 rue de la sous-préfecture, 34700 Lodève.
        </p>
        <p>
          Contact pour toute question relative à vos données :{" "}
          <a href="mailto:manufacturedespays@gmail.com">manufacturedespays@gmail.com</a>.
        </p>
      </Bloc>

      <Bloc titre="Ce que le site ne fait pas">
        <p>
          Il n'y a sur casaminga.com <strong>ni compte, ni inscription, ni
          formulaire de contact</strong>. Nous écrire ouvre votre logiciel de
          messagerie : le message part directement, sans transiter par ce site et
          sans y être enregistré.
        </p>
        <p>
          Le site ne conserve rien dans votre navigateur en dehors des deux cookies
          de mesure d'audience décrits plus bas : ni stockage local, ni panier, ni
          profil.
        </p>
      </Bloc>

      <Bloc titre="Mesure d'audience">
        <p>
          Le site utilise <strong>Google Analytics 4</strong> pour compter les pages
          consultées et comprendre quels contenus sont utiles. Deux cookies sont
          déposés lors de votre visite :
        </p>
        <dl className={DL_CLASS}>
          <Ligne cle="_ga">Distingue les visiteurs entre eux</Ligne>
          <Ligne cle="_ga_YVESYBCXC6">Mesure la session en cours</Ligne>
        </dl>
        <p>
          Finalité : mesure d'audience. Ces mesures servent notamment à rendre
          compte de l'usage du dispositif publicitaire Google Ad Grants dont
          bénéficie l'association. La durée de conservation est celle paramétrée
          dans la propriété Analytics.
        </p>
        <p>
          Vous pouvez vous y opposer à tout moment en installant le{" "}
          <a
            href="https://tools.google.com/dlpage/gaoptout"
            target="_blank"
            rel="noopener noreferrer"
          >
            module de désactivation de Google Analytics
          </a>
          , en refusant les cookies dans les réglages de votre navigateur, ou en
          nous écrivant.
        </p>
      </Bloc>

      <Bloc titre="Services tiers contactés">
        <p>
          Afficher une page de ce site fait appel aux services suivants, qui
          reçoivent de ce fait votre adresse IP :
        </p>
        <dl className={DL_CLASS}>
          <Ligne cle="Google">
            Analytics et polices de caractères (Poppins)
          </Ligne>
          <Ligne cle="Supabase">
            Base de données du site, serveurs en Irlande
          </Ligne>
          <Ligne cle="OpenStreetMap">Fonds de carte</Ligne>
          <Ligne cle="OpenAgenda">Images des événements repris</Ligne>
          <Ligne cle="Unsplash">Illustrations de remplacement</Ligne>
        </dl>
        <p>
          Aucune donnée ne leur est transmise volontairement à votre sujet en
          dehors de ce qu'implique techniquement l'affichage d'une page.
        </p>
      </Bloc>

      <Bloc titre="Événements repris d'agendas publics">
        <p>
          Une partie de l'agenda provient d'
          <strong>agendas publics ouverts</strong>, diffusés sous Licence Ouverte.
          Sont repris le descriptif de l'événement, son lieu, ses horaires, et les
          coordonnées de contact que l'organisateur a lui-même publiées pour être
          joint, qui sont des coordonnées professionnelles et non personnelles.
        </p>
        <p>
          Chaque fiche indique sa provenance et renvoie à sa source. Ces lieux
          n'apparaissent pas dans l'annuaire du réseau : ils n'y ont pas adhéré.
        </p>
        <p>
          Vous organisez un événement repris ici et vous souhaitez le corriger, en
          reprendre la page ou le faire retirer ? Écrivez à{" "}
          <a href="mailto:manufacturedespays@gmail.com">manufacturedespays@gmail.com</a>,
          nous donnons suite.
        </p>
      </Bloc>

      <Bloc titre="Vos droits">
        <p>
          Conformément au Règlement général sur la protection des données, vous
          disposez d'un droit d'accès, de rectification, d'effacement, de limitation
          et d'opposition sur les données vous concernant. Écrivez à{" "}
          <a href="mailto:manufacturedespays@gmail.com">manufacturedespays@gmail.com</a>.
        </p>
        <p>
          Si la réponse ne vous convient pas, vous pouvez saisir la{" "}
          <a href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer">
            CNIL
          </a>
          , autorité française de contrôle.
        </p>
      </Bloc>

      <Bloc titre="Modification">
        <p>
          Cette politique peut évoluer avec le site. La version applicable est celle
          en vigueur au moment de votre visite. Dernière mise à jour : {UPDATED}.
        </p>
      </Bloc>
    </LegalPage>
  );
}
