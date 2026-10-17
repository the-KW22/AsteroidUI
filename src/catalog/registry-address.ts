import registry from "../../registry.json";
import { isLoopbackOrigin, resolveRegistryOrigin } from "./registry-origin";

export { isLoopbackOrigin } from "./registry-origin";

export const registryOrigin = resolveRegistryOrigin(registry.homepage);
export const isLocalRegistry = isLoopbackOrigin(registryOrigin);

export function installCommand(slug: string) {
  return `npx shadcn@4.21.4 add ${registryOrigin}/r/${slug}.json`;
}
