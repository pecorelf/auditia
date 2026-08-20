// Registro de Industry Packs.
//
// Para agregar una industria: importar el pack y sumarlo a PACKS. Nada más.
// El Admin lee esta lista para poblar el selector.

import type { IndustryPack } from "./types";
import { maritimo } from "./maritimo";
import { medios } from "./medios";
import { afp } from "./afp";
import { mineria } from "./mineria";
import { banca } from "./banca";
import { retail } from "./retail";
import { energia } from "./energia";

export type { IndustryPack } from "./types";

export const PACKS: IndustryPack[] = [afp, banca, energia, mineria, retail, maritimo, medios];

export const PACK_POR_DEFECTO = "maritimo";

const STORAGE_KEY = "auditia.packActivo";

export const getPackId = (): string => {
  try {
    return localStorage.getItem(STORAGE_KEY) || PACK_POR_DEFECTO;
  } catch {
    return PACK_POR_DEFECTO;
  }
};

export const setPackId = (id: string) => {
  try {
    localStorage.setItem(STORAGE_KEY, id);
  } catch {
    /* modo privado del navegador — se pierde al cerrar, no es crítico */
  }
};

export const getPack = (id?: string): IndustryPack => {
  const target = id || getPackId();
  return PACKS.find((p) => p.id === target) || PACKS[0];
};

// ─────────────────────────────────────────────────────────────────────
// Overrides del Admin: nombre de cliente y logo, sin tocar el pack.
// Permiten mostrar el mismo pack de industria con la marca del prospecto.
// ─────────────────────────────────────────────────────────────────────
export type Overrides = { cliente?: string; logoDataUrl?: string };

const OVR_KEY = "auditia.overrides";

export const getOverrides = (): Overrides => {
  try {
    return JSON.parse(localStorage.getItem(OVR_KEY) || "{}");
  } catch {
    return {};
  }
};

export const setOverrides = (o: Overrides) => {
  try {
    localStorage.setItem(OVR_KEY, JSON.stringify(o));
  } catch {
    /* sin persistencia disponible */
  }
};

/** El pack activo ya con los overrides del Admin aplicados. */
export const getPackActivo = (): IndustryPack => {
  const base = getPack();
  const ovr = getOverrides();
  if (!ovr.cliente && !ovr.logoDataUrl) return base;
  return {
    ...base,
    cliente: ovr.cliente || base.cliente,
    logoPath: ovr.logoDataUrl || base.logoPath,
  };
};
