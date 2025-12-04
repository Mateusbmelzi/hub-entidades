import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DateInput } from '@/components/ui/date-input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { useCreateProjeto } from '@/hooks/useCreateProjeto';
import { formatDateToISO } from '@/lib/date-utils';
import { useMembrosEntidade } from '@/hooks/useMembrosEntidade';
import { VincularMembrosProjeto } from './VincularMembrosProjeto';
import { UploadImagemProjeto } from './UploadImagemProjeto';
import { UploadImagemProjetoTemp } from './UploadImagemProjetoTemp';
import { GerenciarEmpresasParceirasProjeto } from './GerenciarEmpresasParceirasProjeto';

const formSchema = z.object({
  nome: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  descricao: z.string().optional(),
  data_inicio: z.string().optional(),
  data_fim: z.string().optional(),
  repositorio_url: z.string().optional().refine((val) => !val || z.string().url().safeParse(val).success, {
    message: 'URL inválida'
  }),
  link_apresentacao: z.string().optional().refine((val) => !val || z.string().url().safeParse(val).success, {
    message: 'URL inválida'
  }),
  tecnologias: z.string().optional(),
  status: z.string().default('ativo'),
  membro_id: z.string().min(1, 'É obrigatório alocar o projeto a um membro'),
  visivel: z.boolean().default(false),
});

type FormData = z.infer<typeof formSchema>;

interface CriarProjetoFormProps {
  entidadeId: number;
  onSuccess: () => void;
}

