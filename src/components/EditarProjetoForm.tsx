import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DateInput } from '@/components/ui/date-input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { useUpdateProjeto } from '@/hooks/useUpdateProjeto';
import type { Projeto } from '@/hooks/useProjetos';
import { formatDateToISO, formatDateFromISO } from '@/lib/date-utils';
import { VincularMembrosProjeto } from './VincularMembrosProjeto';
import { UploadImagemProjeto } from './UploadImagemProjeto';
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
  visivel: z.boolean().default(false),
});

type FormData = z.infer<typeof formSchema>;

interface EditarProjetoFormProps {
  projeto: Projeto;
  entidadeId: number;
  onSuccess: () => void;
}

const EditarProjetoForm: React.FC<EditarProjetoFormProps> = ({ projeto, entidadeId, onSuccess }) => {
  const { updateProjeto, loading } = useUpdateProjeto();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nome: projeto.nome || '',
      descricao: projeto.descricao || '',
      data_inicio: projeto.data_inicio ? formatDateFromISO(projeto.data_inicio) : '',
      data_fim: projeto.data_fim ? formatDateFromISO(projeto.data_fim) : '',
      repositorio_url: projeto.repositorio_url || '',
      link_apresentacao: projeto.link_apresentacao || '',
      tecnologias: projeto.tecnologias?.join(', ') || '',
      status: projeto.status || 'ativo',
      visivel: projeto.visivel ?? false,
    },
  });

  const onSubmit = async (data: FormData) => {
    const tecnologiasArray = data.tecnologias 
      ? data.tecnologias.split(',').map(tech => tech.trim()).filter(tech => tech.length > 0)
      : [];

    // Garantir que strings vazias sejam convertidas para null
    // Validar e formatar data_inicio - garantir que nunca seja string vazia
    let dataInicioFinal: string | null = null;
    if (data.data_inicio && typeof data.data_inicio === 'string') {
      const trimmed = data.data_inicio.trim();
      if (trimmed !== '' && trimmed.length === 10) {
        const formatted = formatDateToISO(trimmed);
        // Validar se formatDateToISO retornou uma data válida no formato YYYY-MM-DD
        if (formatted && formatted.length === 10 && /^\d{4}-\d{2}-\d{2}$/.test(formatted)) {
          dataInicioFinal = formatted;
        }
      }
    }

    // Validar e formatar data_fim - garantir que nunca seja string vazia
    let dataFimFinal: string | null = null;
    if (data.data_fim && typeof data.data_fim === 'string') {
      const trimmed = data.data_fim.trim();
      if (trimmed !== '' && trimmed.length === 10) {
        const formatted = formatDateToISO(trimmed);
        // Validar se formatDateToISO retornou uma data válida no formato YYYY-MM-DD
        if (formatted && formatted.length === 10 && /^\d{4}-\d{2}-\d{2}$/.test(formatted)) {
          dataFimFinal = formatted;
        }
      }
    }

    const success = await updateProjeto(projeto.id, entidadeId, {
      nome: data.nome,
      descricao: data.descricao || null,
      data_inicio: dataInicioFinal,
      data_fim: dataFimFinal,
      repositorio_url: data.repositorio_url || null,
      link_apresentacao: data.link_apresentacao || null,
      tecnologias: tecnologiasArray.length > 0 ? tecnologiasArray : null,
      status: data.status,
      visivel: data.visivel,
    });
    
    if (success) {
      onSuccess();
    }
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>Editar Projeto</DialogTitle>
      </DialogHeader>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                      value={field.value ? formatDateFromISO(field.value) : ''} 
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
                      value={field.value ? formatDateFromISO(field.value) : ''} 
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

          <UploadImagemProjeto
            projetoId={projeto.id}
            onImagemUpdated={(url) => {
              // A imagem já é atualizada automaticamente no banco pelo componente
              // Atualizar o objeto projeto localmente para refletir a mudança imediatamente
              if (url) {
                projeto.imagem_url = url;
                // Forçar re-render do componente pai se necessário
                // O onSuccess será chamado quando o formulário for salvo
              }
            }}
            currentImagemUrl={projeto.imagem_url}
          />

          <div className="space-y-3 border-t pt-6">
            <div className="space-y-1">
              <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                <Building2 className="h-4 w-4 text-red-600" />
                Empresas Parceiras do Projeto
              </h3>
              <p className="text-xs text-gray-600">
                Associe empresas parceiras da entidade a este projeto. As alterações são salvas automaticamente.
              </p>
            </div>
            <GerenciarEmpresasParceirasProjeto
              projetoId={projeto.id}
              entidadeId={entidadeId}
              onSuccess={() => {
                // As empresas são atualizadas automaticamente pelo componente
                // O onSuccess do formulário será chamado quando o usuário salvar
              }}
            />
          </div>

          <VincularMembrosProjeto
            projetoId={projeto.id}
            entidadeId={entidadeId}
            onUpdate={() => {
              // Recarregar dados se necessário
            }}
          />

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="submit" disabled={loading}>
              {loading ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
          </div>
        </form>
      </Form>
    </>
  );
};

export default EditarProjetoForm;