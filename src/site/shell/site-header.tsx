"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { useTheme } from "next-themes";
import { Menu, Monitor, Moon, Sun, X } from "lucide-react";
import styles from "./site-header.module.css";

const subscribe = () => () => {};
const destinations = [
  { href: "/", label: "Home" },
  { href: "/getting-started", label: "Docs" },
  { href: "/components", label: "Components" },
];
const appearances = [
  { value: "light", label: "Light", Icon: Sun },
  { value: "dark", label: "Dark", Icon: Moon },
  { value: "system", label: "Default", Icon: Monitor },
];

export function SiteHeader() {
  const pathname = usePathname();
  const [navigation, setNavigation] = useState({ path: pathname, open: false });
  const [scrolled, setScrolled] = useState(false);
  const open = navigation.path === pathname && navigation.open;
  if (navigation.path !== pathname) setNavigation({ path: pathname, open: false });
  const closeMenu = () => setNavigation({ path: pathname, open: false });
  const trigger = useRef<HTMLButtonElement>(null);
  const { theme, setTheme } = useTheme();
  const mounted = useSyncExternalStore(subscribe, () => true, () => false);

  useEffect(() => {
    const updateScroll = () => setScrolled(window.scrollY > 16);
    updateScroll();
    window.addEventListener("scroll", updateScroll, { passive: true });
    return () => window.removeEventListener("scroll", updateScroll);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    function handleKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setNavigation({ path: pathname, open: false });
        trigger.current?.focus();
      }
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open, pathname]);

  return (
    <header className={styles.header} data-site-header data-home={pathname === "/"} data-space={pathname !== "/"} data-scrolled={scrolled}>
      <a className={styles.skip} href="#main-content" onClick={event => {
        const main = Array.from(document.querySelectorAll("main")).find(element => element.getClientRects().length > 0);
        if (!main) return;
        event.preventDefault();
        closeMenu();
        requestAnimationFrame(() => {
          main.tabIndex = -1;
          main.focus();
          main.scrollIntoView({ block: "start" });
        });
      }}>Skip to content</a>
      <div className={styles.inner}>
        <Link className={styles.brand} href="/" aria-label="AsteroidUI home" onClick={closeMenu}>
          <svg viewBox="0 0 108 104" aria-hidden="true" fill="currentColor"><path d="M45 7 Q47 5 50 6 L78 17 Q81 18 82 21 L87 38 Q88 41 85 44 L66 62 Q63 65 61 61 L56 48 Q55 45 52 44 L25 37 Q21 36 24 32 Z"/><path d="M14 46 Q15 43 18 43 L43 44 Q46 44 47 47 L59 79 Q60 82 57 84 L31 94 Q28 95 26 93 L5 71 Q3 69 5 65 Z"/><path d="M88 48 Q90 46 92 49 L101 72 Q102 74 100 77 L85 95 Q83 97 80 96 L70 93 Q68 92 67 89 L62 72 Q61 69 64 66 Z"/></svg>
          <span>Asteroid<span className={styles.suffix}>UI</span></span>
        </Link>
        <button className={styles.menu} ref={trigger} type="button" aria-label={open ? "Close navigation" : "Open navigation"} aria-expanded={open} aria-controls="site-navigation" onClick={() => setNavigation({ path: pathname, open: !open })}>
          {open ? <X size={20} aria-hidden="true" /> : <Menu size={20} aria-hidden="true" />}
        </button>
        <div className={styles.utilities}>
          <a className={styles.github} href="https://github.com/the-KW22/AsteroidUI" aria-label="GitHub" title="GitHub"><svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 .9a11.1 11.1 0 0 0-3.51 21.63c.55.1.76-.24.76-.54v-2.07c-3.09.67-3.74-1.31-3.74-1.31-.51-1.28-1.24-1.62-1.24-1.62-1.01-.69.08-.68.08-.68 1.12.08 1.7 1.15 1.7 1.15.99 1.7 2.6 1.21 3.23.93.1-.72.39-1.21.71-1.49-2.46-.28-5.05-1.23-5.05-5.47 0-1.21.43-2.2 1.15-2.98-.12-.28-.5-1.41.11-2.94 0 0 .93-.3 3.05 1.14a10.64 10.64 0 0 1 5.55 0c2.12-1.44 3.05-1.14 3.05-1.14.61 1.53.23 2.66.11 2.94.72.78 1.15 1.77 1.15 2.98 0 4.25-2.6 5.19-5.07 5.46.4.35.75 1.02.75 2.06v3.04c0 .3.2.65.76.54A11.1 11.1 0 0 0 12 .9Z"/></svg></a>
          <div className={styles.appearance} role="group" aria-label="Appearance">
            {appearances.map(({ value, label, Icon }) => <button key={value} type="button" aria-label={label === "Default" ? "Default (follow system)" : label} title={label === "Default" ? "Default (follow system)" : label} aria-pressed={mounted && theme === value} disabled={!mounted} onClick={() => setTheme(value)}><Icon size={18} aria-hidden="true" /></button>)}
          </div>
        </div>
        <nav id="site-navigation" className={styles.navigation} data-open={open} aria-label="Main navigation">
          {destinations.map(({ href, label }) => {
            const current = href === "/" ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);
            return <Link key={href} href={href} aria-current={current ? pathname === href ? "page" : "true" : undefined} onClick={closeMenu}>{label}</Link>;
          })}
        </nav>
      </div>
    </header>
  );
}