const CriarProjetoForm: React.FC<CriarProjetoFormProps> = ({ entidadeId, onSuccess }) => {
  const { createProjeto, loading } = useCreateProjeto();
  const { membros, loading: membrosLoading } = useMembrosEntidade({
    entidadeId,
    includeInativos: false,
  });
  const [projetoCriadoId, setProjetoCriadoId] = useState<string | null>(null);
  const [imagemUrl, setImagemUrl] = useState<string | null>(null);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nome: '',
      descricao: '',
      data_inicio: '',
      data_fim: '',
      repositorio_url: '',
      link_apresentacao: '',
      tecnologias: '',
      status: 'ativo',
      membro_id: '',
      visivel: false,
    },
  });

  const onSubmit = async (data: FormData) => {
    const tecnologiasArray = data.tecnologias 
      ? data.tecnologias.split(',').map(tech => tech.trim()).filter(tech => tech.length > 0)
      : [];

    // Garantir que strings vazias sejam convertidas para null
    const dataInicio = data.data_inicio && data.data_inicio.trim() !== '' 
      ? formatDateToISO(data.data_inicio) 
      : null;
    const dataFim = data.data_fim && data.data_fim.trim() !== '' 
      ? formatDateToISO(data.data_fim) 
      : null;

    const projetoId = await createProjeto({
      nome: data.nome,
      descricao: data.descricao || null,
      data_inicio: dataInicio,
      data_fim: dataFim,
      repositorio_url: data.repositorio_url || null,
      link_apresentacao: data.link_apresentacao || null,
      tecnologias: tecnologiasArray.length > 0 ? tecnologiasArray : null,
      status: data.status,
      entidade_id: entidadeId,
      membro_id: data.membro_id,
      imagem_url: imagemUrl || null,
      visivel: data.visivel,
    });
    
    if (projetoId) {
      // Projeto criado com sucesso, mostrar seção para adicionar membros adicionais
      setProjetoCriadoId(projetoId);
    }
  };

  const handleFinalizar = () => {
    setProjetoCriadoId(null);
    form.reset();
    onSuccess();
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>
          {projetoCriadoId ? 'Projeto Criado - Adicionar Membros' : 'Criar Novo Projeto'}
        </DialogTitle>
        <DialogDescription>
          {projetoCriadoId 
            ? 'Projeto criado com sucesso! Você pode adicionar membros adicionais ao projeto (opcional).'
            : 'Preencha os dados do projeto. É obrigatório alocar o projeto a um membro responsável da organização.'}
        </DialogDescription>
      </DialogHeader>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {!projetoCriadoId ? (
            <>
              <FormField
                control={form.control}
                name="nome"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome do Projeto</FormLabel>
                    <FormControl>
                      <Input placeholder="Nome do projeto" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="descricao"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descrição</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Descrição do projeto, objetivos e resultados esperados"
                        className="min-h-[80px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="data_inicio"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Data de Início</FormLabel>
                      <FormControl>
                        <DateInput 
                          placeholder="Data de Início" 
                          value={field.value} 
                          onChange={field.onChange}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="data_fim"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Data de Fim</FormLabel>
                      <FormControl>
                        <DateInput 
                          placeholder="Data de Fim" 
                          value={field.value} 
                          onChange={field.onChange}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="repositorio_url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>URL do Repositório</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="https://github.com/usuario/projeto"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="link_apresentacao"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Link de Apresentação</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="https://docs.google.com/presentation/... ou link para PDF, slides, etc."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                    <p className="text-xs text-muted-foreground mt-1">
                      Link para apresentação do projeto (Google Slides, PowerPoint Online, PDF, etc.)
                    </p>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="tecnologias"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tecnologias</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="React, TypeScript, Node.js (separadas por vírgula)"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="ativo">Ativo</SelectItem>
                        <SelectItem value="em_desenvolvimento">Em Desenvolvimento</SelectItem>
                        <SelectItem value="concluido">Concluído</SelectItem>
                        <SelectItem value="pausado">Pausado</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="membro_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Membro Responsável <span className="text-red-500">*</span></FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      value={field.value}
                      disabled={membrosLoading}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={membrosLoading ? "Carregando membros..." : "Selecione um membro"} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {membros.length === 0 ? (
                          <div className="px-2 py-1.5 text-sm text-muted-foreground">
                            Nenhum membro disponível
                        </div>
                        ) : (
                          membros.map((membro) => (
                            <SelectItem key={membro.id} value={membro.id}>
                              {membro.profile?.nome || membro.profile?.email || 'Membro sem nome'}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                    <p className="text-xs text-muted-foreground mt-1">
                      É obrigatório alocar o projeto a um membro da organização
                    </p>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="visivel"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">
                        Projeto visível publicamente
                      </FormLabel>
                      <p className="text-sm text-muted-foreground">
                        Quando ativado, o projeto aparecerá na página pública de projetos para todos os usuários autenticados
                      </p>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <UploadImagemProjetoTemp
                onImagemSelected={(url) => setImagemUrl(url)}
                currentImagemUrl={imagemUrl}
              />

              <div className="flex justify-end space-x-2 pt-4">
                <Button type="submit" disabled={loading}>
                  {loading ? 'Criando...' : 'Criar Projeto'}
                </Button>
              </div>
            </>
          ) : (
            <>
              <div className="space-y-4">
                <div className="text-sm text-muted-foreground bg-green-50 border border-green-200 rounded-md p-3">
                  <p className="font-medium text-green-800 mb-1">✓ Projeto criado com sucesso!</p>
                  <p>O membro responsável já foi vinculado ao projeto. Você pode adicionar uma imagem e mais membros abaixo (opcional).</p>
                </div>
                <UploadImagemProjeto
                  projetoId={projetoCriadoId}
                  onImagemUpdated={(url) => {
                    setImagemUrl(url);
                  }}
                  currentImagemUrl={imagemUrl}
                />
                <GerenciarEmpresasParceirasProjeto
                  projetoId={projetoCriadoId}
                  entidadeId={entidadeId}
                  onSuccess={() => {
                    // Recarregar se necessário
                  }}
                />
                <VincularMembrosProjeto
                  projetoId={projetoCriadoId}
                  entidadeId={entidadeId}
                  onUpdate={() => {
                    // Recarregar se necessário
                  }}
                />
              </div>
              <div className="flex justify-end space-x-2 pt-4">
                <Button type="button" onClick={handleFinalizar} variant="default">
                  Finalizar
                </Button>
              </div>
            </>
          )}
        </form>
      </Form>
    </>
  );
};

export default CriarProjetoForm;