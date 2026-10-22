import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Galaxy } from "./galaxy";
import { TryParticles } from "./try-particles";
import { LandingStory } from "./landing-story";
import styles from "./landing.module.css";

function Brand() {
  return <span className={styles.brand}><svg viewBox="0 0 108 104" aria-hidden="true" fill="currentColor"><path d="M45 7 Q47 5 50 6 L78 17 Q81 18 82 21 L87 38 Q88 41 85 44 L66 62 Q63 65 61 61 L56 48 Q55 45 52 44 L25 37 Q21 36 24 32 Z"/><path d="M14 46 Q15 43 18 43 L43 44 Q46 44 47 47 L59 79 Q60 82 57 84 L31 94 Q28 95 26 93 L5 71 Q3 69 5 65 Z"/><path d="M88 48 Q90 46 92 49 L101 72 Q102 74 100 77 L85 95 Q83 97 80 96 L70 93 Q68 92 67 89 L62 72 Q61 69 64 66 Z"/></svg><span>Asteroid<span className={styles.brandSuffix}>UI</span></span></span>;
}

export function DesktopOpening() {
  return (
    <div className={styles.desktop} data-desktop-landing>
      <div className={styles.journey} data-landing-journey>
        <Galaxy />
        <main id="landing-content" tabIndex={-1} className={styles.main}>
          <section className={styles.hero} aria-labelledby="landing-title">
            <div className={styles.copy}>
              <h1 id="landing-title">Small pieces.<br />Complete interfaces.</h1>
              <p className={styles.description}>AsteroidUI is a free React component library. Preview the pieces, add the source to your project, and build on them.</p>
              <Link className={styles.primary} href="/components">Explore components <ArrowUpRight size={18} aria-hidden="true" /></Link>
            </div>
          </section>
          <TryParticles />
          <LandingStory />
        </main>
      </div>
      <footer className={styles.footer}>
        <Brand />
        <div className={styles.footerLinks}>
          <p>Small pieces. Yours to build with.</p>
          <nav aria-label="Footer navigation"><Link href="/license">MIT License</Link><a href="https://github.com/the-KW22/AsteroidUI">GitHub</a><a href="#landing-content">Back to top <ArrowUpRight size={14} aria-hidden="true" /></a></nav>
        </div>
      </footer>
    </div>
  );
}
