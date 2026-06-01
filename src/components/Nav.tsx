import { useState } from "react";

export function Nav() {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  const links = [
    { label: "Les lieux", href: "#lieux" },
    { label: "Événements", href: "#evenements" },
    { label: "Rejoindre", href: "#adhesions" },
    { label: "Tarifs", href: "#tarifs" },
  ];

  return (
    <nav
      className="sticky top-0 z-50 border-b"
      style={{
        background: "rgba(255,251,240,0.92)",
        backdropFilter: "blur(14px)",
        WebkitBackdropFilter: "blur(14px)",
        borderColor: "rgba(255,180,162,0.28)",
      }}
      aria-label="Navigation principale"
    >
      <div className="mx-auto flex max-w-[1280px] items-center gap-8 px-7 py-3.5">
        {/* Logo */}
        <a href="#hero" className="flex items-center gap-2.5" style={{ color: "var(--black)" }}>
          <span
            className="flex size-9 items-center justify-center rounded-[11px] text-sm font-extrabold text-white"
            style={{ background: "linear-gradient(135deg, var(--coral), var(--coral-dark))", boxShadow: "0 4px 12px rgba(255,138,101,0.32)" }}
          >
            CM
          </span>
          <span className="font-extrabold text-[17px] tracking-tight">Casa Minga</span>
        </a>

        {/* Liens desktop */}
        <ul className="ml-auto hidden list-none items-center gap-7 md:flex">
          {links.map((l) => (
            <li key={l.href}>
              <a href={l.href} className="text-[13.5px] font-medium" style={{ color: "var(--black)" }}>
                {l.label}
              </a>
            </li>
          ))}
        </ul>

        {/* CTA desktop */}
        <div className="hidden items-center gap-2.5 md:flex">
          <a href="https://admin.casaminga.com" target="_blank" rel="noopener noreferrer" className="btn btn-secondary btn-sm">
            Espace admin
          </a>
          <a href="#adhesions" className="btn btn-primary btn-sm">Rejoindre un lieu</a>
        </div>

        {/* Burger mobile */}
        <button
          onClick={() => setOpen((v) => !v)}
          aria-label="Menu"
          className="ml-auto flex size-11 items-center justify-center rounded-[11px] border bg-white text-lg md:hidden"
          style={{ borderColor: "var(--gray-mid)", color: "var(--black)" }}
        >
          {open ? "✕" : "☰"}
        </button>
      </div>

      {/* Drawer mobile */}
      {open && (
        <>
          <div className="fixed inset-0 z-[101] md:hidden" style={{ background: "rgba(28,28,28,0.45)" }} onClick={close} />
          <div
            className="fixed right-0 top-0 bottom-0 z-[102] flex w-[min(86vw,360px)] flex-col overflow-y-auto px-7 pt-20 pb-8 md:hidden"
            style={{ background: "var(--cream)", boxShadow: "-16px 0 48px rgba(28,28,28,0.12)" }}
          >
            <button onClick={close} aria-label="Fermer" className="absolute right-5 top-5 flex size-11 items-center justify-center rounded-[11px] border bg-white text-xl" style={{ borderColor: "var(--gray-mid)" }}>✕</button>
            {links.map((l) => (
              <a key={l.href} href={l.href} onClick={close} className="flex min-h-[56px] items-center border-b py-4 text-lg font-semibold" style={{ borderColor: "var(--gray-mid)", color: "var(--black)" }}>
                {l.label}
              </a>
            ))}
            <div className="mt-6 flex flex-col gap-2.5">
              <a href="https://admin.casaminga.com" target="_blank" rel="noopener noreferrer" className="btn btn-secondary w-full">Espace admin</a>
              <a href="#adhesions" onClick={close} className="btn btn-primary w-full">Rejoindre un lieu</a>
            </div>
          </div>
        </>
      )}
    </nav>
  );
}
