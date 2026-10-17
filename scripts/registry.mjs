import { execFileSync } from "node:child_process"
import { randomUUID } from "node:crypto"
import { existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, unlinkSync, writeFileSync } from "node:fs"
import os from "node:os"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { registryItemSchema, registrySchema } from "shadcn/schema"
import nextEnv from "@next/env"
import { resolveRegistryOrigin, validateRegistryOrigin } from "../src/catalog/registry-origin.ts"

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const cliPath = path.join(projectRoot, "node_modules", "shadcn", "dist", "index.js")

function readJson(filePath, label) {
  try {
    return JSON.parse(readFileSync(filePath, "utf8"))
  } catch (error) {
    throw new Error(`Cannot read ${label} at ${filePath}: ${error.message}`)
  }
}

function setRegistryOrigin(registry, nextOrigin) {
  const currentOrigin = new URL(registry.homepage).origin
  registry.homepage = nextOrigin
  for (const item of registry.items) {
    item.registryDependencies = item.registryDependencies?.map((dependency) => {
      try {
        const address = new URL(dependency)
        return address.origin === currentOrigin ? `${nextOrigin}${address.pathname}${address.search}${address.hash}` : dependency
      } catch {
        return dependency
      }
    })
  }
}

export function configureRegistry(origin, root = projectRoot) {
  const nextOrigin = validateRegistryOrigin(origin)
  const metadataPath = path.join(path.resolve(root), "registry.json")
  const registry = readJson(metadataPath, "registry metadata")
  setRegistryOrigin(registry, nextOrigin)
  writeFileSync(metadataPath, `${JSON.stringify(registry, null, 2)}\n`)
}

function schemaError(schema, data, label) {
  const result = schema.safeParse(data)
  if (result.success) return
  const details = result.error.issues
    .map((issue) => `${issue.path.join(".") || "<root>"}: ${issue.message}`)
    .join("; ")
  throw new Error(`${label} does not match the pinned shadcn schema: ${details}`)
}

function cliBuild(root, output, registry) {
  const manifest = path.join(root, `.registry-build-${randomUUID()}.json`)
  const maintained = readFileSync(path.join(root, "registry.json"), "utf8")
  writeFileSync(manifest, JSON.stringify(JSON.parse(maintained)) === JSON.stringify(registry)
    ? maintained : `${JSON.stringify(registry, null, 2)}\n`)
  try {
    execFileSync(process.execPath, [cliPath, "build", manifest, "--output", output, "--cwd", root], {
      cwd: root,
      stdio: "pipe",
    })
  } finally {
    unlinkSync(manifest)
  }
}

function validateMetadata(root, registry) {
  const names = new Set(registry.items.map((item) => item.name))
  const homepage = new URL(registry.homepage)
  if (names.size !== registry.items.length) throw new Error("Registry item names must be unique.")

  for (const item of registry.items) {
    for (const dependency of item.registryDependencies ?? []) {
      if (names.has(dependency)) {
        throw new Error(`Item "${item.name}" must use a fully qualified local URL for registry dependency "${dependency}".`)
      }
      let address
      try {
        address = new URL(dependency)
      } catch {
        if (dependency.startsWith(`${homepage.origin}/registry/`)) {
          throw new Error(`Item "${item.name}" has a malformed local registry dependency "${dependency}".`)
        }
        continue
      }
      if (address.origin !== homepage.origin) continue
      const match = address.pathname.match(/^\/registry\/([a-z0-9-]+)\.json$/)
      if (!match || address.search || address.hash) {
        throw new Error(`Item "${item.name}" has a malformed local registry dependency "${dependency}".`)
      }
      if (!names.has(match[1])) {
        throw new Error(`Item "${item.name}" has an unresolved local registry dependency "${dependency}".`)
      }
    }

    for (const file of item.files) {
      const sourcePath = path.resolve(root, file.path)
      if (!sourcePath.startsWith(`${root}${path.sep}`) || !existsSync(sourcePath)) {
        throw new Error(`Item "${item.name}" references missing or out-of-root source file "${file.path}".`)
      }
    }
  }
}

function compareJsonDirectories(expectedDir, actualDir) {
  const expectedFiles = readdirSync(expectedDir).filter((file) => file.endsWith(".json")).sort()
  const actualFiles = existsSync(actualDir)
    ? readdirSync(actualDir).filter((file) => file.endsWith(".json")).sort()
    : []
  if (JSON.stringify(expectedFiles) !== JSON.stringify(actualFiles)) {
    throw new Error(`Generated registry files are stale. Expected ${expectedFiles.join(", ")}; found ${actualFiles.join(", ") || "none"}. Run npm run registry:build.`)
  }

  for (const file of expectedFiles) {
    const expectedPath = path.join(expectedDir, file)
    const actualPath = path.join(actualDir, file)
    const expected = readJson(expectedPath, "fresh CLI output")
    const actual = readJson(actualPath, "generated output")
    schemaError(file === "registry.json" ? registrySchema : registryItemSchema, actual, actualPath)
    if (JSON.stringify(expected) !== JSON.stringify(actual)) {
      const name = path.basename(file, ".json")
      throw new Error(`Generated item "${name}" is stale relative to maintained source. Run npm run registry:build.`)
    }
  }
}

export function validateRegistry(root = projectRoot) {
  root = path.resolve(root)
  const metadataPath = path.join(root, "registry.json")
  const registry = readJson(metadataPath, "registry metadata")
  schemaError(registrySchema, registry, metadataPath)
  setRegistryOrigin(registry, resolveRegistryOrigin(registry.homepage))
  validateMetadata(root, registry)

  const tempRoot = mkdtempSync(path.join(os.tmpdir(), "registry-validation-"))
  try {
    const freshOutput = path.join(tempRoot, "registry")
    cliBuild(root, freshOutput, registry)
    compareJsonDirectories(freshOutput, path.join(root, "public", "registry"))
  } finally {
    rmSync(tempRoot, { recursive: true, force: true })
  }
}

export function buildRegistry(root = projectRoot) {
  root = path.resolve(root)
  const metadataPath = path.join(root, "registry.json")
  const registry = readJson(metadataPath, "registry metadata")
  schemaError(registrySchema, registry, metadataPath)
  setRegistryOrigin(registry, resolveRegistryOrigin(registry.homepage))
  validateMetadata(root, registry)
  const output = path.join(root, "public", "registry")
  mkdirSync(output, { recursive: true })
  cliBuild(root, output, registry)
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    nextEnv.loadEnvConfig(projectRoot, process.argv[2] === "dev")
    if (process.argv[2] === "configure") {
      configureRegistry(process.argv[3])
    } else if (["build", "dev"].includes(process.argv[2])) {
      buildRegistry()
    } else {
      validateRegistry()
      process.stdout.write("Registry metadata and generated output are valid and current.\n")
    }
  } catch (error) {
    process.stderr.write(`${error.message}\n`)
    process.exitCode = 1
  }
}
