// Espacio 01 — Pagos a Proveedores.
//
// Este archivo ya no contiene datos: solo instancia el motor P2P con el pack de
// industria activo. Todo el vocabulario vive en src/packs/, toda la lógica de
// generación y detección vive en src/engine/p2p.ts.

import { generarP2P } from "../engine/p2p";
import { getPackActivo } from "../packs";

export type { Proveedor, OrdenCompra, Factura, Empleado } from "../engine/p2p";

const dataset = generarP2P(getPackActivo());

export const empleados = dataset.empleados;
export const proveedores = dataset.proveedores;
export const ordenesCompra = dataset.ordenesCompra;
export const facturas = dataset.facturas;
export const buildPagosContext = dataset.buildPagosContext;
