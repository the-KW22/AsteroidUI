"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, ChevronDown, Search, X } from "lucide-react";
import { DirectoryCard } from "./directory-specimen";
import { DirectoryStars } from "./directory-stars";
import styles from "./component-directory.module.css";

type Item = { slug: string; title: string };
type Tier = "particles" | "asteroid" | "galaxy";
type Section = Tier | "gettingStarted";

export function ComponentDirectory({ items }: { items: Item[] }) {
  const [query, setQuery] = useState("");
  const [tier, setTier] = useState<Tier>("particles");
  const [expanded, setExpanded] = useState<Record<Section, boolean>>({ particles: true, gettingStarted: false, asteroid: false, galaxy: false });
  const term = query.trim().toLocaleLowerCase();
  const results = items.filter(item => item.title.toLocaleLowerCase().includes(term));
  const toggle = (section: Section) => setExpanded(current => ({ ...current, [section]: !current[section] }));
  const selectTier = (next: Tier) => {
    setTier(next);
    if (next !== "particles") setQuery("");
    setExpanded(current => ({ ...current, [next]: true }));
  };

  return (
    <div className={styles.directory} data-component-directory>
      <DirectoryStars />
      <div className={styles.layout}>
        <aside className={styles.sidebar} aria-label="Directory navigation">
          <label className={styles.search}>
            <Search size={17} aria-hidden="true" />
            <span className={styles.visuallyHidden}>Search components</span>
            <input type="search" value={query} onChange={event => {
              setQuery(event.target.value);
              if (event.target.value.trim()) selectTier("particles");
            }} placeholder="Search components" />
          </label>
          <nav aria-label="Component navigation">
            <div className={styles.section}>
              <div className={styles.sectionHeader}>
                <button type="button" className={styles.sectionTitle} aria-current={tier === "particles" ? "page" : undefined} onClick={() => selectTier("particles")}>Particles</button>
                <button type="button" className={styles.sectionToggle} aria-label={`${expanded.particles ? "Collapse" : "Expand"} Particles`} aria-expanded={expanded.particles} aria-controls="directory-particles" onClick={() => toggle("particles")}><ChevronDown size={19} aria-hidden="true" /></button>
              </div>
              <ul id="directory-particles" className={styles.sidebarList} hidden={!expanded.particles}>
                {results.map(item => <li key={item.slug}><Link href={`/components/${item.slug}`}>{item.title}</Link></li>)}
              </ul>
            </div>
            <div className={styles.section}>
              <div className={styles.sectionHeader}>
                <Link className={styles.sectionTitle} href="/getting-started">Getting Started</Link>
                <button type="button" className={styles.sectionToggle} aria-label={`${expanded.gettingStarted ? "Collapse" : "Expand"} Getting Started`} aria-expanded={expanded.gettingStarted} aria-controls="directory-guides" onClick={() => toggle("gettingStarted")}><ChevronDown size={19} aria-hidden="true" /></button>
              </div>
              <ul id="directory-guides" className={styles.sidebarList} hidden={!expanded.gettingStarted}>
                <li><Link href="/getting-started">Overview</Link></li>
                <li><Link href="/getting-started/nextjs">Next.js</Link></li>
                <li><Link href="/getting-started/vite">Vite</Link></li>
                <li><Link href="/getting-started/theme">Theme</Link></li>
              </ul>
            </div>
            {(["asteroid", "galaxy"] as const).map(section => <div className={styles.section} key={section}>
              <div className={styles.sectionHeader}>
                <button type="button" className={styles.sectionTitle} aria-current={tier === section ? "page" : undefined} onClick={() => selectTier(section)}>{section === "asteroid" ? "Asteroid" : "Galaxy"}</button>
                <button type="button" className={styles.sectionToggle} aria-label={`${expanded[section] ? "Collapse" : "Expand"} ${section}`} aria-expanded={expanded[section]} aria-controls={`directory-${section}`} onClick={() => toggle(section)}><ChevronDown size={19} aria-hidden="true" /></button>
              </div>
              <ul id={`directory-${section}`} className={styles.sidebarList} hidden={!expanded[section]}>
                <li><Link href={`/#stage-${section}`}>About this stage</Link></li>
              </ul>
            </div>)}
          </nav>
        </aside>
        <main id="directory-content" tabIndex={-1} className={styles.main}>
          <div className={styles.heading}>
            <div>
              <h1>{tier === "particles" ? "Particles." : tier === "asteroid" ? "Asteroid." : "Galaxy."}</h1>
              <p>{tier === "particles" ? "Explore the pieces. Make something yours." : "This stage is coming soon."}</p>
            </div>
          </div>
          {tier !== "particles" ? <div className={styles.empty} role="status">
            <p>No {tier === "asteroid" ? "Asteroid" : "Galaxy"} components are available yet.</p>
            <Link href={`/#stage-${tier}`}>Explore the {tier === "asteroid" ? "Asteroid" : "Galaxy"} stage <ArrowRight size={16} aria-hidden="true" /></Link>
          </div> : results.length > 0 ? (
            <ul className={styles.grid} aria-label="Available components">
              {results.map(item => <DirectoryCard key={item.slug} slug={item.slug} title={item.title} />)}
            </ul>
          ) : (
            <div className={styles.empty} role="status">
              <p>No components match “{query.trim()}”.</p>
              <button type="button" onClick={() => setQuery("")}>Clear search <X size={15} aria-hidden="true" /></button>
            </div>
          )}
        </main>
      </div>
      <footer className={styles.footer}><span>Editable React components. Yours to build with.</span><Link href="/license">MIT licensed</Link></footer>
    </div>
  );
}
