import { readFile } from "node:fs/promises";
import path from "node:path";
import Link from "next/link";

export default async function LicensePage() {
  const license = await readFile(path.join(process.cwd(), "LICENSE"), "utf8");
  return (
    <main className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-5 py-10">
      <Link href="/" className="underline underline-offset-4">AsteroidUI</Link>
      <h1 className="text-3xl font-semibold">MIT License</h1>
      <p>AsteroidUI is free to use under the MIT license. Distributed source includes this license and required third-party notices.</p>
      <pre className="whitespace-pre-wrap break-words rounded-md border border-border p-5 text-sm">{license}</pre>
      <a href="https://github.com/the-KW22/AsteroidUI" className="underline underline-offset-4">Source on GitHub</a>
    </main>
  );
}
