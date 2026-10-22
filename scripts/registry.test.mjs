import assert from "node:assert/strict"
import { execFileSync } from "node:child_process"
import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs"
import os from "node:os"
import path from "node:path"
import test, { afterEach, beforeEach } from "node:test"
import { buildRegistry, configureRegistry, validateRegistry } from "./registry.mjs"
import { resolveRegistryOrigin } from "../src/site/catalog/registry-origin.ts"

const projectRoot = process.cwd()
const inheritedEnvironment = {
  REGISTRY_ORIGIN: process.env.REGISTRY_ORIGIN,
  VERCEL_ENV: process.env.VERCEL_ENV,
}
beforeEach(() => {
  delete process.env.REGISTRY_ORIGIN
  delete process.env.VERCEL_ENV
})
afterEach(() => {
  for (const [key, value] of Object.entries(inheritedEnvironment)) {
    if (value === undefined) delete process.env[key]
    else process.env[key] = value
  }
})

test("environment origin resolves local defaults and requires public Vercel production configuration", () => {
  assert.equal(resolveRegistryOrigin("http://localhost:3000", {}), "http://localhost:3000")
  assert.equal(resolveRegistryOrigin("http://localhost:3000", { REGISTRY_ORIGIN: " " }), "http://localhost:3000")
  assert.equal(resolveRegistryOrigin("http://localhost:3000", { REGISTRY_ORIGIN: "https://asteroidui.example.test/", VERCEL_ENV: "production" }), "https://asteroidui.example.test")
  assert.throws(() => resolveRegistryOrigin("https://previous.example.test", { VERCEL_ENV: "production" }), /Set REGISTRY_ORIGIN/)
  assert.throws(() => resolveRegistryOrigin("http://localhost:3000", { REGISTRY_ORIGIN: "http://localhost:3000", VERCEL_ENV: "production" }), /public HTTPS origin/)
})

test("environment origin builds /registry payloads without changing maintained metadata", () => {
  const { root, registry } = fixture()
  registry.items[0].registryDependencies.push("https://ui.shadcn.com/r/accordion.json")
  writeFileSync(path.join(root, "registry.json"), JSON.stringify(registry))
  const original = readFileSync(path.join(root, "registry.json"))
  const previous = process.env.REGISTRY_ORIGIN
  process.env.REGISTRY_ORIGIN = "https://asteroidui.example.test/"
  try {
    buildRegistry(root)
    const catalog = JSON.parse(readFileSync(path.join(root, "public", "registry", "registry.json"), "utf8"))
    const button = JSON.parse(readFileSync(path.join(root, "public", "registry", "button.json"), "utf8"))
    assert.equal(catalog.homepage, "https://asteroidui.example.test")
    assert.ok(button.registryDependencies.includes("https://asteroidui.example.test/registry/spinner.json"))
    assert.ok(button.registryDependencies.includes("https://ui.shadcn.com/r/accordion.json"))
    assert.deepEqual(readFileSync(path.join(root, "registry.json")), original)
    assert.doesNotThrow(() => validateRegistry(root))
  } finally {
    if (previous === undefined) delete process.env.REGISTRY_ORIGIN
    else process.env.REGISTRY_ORIGIN = previous
    assert.ok(root.startsWith(path.join(os.tmpdir(), "component-registry-")))
    rmSync(root, { recursive: true, force: true })
  }
})

test("invalid environment origins leave generated artifacts unchanged", () => {
  const { root, output } = fixture()
  const original = readFileSync(path.join(output, "button.json"))
  const previous = process.env.REGISTRY_ORIGIN
  try {
    for (const value of ["not a URL", "http://public.example", "https://user:pass@example.test", "https://example.test/path", "https://example.test?x=1"]) {
      process.env.REGISTRY_ORIGIN = value
      assert.throws(() => buildRegistry(root))
      assert.deepEqual(readFileSync(path.join(output, "button.json")), original)
    }
  } finally {
    if (previous === undefined) delete process.env.REGISTRY_ORIGIN
    else process.env.REGISTRY_ORIGIN = previous
    assert.ok(root.startsWith(path.join(os.tmpdir(), "component-registry-")))
    rmSync(root, { recursive: true, force: true })
  }
})

function fixture() {
  const root = mkdtempSync(path.join(os.tmpdir(), "component-registry-"))
  const registry = JSON.parse(readFileSync(path.join(projectRoot, "registry.json"), "utf8"))
  writeFileSync(path.join(root, "registry.json"), JSON.stringify(registry, null, 2))
  for (const item of registry.items) {
    for (const file of item.files) {
      const source = path.join(projectRoot, file.path)
      const destination = path.join(root, file.path)
      mkdirSync(path.dirname(destination), { recursive: true })
      cpSync(source, destination, { recursive: true })
    }
  }
  const output = path.join(root, "public", "registry")
  execFileSync(process.execPath, [
    path.join(projectRoot, "node_modules", "shadcn", "dist", "index.js"),
    "build", "registry.json", "--output", output, "--cwd", root,
  ], { cwd: root, stdio: "ignore" })
  return { root, output, registry }
}

