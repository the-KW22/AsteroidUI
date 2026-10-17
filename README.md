# AsteroidUI

A React and TypeScript component collection with a documentation-style catalog. All nine selected basics have local detail pages, live examples and a shadcn-compatible registry, with independent Next.js and Vite consumer verification. Catalog navigation and Getting Started pages are complete locally; public distribution and release remain later work.

## Development

Use Node.js 24.15.0 and npm 11.12.1 as the current baseline. Exact dependencies are pinned in `package.json` and `package-lock.json`.

```sh
npm ci
npm run dev
```

The local catalog is served at <http://localhost:3000>.

Copy [.env.example](.env.example) to `.env.local` to customize the registry origin. Both the catalog and registry scripts read this value:

```dotenv
REGISTRY_ORIGIN=http://localhost:3000
```

Local development falls back to the maintained localhost origin when the value is unset or blank. `npm run dev` regenerates the registry before starting Next.js. Restart development after changing the value; rebuild production output after a change. `.env.local` is ignored by Git.

Open `/components` to browse all nine components and their preview, examples, copyable usage/install instructions and maintained source. Open `/getting-started` for Next.js, Vite and shared-theme setup, or `/examples/collection` for the all-nine form composition. This registry currently uses local development addresses.

## Install source locally

Prepare a React/TypeScript application using the Next.js or Vite Getting Started guide, then keep this catalog running while installing:

```sh
npx shadcn@4.21.4 add http://localhost:3000/registry/button.json
```

The registry installs maintained component source, dependencies, shared styles and third-party notices. Import the installed `library.css` after Tailwind in the consuming application's global stylesheet. The consuming application owns appearance and custom-font loading. All nine selected basics have individual `/registry/<slug>.json` items; `utils` and `library-styles` are shared installation dependencies.

Source repository: [the-KW22/AsteroidUI](https://github.com/the-KW22/AsteroidUI). AsteroidUI uses the [MIT license](LICENSE), copyright 2026 Leow Kai Wen, with retained [third-party notices](THIRD_PARTY_NOTICES.md). Each component installation includes both license files through its shared dependency graph.

## Public address and Vercel

Vercel is the selected host. Set `REGISTRY_ORIGIN` to your actual public HTTPS origin in the Vercel project's Production environment settings, then deploy/redeploy. A Vercel production build rejects a missing or local origin. No `NEXT_PUBLIC_` prefix is needed: catalog commands are rendered on the server.

The registry scripts use Next.js's environment loader, including `.env.local`, while values supplied by Vercel take precedence. The build generates `/registry/` homepage/dependency URLs and catalog commands from the same resolved origin without rewriting maintained `registry.json`. You do not need to run `registry:configure` or commit a domain into source metadata.

In Vercel, use the repository root, Next.js framework preset, Node.js 24.x, install command `npm ci`, and build command `npm run build`. Keep the standard Next.js output settings. Public deployment and hosted installation checks remain pending.
