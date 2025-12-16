/**
 * Utilidades de almacenamiento offline usando IndexedDB vía Dexie.
 * Proporciona persistencia local para resultados de pruebas cuando la sincronización en línea no está disponible.
 * @module offline
 */

import Dexie from 'dexie';
import type { Result } from '@/types';

/**
 * Base de datos IndexedDB para ReactiVision usando Dexie.
 * Almacena resultados de pruebas localmente para funcionalidad offline.
 */
class ReactiVisionDB extends Dexie {
  /** Tabla para almacenar resultados de pruebas */
  results!: Dexie.Table<Result, number>;

  constructor() {
    super('ReactiVisionDB');
    this.version(1).stores({
      results: '++id, timestamp', // id autoincremental local
    });
  }
}

/** Instancia singleton de la base de datos local */
export const db = new ReactiVisionDB();

/**
 * Guarda un resultado de prueba localmente en IndexedDB.
 * Usado para almacenamiento offline antes de sincronizar con la base de datos remota.
 * @param result - Resultado de prueba a guardar (sin id)
 * @returns Promesa que se resuelve con el id auto-generado local
 */
export async function saveLocal(result: Omit<Result, 'id'>): Promise<number> {
  return db.results.add(result as Result);
}

/**
 * Sincroniza un resultado almacenado localmente con la base de datos remota y lo elimina en caso de éxito.
 * TODO: Implementar llamadas reales de sincronización con Supabase.
 * @param localId - Id local del resultado a sincronizar
 */
export async function syncAndDelete(localId: number): Promise<void> {
  const res = await db.results.get(localId);
  if (!res) return;
  // TODO: llamar a tu insertTest / insertAttempts
  // await insertTest({...})
  await db.results.delete(localId);
}