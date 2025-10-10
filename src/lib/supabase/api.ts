import { supabase } from './client'
import type { Database } from './supabase.types'

type Tables = Database['public']['Tables']
type ReactionTest = Tables['reaction_tests']['Row']
type ReactionTestInsert = Tables['reaction_tests']['Insert']
type Attempt = Tables['attempts']['Row']
type AttemptInsert = Tables['attempts']['Insert']

export async function getTests() {
  const { data, error } = await supabase
    .from('reaction_tests')
    .select('*, attempts(*)')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data as (ReactionTest & {
    attempts: Attempt[]
  })[]
}

export async function insertTest(test: ReactionTestInsert) {
  const { data, error } = await supabase
    .from('reaction_tests')
    .insert([{
      ...test,
      created_at: new Date().toISOString()
    }])
    .select('*, attempts(*)')
    .single()

  if (error) throw error
  return data
}

export async function saveAiAnalysis(analysisData: { 
  test_id: number; 
  analysis_text: string;
  processed_data: string;
}) {
  const { data, error } = await supabase
    .from('ai_analysis')
    .insert([{
      test_id: analysisData.test_id,
      analysis_text: analysisData.analysis_text,
      processed_data: analysisData.processed_data,
      created_at: new Date().toISOString()
    }])
    .select()
    .single()

  if (error) throw error
  return data
}

export async function getAiAnalysis(testId: number) {
  const { data, error } = await supabase
    .from('ai_analysis')
    .select('*')
    .eq('test_id', testId)
    .order('created_at', { ascending: false })
    .single()

  if (error && error.code !== 'PGRST116') throw error // PGRST116 es el código para "no se encontraron registros"
  return data
}

export async function insertAttempts(attempts: AttemptInsert[]) {
  const { data, error } = await supabase
    .from('attempts')
    .insert([...attempts])
    .select()

  if (error) throw error
  return data
}

export async function deleteTest(testId: number) {
  const { error } = await supabase
    .from('reaction_tests')
    .delete()
    .eq('id', testId)

  if (error) throw error
}

async function handleDatabaseError(error: any, context: string) {
  if (error?.message?.includes('JWT') || error?.message?.includes('auth')) {
    throw new Error('Error de autenticación. Por favor, recarga la página.');
  } else if (error?.message?.includes('network') || error?.message?.includes('Failed to fetch')) {
    throw new Error('Error de conexión. Por favor, verifica tu conexión a internet.');
  } else if (error?.message?.includes('permission') || error?.message?.includes('access')) {
    throw new Error('Error de permisos. No tienes autorización para realizar esta acción.');
  } else if (error?.message?.includes('Foreign key violation')) {
    throw new Error('Error de integridad referencial. Por favor, intenta nuevamente.');
  }
  
  console.error(`Error in ${context}:`, error);
  throw new Error(error?.message || 'Error desconocido al eliminar los datos');
}

async function deleteTestData(test: { id: number }) {
  // Eliminar el análisis de IA si existe
  const { error: aiAnalysisError } = await supabase
    .from('ai_analysis')
    .delete()
    .eq('test_id', test.id);

  if (aiAnalysisError) throw aiAnalysisError;

  // Eliminar los intentos asociados
  const { error: attemptsError } = await supabase
    .from('attempts')
    .delete()
    .eq('test_id', test.id);

  if (attemptsError) throw attemptsError;

  // Eliminar el test
  const { error: testError } = await supabase
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
    const { data: tests, error: fetchError } = await supabase
      .from('reaction_tests')
      .select('id') as { data: { id: number }[] | null, error: any };

    if (fetchError) throw fetchError;

    if (!tests || tests.length === 0) {
      return { success: true, deletedCount: 0 };
    }

    // Eliminar datos para cada test
    for (const test of tests) {
      if (typeof test.id !== 'number') continue;
      try {
        await deleteTestData(test);
      } catch (err: any) {
        throw new Error(`Error al eliminar datos del test ${test.id}: ${err?.message || 'Error desconocido'}`);
      }
    }

    // Reiniciar las secuencias de IDs
    try {
      // Reiniciar secuencia de reaction_tests
      await supabase.rpc('reset_sequence', { table_name: 'reaction_tests' });
      // Reiniciar secuencia de attempts
      await supabase.rpc('reset_sequence', { table_name: 'attempts' });
      // Reiniciar secuencia de ai_analysis
      await supabase.rpc('reset_sequence', { table_name: 'ai_analysis' });

      console.log('Secuencias de IDs reiniciadas exitosamente');
    } catch (seqError: any) {
      console.error('Error al reiniciar secuencias:', seqError);
      // No lanzamos el error aquí porque los datos ya fueron eliminados
    }

    return { success: true, deletedCount: tests.length };
  } catch (error: any) {
    return handleDatabaseError(error, 'deleteAllTests');
  }
}