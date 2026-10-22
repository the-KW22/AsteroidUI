# Consumer installation verification

These independent Next.js App Router and Vite React projects contain all nine registry-installed basics and consumer-owned demos. Their versions follow the pinned root and fixture manifests.

Each project has its own exact-version manifest/lock, TypeScript configuration, Tailwind integration, and Base UI shadcn aliases. Neither imports root library source or shared repository paths. Installed `library.css` is imported after Tailwind, and the consuming application owns its body/theme settings and appearance controls. Intentional installed-source duplication preserves consumer isolation.

## Setup

From the repository root, install and run each fixture independently. The lockfiles are generated during the initial root-owned install; use `ci` for reproducible installs afterward:

```powershell
npm --prefix verification/next ci
npm --prefix verification/next run dev
```

The Next.js app runs at `http://localhost:3100`. Its available checks are `npm run typecheck` and `npm run build`; `npm run start` serves the production build on port 3100.

```powershell
npm --prefix verification/vite ci
npm --prefix verification/vite run dev
```

The Vite app runs at `http://localhost:3200`. Its available checks are `npm run typecheck`, `npm run build`, and `npm run preview` (port 3200).

Keep both independent lockfiles. After installation or source refresh, run each fixture's clean `npm ci`, type check, and production build, then run `npm run test:consumers` from the repository root. That suite starts/stops production servers on 3100 and 3200 and checks loading/focus/repeat activation, appearance, color/font/radius overrides, reduced-motion Spinner behavior, and narrow layout.

## Reproduce the local registry installation

Build the catalog/registry and serve it on port 3000 in another terminal. From each fixture directory, the pinned root-installed CLI is equivalent to `npx shadcn@4.21.4`:

```sh
node ../../node_modules/shadcn/dist/index.js add http://localhost:3000/registry/button.json --yes --overwrite
```

For a fresh Spinner-only installation use `/registry/spinner.json` before adding Button, so missing standalone dependencies cannot be masked by Button. P2 performed that order independently in both clean foundations. The CLI installs component, helper, stylesheet, and notice files into the configured alias targets; subsequent `--overwrite` refreshes use the served payload rather than manual copies. After refreshing, rebuild both fixtures before the shared browser checks.

Next.js imports `../components/ui/library.css` in `src/app/globals.css`; Vite imports `./components/ui/library.css` in `src/index.css`. Loading/status state, appearance switching, and customization controls live in each fixture's application code. Next interactive usage and calls to the client-exported `buttonVariants` helper require a client module.

P3 installed Input, Textarea, Label, Checkbox, Radio group, Select and Switch in one CLI batch; the exact command and final refresh are in P3 evidence. The consumer-owned `collection-example.tsx` exercises all nine controls together. If another server owns localhost's IPv6 address, run the CLI with `node --dns-result-order=ipv4first` while serving this registry on `127.0.0.1:3000`, as recorded in that evidence.
