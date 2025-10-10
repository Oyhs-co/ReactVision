import { getSupabase } from './client'
import type { Database } from './supabase.types'
import type { PostgrestError } from '@supabase/supabase-js'

type Tables = Database['public']['Tables']
type ReactionTest = Tables['reaction_tests']['Row']
type ReactionTestInsert = Tables['reaction_tests']['Insert']
type Attempt = Tables['attempts']['Row']
type AttemptInsert = Tables['attempts']['Insert']
type AiAnalysis = Tables['ai_analysis']['Row']
type AiAnalysisInsert = Tables['ai_analysis']['Insert']

export async function getTests(): Promise<(ReactionTest & { attempts: Attempt[] })[]> {
  const { data, error } = await getSupabase()
    .from('reaction_tests')
    .select('*, attempts(*)')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data as (ReactionTest & {
    attempts: Attempt[]
  })[]
}

export async function insertTest(test: ReactionTestInsert): Promise<ReactionTest & { attempts: Attempt[] }> {
  const { data, error } = await (getSupabase()
    .from('reaction_tests') as unknown as {
      insert: (values: ReactionTestInsert[]) => {
        select: (query: string) => { single: () => Promise<{ data: unknown; error: unknown }> }
      }
    })
    .insert ([{
      ...test,
      created_at: new Date().toISOString()
    }])
    .select('*, attempts(*)')
    .single()

  if (error) throw error
  return data as ReactionTest & { attempts: Attempt[] }
}

export async function saveAiAnalysis(analysisData: { 
  test_id: number; 
  analysis_text: string;
  processed_data: string;
}): Promise<AiAnalysis> {
  const { data, error } = await (getSupabase()
    .from('ai_analysis') as unknown as {
      insert: (values: AiAnalysisInsert[]) => { select: () => { single: () => Promise<{ data: unknown; error: unknown }> } }
    })
    .insert ([{
      test_id: analysisData.test_id,
      analysis_text: analysisData.analysis_text,
      processed_data: analysisData.processed_data,
      created_at: new Date().toISOString()
    }])
    .select()
    .single()

  if (error) throw error
  return data as AiAnalysis
}

export async function getAiAnalysis(testId: number): Promise<AiAnalysis | null> {
  const { data, error } = await getSupabase()
    .from('ai_analysis')
    .select('*')
    .eq('test_id', testId)
    .order('created_at', { ascending: false })
    .single()

  if (error && error.code !== 'PGRST116') throw error // PGRST116 es el código para "no se encontraron registros"
  return data ? (data as AiAnalysis) : null
}

export async function insertAttempts(attempts: AttemptInsert[]): Promise<Attempt[]> {
  const { data, error } = await (getSupabase()
    .from('attempts') as unknown as {
      insert: (values: AttemptInsert[]) => { select: () => Promise<{ data: unknown; error: unknown }> }
    })
    .insert ([...attempts])
    .select()

  if (error) throw error
  return data as Attempt[]
}

export async function deleteTest(testId: number) {
  const { error } = await getSupabase()
    .from('reaction_tests')
    .delete()
    .eq('id', testId)

  if (error) throw error
}

async function handleDatabaseError(err: unknown, context: string) {
  const message = (() => {
    if (typeof err === 'object' && err !== null && 'message' in err) {
      try {
        return String((err as { message?: unknown }).message ?? '')
      } catch {
        return ''
      }
    }
    try {
      return String(err)
    } catch {
      return ''
    }
  })()

  if (message.includes('JWT') || message.includes('auth')) {
    throw new Error('Error de autenticación. Por favor, recarga la página.');
  } else if (message.includes('network') || message.includes('Failed to fetch')) {
    throw new Error('Error de conexión. Por favor, verifica tu conexión a internet.');
  } else if (message.includes('permission') || message.includes('access')) {
    throw new Error('Error de permisos. No tienes autorización para realizar esta acción.');
  } else if (message.includes('Foreign key violation')) {
    throw new Error('Error de integridad referencial. Por favor, intenta nuevamente.');
  }
  
  console.error(`Error in ${context}:`, err);
  throw new Error(message || 'Error desconocido al eliminar los datos');
}

async function deleteTestData(test: { id: number }) {
  // Eliminar el análisis de IA si existe
  const { error: aiAnalysisError } = await getSupabase()
    .from('ai_analysis')
    .delete()
    .eq('test_id', test.id);

  if (aiAnalysisError) throw aiAnalysisError;

  // Eliminar los intentos asociados
  const { error: attemptsError } = await getSupabase()
    .from('attempts')
    .delete()
    .eq('test_id', test.id);

  if (attemptsError) throw attemptsError;

  // Eliminar el test
  const { error: testError } = await getSupabase()
    .from('reaction_tests')
    .delete()
    .eq('id', test.id);

  if (testError) throw testError;

  return true;
}

export async function deleteAllTests(adminKey?: string) {
  try {
    // Verificar la clave de administrador
    const expectedKey = process.env.NEXT_PUBLIC_ADMIN_KEY;
    if (!adminKey || adminKey !== expectedKey) {
      throw new Error('Clave de administrador inválida');
    }

    // Obtener todos los IDs de los tests
    const { data: tests, error: fetchError } = await getSupabase()
      .from('reaction_tests')
      .select('id') as { data: { id: number }[] | null, error: PostgrestError | null };

    if (fetchError) throw fetchError;

    if (!tests || tests.length === 0) {
      return { success: true, deletedCount: 0 };
    }

    // Eliminar datos para cada test
    for (const test of tests) {
      if (typeof test.id !== 'number') continue;
      try {
        await deleteTestData(test);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Error desconocido';
        throw new Error(`Error al eliminar datos del test ${test.id}: ${msg}`);
      }
    }

    // Reiniciar las secuencias de IDs
    try {
      // Reiniciar secuencia de reaction_tests
      await (getSupabase() as unknown as { rpc: (fn: string, args?: Record<string, unknown>) => Promise<unknown> }).rpc('reset_sequence', { table_name: 'reaction_tests' });
      // Reiniciar secuencia de attempts
      await (getSupabase() as unknown as { rpc: (fn: string, args?: Record<string, unknown>) => Promise<unknown> }).rpc('reset_sequence', { table_name: 'attempts' });
      // Reiniciar secuencia de ai_analysis
      await (getSupabase() as unknown as { rpc: (fn: string, args?: Record<string, unknown>) => Promise<unknown> }).rpc('reset_sequence', { table_name: 'ai_analysis' });

      console.log('Secuencias de IDs reiniciadas exitosamente');
    } catch (seqError: unknown) {
      console.error('Error al reiniciar secuencias:', seqError);
      // No lanzamos el error aquí porque los datos ya fueron eliminados
    }

    return { success: true, deletedCount: tests.length };
  } catch (error: unknown) {
    return handleDatabaseError(error, 'deleteAllTests');
  }
}