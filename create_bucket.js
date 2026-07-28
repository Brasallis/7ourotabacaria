const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://pvjuwanjmbmpgfqqakaq.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB2anV3YW5qbWJtcGdmcXFha2FxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NTAwNTAwNywiZXhwIjoyMTAwNTgxMDA3fQ.-hOSH6fEU_Uv_EX0Zpm8W51Yd_YyHMxZicxIiPwp-cU';

const supabase = createClient(supabaseUrl, supabaseKey);

async function setupBucket() {
  console.log("Verificando/criando bucket 'produtos'...");
  const { data: buckets, error: listError } = await supabase.storage.listBuckets();
  
  if (listError) {
    console.error("Erro ao listar buckets:", listError);
    return;
  }

  const produtosBucket = buckets.find(b => b.name === 'produtos');

  if (!produtosBucket) {
    console.log("Bucket 'produtos' não encontrado. Criando...");
    const { data, error } = await supabase.storage.createBucket('produtos', { public: true });
    if (error) {
      console.error("Erro ao criar bucket:", error);
    } else {
      console.log("Bucket 'produtos' criado com sucesso!");
    }
  } else {
    console.log("Bucket 'produtos' já existe.");
    // Garantir que é publico
    if (!produtosBucket.public) {
      console.log("Atenção: O bucket não está marcado como público, alterando...");
      const { error } = await supabase.storage.updateBucket('produtos', { public: true });
      if (error) console.error("Erro ao atualizar bucket para público:", error);
      else console.log("Bucket alterado para público com sucesso!");
    }
  }
}

setupBucket();