function rebuild(root, output) {
  execFileSync(process.execPath, [
    path.join(projectRoot, "node_modules", "shadcn", "dist", "index.js"),
    "build", "registry.json", "--output", output, "--cwd", root,
  ], { cwd: root, stdio: "ignore" })
}

test("configures the registry origin and moves only same-origin dependencies", () => {
  const root = mkdtempSync(path.join(os.tmpdir(), "registry-origin-"))
  const registry = JSON.parse(readFileSync(path.join(projectRoot, "registry.json"), "utf8"))
  registry.items[0].registryDependencies.push("https://ui.shadcn.com/r/accordion.json")
  writeFileSync(path.join(root, "registry.json"), JSON.stringify(registry, null, 2))
  try {
    configureRegistry("https://asteroid.example", root)
    const configured = JSON.parse(readFileSync(path.join(root, "registry.json"), "utf8"))
    assert.equal(configured.homepage, "https://asteroid.example")
    assert.ok(configured.items[0].registryDependencies.includes("https://asteroid.example/registry/spinner.json"))
    assert.ok(configured.items[0].registryDependencies.includes("https://ui.shadcn.com/r/accordion.json"))
    assert.ok(configured.items.every((item) => (item.registryDependencies ?? []).every((dependency) =>
      !dependency.startsWith("http://localhost:3000/"),
    )))
  } finally {
    rmSync(root, { recursive: true, force: true })
  }
})

test("rejects invalid registry origins without changing metadata", () => {
  const root = mkdtempSync(path.join(os.tmpdir(), "registry-origin-"))
  const original = readFileSync(path.join(projectRoot, "registry.json"))
  writeFileSync(path.join(root, "registry.json"), original)
  try {
    for (const origin of [undefined, "not a URL", "http://example.com", "https://user:pass@example.com", "https://example.com/path", "https://example.com?x=1", "https://example.com#hash", "https://[::1]"]) {
      assert.throws(() => configureRegistry(origin, root))
      assert.deepEqual(readFileSync(path.join(root, "registry.json")), original)
    }
    assert.doesNotThrow(() => configureRegistry("http://localhost:3000", root))
  } finally {
    rmSync(root, { recursive: true, force: true })
  }
})

test("production registry builds reject loopback origins before changing output", () => {
  const root = mkdtempSync(path.join(os.tmpdir(), "registry-production-"))
  const registry = JSON.parse(readFileSync(path.join(projectRoot, "registry.json"), "utf8"))
  registry.homepage = "http://localhost:3000"
  writeFileSync(path.join(root, "registry.json"), JSON.stringify(registry, null, 2))
  for (const item of registry.items) {
    for (const file of item.files) {
      const source = path.join(projectRoot, file.path)
      const destination = path.join(root, file.path)
      mkdirSync(path.dirname(destination), { recursive: true })
      cpSync(source, destination, { recursive: true })
    }
  }
  const output = path.join(root, "public", "registry")
  mkdirSync(output, { recursive: true })
  writeFileSync(path.join(output, "keep.json"), "unchanged")
  const previous = process.env.VERCEL_ENV
  process.env.VERCEL_ENV = "production"
  try {
    assert.throws(() => buildRegistry(root), /REGISTRY_ORIGIN.*public HTTPS origin/i)
    assert.deepEqual(readdirSync(output), ["keep.json"])
    assert.equal(readFileSync(path.join(output, "keep.json"), "utf8"), "unchanged")
  } finally {
    if (previous === undefined) delete process.env.VERCEL_ENV
    else process.env.VERCEL_ENV = previous
    rmSync(root, { recursive: true, force: true })
  }
})

test("preview and local registry builds allow loopback origins", () => {
  const { root, output, registry } = fixture()
  const previous = process.env.VERCEL_ENV
  const currentOrigin = new URL(registry.homepage).origin
  registry.homepage = "http://localhost:3000"
  for (const item of registry.items) {
    item.registryDependencies = item.registryDependencies?.map((dependency) =>
      dependency.replace(currentOrigin, registry.homepage),
    )
  }
  writeFileSync(path.join(root, "registry.json"), JSON.stringify(registry, null, 2))
  try {
    for (const environment of ["preview", "local"]) {
      process.env.VERCEL_ENV = environment
      assert.doesNotThrow(() => buildRegistry(root))
      assert.ok(existsSync(path.join(output, "registry.json")))
    }
  } finally {
    if (previous === undefined) delete process.env.VERCEL_ENV
    else process.env.VERCEL_ENV = previous
    rmSync(root, { recursive: true, force: true })
  }
})

