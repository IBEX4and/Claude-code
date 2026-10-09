import { content } from "@/content";

export type ServiceItem = (typeof content.services.categories)[number]["items"][number];

export function findService(id: string): ServiceItem | undefined {
  for (const category of content.services.categories) {
    const item = category.items.find((s) => s.id === id);
    if (item) return item;
  }
  return undefined;
}
