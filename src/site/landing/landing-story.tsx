import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import styles from "./landing.module.css";
import { StoryTimeline } from "./story-timeline";

export function LandingStory() {
  return (
    <>
      <section id="tiers" className={styles.storySection} aria-labelledby="tiers-title">
        <div className={styles.storyIntro}>
          <h2 id="tiers-title" className={styles.storyTitle}>Small pieces.<br />A whole new world.</h2>
          <p className={styles.storyLead}>A story of things coming together.<br />From reusable controls to complete interfaces.</p>
        </div>
        <div className={styles.storyJourney} data-horizontal-journey>
          <span id="stage-particles" className={styles.storyAnchor} data-stage-anchor="particles" />
          <span id="stage-asteroid" className={styles.storyAnchor} data-stage-anchor="asteroid" />
          <span id="stage-galaxy" className={styles.storyAnchor} data-stage-anchor="galaxy" />
          <div className={styles.storySticky}>
            <StoryTimeline />
            <div className={styles.storyViewport}>
              <div className={styles.storyTrack} data-story-track>
        {[
          { name: "Particles", status: "Available now · 9 components", title: "Every interface starts somewhere.", description: "A button. A field. A choice. Individual React components you can install, edit and build with today.", detail: "Small pieces, ready for your next idea.", link: "/components", action: "Explore Particles" },
          { name: "Asteroid", status: "Coming soon · composed UI", title: "Give the pieces a shared purpose.", description: "Particles draw together into something with shape. In the library, that means reusable compositions: controls working together as forms and other useful blocks.", detail: "Concept preview · future collection" },
          { name: "Galaxy", status: "Coming soon · complete interfaces", title: "Let the system take shape.", description: "A whole world of connected possibilities. In the library, reusable compositions come together as complete interfaces, built on the Particles beneath them.", detail: "Concept preview · future collection" },
        ].map(({ name, status, title, description, detail, link, action }) => (
          <article className={styles.chapter} key={name} data-tier={name.toLowerCase()}>
            <div className={styles.chapterCopy} data-reading-surface>
              <h3>{name}</h3>
              <p className={styles.tierStatus}>{status}</p>
              <h4>{title}</h4>
              <p>{description}</p>
              <div className={styles.tierExample} aria-hidden="true">
                {name === "Particles" && <><span className={styles.exampleButton}>Button</span><span className={styles.exampleField}>Input</span><span className={styles.exampleSwitch}><i /></span></>}
                {name === "Asteroid" && <><span className={styles.exampleHeading}>Contact form</span><span className={styles.exampleField}>Email address</span><span className={styles.exampleButton}>Send message</span></>}
                {name === "Galaxy" && <><span className={styles.exampleHeading}>Workspace</span><span className={styles.exampleNav}>Overview <b>Projects</b> Settings</span><span className={styles.exampleWindow}><i /><i /><i /></span></>}
              </div>
              <p className={styles.chapterDetail}>{detail}</p>
              {link && <Link className={styles.textLink} href={link}>{action} <ArrowRight size={18} aria-hidden="true" /></Link>}
            </div>
          </article>
        ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="start-building" className={styles.startBuilding} aria-labelledby="start-building-title">
        <h2 id="start-building-title">Start building.</h2>
        <p>Choose your setup.<br />Bring the components into your project.</p>
        <div className={styles.frameworkLinks}>
          <Link href="/getting-started/nextjs"><span>Next.js</span><span>App Router setup <ArrowRight size={24} aria-hidden="true" /></span></Link>
          <Link href="/getting-started/vite"><span>Vite</span><span>React setup <ArrowRight size={24} aria-hidden="true" /></span></Link>
        </div>
        <div className={styles.startActions}>
          <Link className={styles.primary} href="/components">Explore the collection <ArrowRight size={18} aria-hidden="true" /></Link>
          <a href="https://github.com/the-KW22/AsteroidUI">View source on GitHub <ArrowUpRight size={18} aria-hidden="true" /></a>
        </div>
        <p className={styles.ownershipNote}>Free and open source. Editable React components. MIT licensed.</p>
      </section>
    </>
  );
}