test("rejects registry items whose maintained source file is missing", () => {
  const { root, registry } = fixture()
  registry.items[0].files[0].path = "src/missing.tsx"
  writeFileSync(path.join(root, "registry.json"), JSON.stringify(registry))
  try {
    assert.throws(() => validateRegistry(root), /missing.*src\/missing\.tsx/i)
  } finally {
    rmSync(root, { recursive: true, force: true })
  }
})

test("rejects local registry dependencies that do not resolve to declared items", () => {
  const { root, registry } = fixture()
  registry.items[0].registryDependencies.push("http://localhost:3000/registry/not-declared.json")
  writeFileSync(path.join(root, "registry.json"), JSON.stringify(registry))
  try {
    assert.throws(() => validateRegistry(root), /unresolved.*not-declared/i)
  } finally {
    rmSync(root, { recursive: true, force: true })
  }
})

test("validates owned dependency URLs against registry homepage origin", () => {
  const { root, output, registry } = fixture()
  registry.homepage = "https://components.example.test"
  for (const item of registry.items) {
    item.registryDependencies = item.registryDependencies?.map((dependency) =>
      dependency.replace("http://localhost:3000", registry.homepage),
    )
  }
  writeFileSync(path.join(root, "registry.json"), JSON.stringify(registry))
  rebuild(root, output)
  try {
    assert.doesNotThrow(() => validateRegistry(root))
  } finally {
    rmSync(root, { recursive: true, force: true })
  }
})

test("rejects malformed owned dependency URLs", () => {
  const { root, registry } = fixture()
  registry.items[0].registryDependencies[0] = "http://localhost:3000/registry/spinner"
  writeFileSync(path.join(root, "registry.json"), JSON.stringify(registry))
  try {
    assert.throws(() => validateRegistry(root), /malformed.*local registry dependency/i)
  } finally {
    rmSync(root, { recursive: true, force: true })
  }
})

test("rejects an unresolved dependency at a non-local owned origin", () => {
  const { root, output, registry } = fixture()
  registry.homepage = "https://components.example.test"
  registry.items[0].registryDependencies[0] = "https://components.example.test/registry/not-declared.json"
  writeFileSync(path.join(root, "registry.json"), JSON.stringify(registry))
  rebuild(root, output)
  try {
    assert.throws(() => validateRegistry(root), /unresolved.*not-declared/i)
  } finally {
    rmSync(root, { recursive: true, force: true })
  }
})

test("preserves external registry dependencies", () => {
  const { root, output, registry } = fixture()
  registry.items[0].registryDependencies.push("https://ui.shadcn.com/r/accordion.json")
  writeFileSync(path.join(root, "registry.json"), JSON.stringify(registry))
  rebuild(root, output)
  try {
    assert.doesNotThrow(() => validateRegistry(root))
  } finally {
    rmSync(root, { recursive: true, force: true })
  }
})

test("rejects an invalid official registry item type", () => {
  const { root, registry } = fixture()
  registry.items[0].type = "registry:made-up"
  writeFileSync(path.join(root, "registry.json"), JSON.stringify(registry))
  try {
    assert.throws(() => validateRegistry(root), /pinned shadcn schema.*type/i)
  } finally {
    rmSync(root, { recursive: true, force: true })
  }
})

test("rejects generated payload content that is stale relative to maintained source", () => {
  const { root, output } = fixture()
  const itemPath = path.join(output, "button.json")
  const item = JSON.parse(readFileSync(itemPath, "utf8"))
  item.files[0].content = "old source"
  writeFileSync(itemPath, JSON.stringify(item, null, 2))
  try {
    assert.throws(() => validateRegistry(root), /button.*stale/i)
  } finally {
    rmSync(root, { recursive: true, force: true })
  }
})

test("accepts fresh official CLI output and the required dependency edges", () => {
  const { root, registry } = fixture()
  try {
    assert.doesNotThrow(() => validateRegistry(root))
    const items = Object.fromEntries(registry.items.map((item) => [item.name, item]))
    assert.deepEqual(items.spinner.registryDependencies, [
      "http://localhost:3000/registry/utils.json",
      "http://localhost:3000/registry/library-styles.json",
    ])
    assert.ok(items.button.registryDependencies.includes("http://localhost:3000/registry/spinner.json"))
    assert.ok(existsSync(path.join(root, "public", "registry", "registry.json")))
  } finally {
    rmSync(root, { recursive: true, force: true })
  }
})
