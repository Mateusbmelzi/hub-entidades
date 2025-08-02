import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DateInput } from '@/components/ui/date-input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useUpdateProjeto } from '@/hooks/useUpdateProjeto';
import type { Projeto } from '@/hooks/useProjetos';
import { formatDateToISO, formatDateFromISO } from '@/lib/date-utils';

const formSchema = z.object({
  nome: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  descricao: z.string().optional(),
  data_inicio: z.string().optional(),
  data_fim: z.string().optional(),
  repositorio_url: z.string().optional().refine((val) => !val || z.string().url().safeParse(val).success, {
    message: 'URL inválida'
  }),
  tecnologias: z.string().optional(),
  status: z.string().default('ativo'),
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
      data_inicio: projeto.data_inicio || '',
      data_fim: projeto.data_fim || '',
      repositorio_url: projeto.repositorio_url || '',
      tecnologias: projeto.tecnologias?.join(', ') || '',
      status: projeto.status || 'ativo',
    },
  });

  const onSubmit = async (data: FormData) => {
    const tecnologiasArray = data.tecnologias 
      ? data.tecnologias.split(',').map(tech => tech.trim()).filter(tech => tech.length > 0)
      : [];

    const success = await updateProjeto(projeto.id, entidadeId, {
      nome: data.nome,
      descricao: data.descricao || null,
      data_inicio: data.data_inicio ? formatDateToISO(data.data_inicio) : null,
      data_fim: data.data_fim ? formatDateToISO(data.data_fim) : null,
      repositorio_url: data.repositorio_url || null,
      tecnologias: tecnologiasArray.length > 0 ? tecnologiasArray : null,
      status: data.status,
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