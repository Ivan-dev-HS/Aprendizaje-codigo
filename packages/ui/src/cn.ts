import clsx, { type ClassValue } from "clsx";

/** Combina clases condicionales de Tailwind de forma segura. */
export function cn(...inputs: ClassValue[]): string {
  return clsx(inputs);
}
