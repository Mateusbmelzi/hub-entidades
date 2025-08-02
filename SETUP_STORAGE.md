# Configuração do Storage para Fotos das Entidades

## Problema
O bucket `entidades-fotos` não existe no Supabase Storage, o que impede o upload de fotos das entidades.

## Solução
Execute o seguinte SQL no Supabase Dashboard (SQL Editor):

```sql
-- Criar bucket para fotos das entidades
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'entidades-fotos',
  'entidades-fotos',
  true,
  5242880, -- 5MB
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
) ON CONFLICT (id) DO NOTHING;

-- Política para permitir upload de fotos por entidades autenticadas
CREATE POLICY "Entidades podem fazer upload de suas fotos" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'entidades-fotos' AND
  auth.role() = 'authenticated'
);

-- Política para permitir visualização pública das fotos
CREATE POLICY "Fotos das entidades são públicas" ON storage.objects
FOR SELECT USING (bucket_id = 'entidades-fotos');

-- Política para permitir atualização de fotos por entidades autenticadas
CREATE POLICY "Entidades podem atualizar suas fotos" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'entidades-fotos' AND
  auth.role() = 'authenticated'
);

-- Política para permitir remoção de fotos por entidades autenticadas
CREATE POLICY "Entidades podem remover suas fotos" ON storage.objects
FOR DELETE USING (
  bucket_id = 'entidades-fotos' AND
  auth.role() = 'authenticated'
);
```

## Passos:
1. Acesse o [Supabase Dashboard](https://supabase.com/dashboard)
2. Selecione seu projeto
3. Vá para "SQL Editor"
4. Cole o código SQL acima
5. Execute o script
6. Teste o upload de foto na aplicação

## Verificação
Após executar o script, você deve ver o bucket `entidades-fotos` na seção "Storage" do dashboard. 