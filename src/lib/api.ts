import "server-only";
import { z } from "zod";
import { locales } from "@/i18n/routing";

export const zLocale = z.enum(locales);
export const zEmail = z.string().trim().toLowerCase().email().max(254);
export const zOrderNumber = z.string().trim().toUpperCase().regex(/^AJ-\d{4,}$/);

export async function readJson(req: Request): Promise<unknown> {
  return req.json().catch(() => null);
}
