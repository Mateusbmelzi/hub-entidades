import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useUpdateEntidade } from '@/hooks/useUpdateEntidade';
import { useToast } from '@/hooks/use-toast';
import { AREAS_ATUACAO } from '@/lib/constants';

const formSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório').max(100, 'Nome deve ter no máximo 100 caracteres'),
  descricao_curta: z.string().min(1, 'Descrição curta é obrigatória').max(200, 'Descrição curta deve ter no máximo 200 caracteres'),
  descricao_detalhada: z.string().min(1, 'Descrição detalhada é obrigatória').max(2000, 'Descrição detalhada deve ter no máximo 2000 caracteres'),
  numero_membros: z.number().min(1, 'Deve ter pelo menos 1 membro').max(1000, 'Máximo 1000 membros'),
  ano_criacao: z.number().min(1900, 'Ano deve ser maior que 1900').max(new Date().getFullYear() + 1, 'Ano não pode ser no futuro').optional(),
  area_atuacao: z.string().min(1, 'Área de atuação é obrigatória'),
  contato: z.string().optional(),
  site_url: z.string().url('Site deve ser uma URL válida').optional().or(z.literal('')),
  linkedin_url: z.string().url('LinkedIn deve ser uma URL válida').optional().or(z.literal('')),
  instagram_url: z.string().url('Instagram deve ser uma URL válida').optional().or(z.literal('')),
  local_apresentacao: z.string().optional(),
  horario_apresentacao: z.string().optional(),
  local_feira: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface EditarEntidadeFormProps {
  entidade: any;
  onSuccess: () => void;
}

export const EditarEntidadeForm: React.FC<EditarEntidadeFormProps> = ({ entidade, onSuccess }) => {
  const { updateEntidade, loading } = useUpdateEntidade();
  const { toast } = useToast();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nome: entidade.nome || '',
      descricao_curta: entidade.descricao_curta || '',
      descricao_detalhada: entidade.descricao_detalhada || '',
      numero_membros: entidade.numero_membros || 10,
      ano_criacao: entidade.ano_criacao || new Date().getFullYear(),
      area_atuacao: entidade.area_atuacao || '',
      contato: entidade.contato || '',
      site_url: entidade.site_url || '',
      linkedin_url: entidade.linkedin_url || '',
      instagram_url: entidade.instagram_url || '',
      local_apresentacao: entidade.local_apresentacao || '',
      horario_apresentacao: entidade.horario_apresentacao || '',
      local_feira: entidade.local_feira || '',
    },
  });

  const onSubmit = async (data: FormData) => {
    console.log('🚀 onSubmit chamado com dados:', data);
    console.log('🚀 ID da entidade:', entidade.id);
    console.log('🚀 Tipo do ID:', typeof entidade.id);
    
    try {
      const success = await updateEntidade(entidade.id, {
        nome: data.nome,
        descricao_curta: data.descricao_curta,
        descricao_detalhada: data.descricao_detalhada,
        numero_membros: data.numero_membros,
        ano_criacao: data.ano_criacao || null,
        area_atuacao: data.area_atuacao,
        contato: data.contato || null,
        site_url: data.site_url || null,
        linkedin_url: data.linkedin_url || null,
        instagram_url: data.instagram_url || null,
        local_apresentacao: data.local_apresentacao || null,
        horario_apresentacao: data.horario_apresentacao || null,
        local_feira: data.local_feira || null,
      });

      if (success) {
        toast({
          title: 'Sucesso!',
          description: 'Informações da entidade atualizadas com sucesso.',
        });
        onSuccess();
      } else {
        toast({
          title: 'Erro!',
          description: 'Erro ao atualizar informações da entidade.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Erro ao atualizar entidade:', error);
      toast({
        title: 'Erro!',
        description: 'Erro ao atualizar informações da entidade.',
        variant: 'destructive',
      });
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit, (errors) => {
      console.log('❌ Erros de validação:', errors);
    })} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Informações Básicas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nome">Nome da Organização</Label>
            <Input
              id="nome"
              {...form.register('nome')}
              placeholder="Nome da organização"
            />
            {form.formState.errors.nome && (
              <p className="text-sm text-red-500">{form.formState.errors.nome.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="descricao_curta">Descrição Curta</Label>
            <Textarea
              id="descricao_curta"
              {...form.register('descricao_curta')}
              placeholder="Descrição curta da organização"
              rows={3}
            />
            {form.formState.errors.descricao_curta && (
              <p className="text-sm text-red-500">{form.formState.errors.descricao_curta.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="descricao_detalhada">Descrição Detalhada</Label>
            <Textarea
              id="descricao_detalhada"
              {...form.register('descricao_detalhada')}
              placeholder="Descrição detalhada da organização"
              rows={5}
            />
            {form.formState.errors.descricao_detalhada && (
              <p className="text-sm text-red-500">{form.formState.errors.descricao_detalhada.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="numero_membros">Número de Membros</Label>
            <Input
              id="numero_membros"
              type="number"
              {...form.register('numero_membros', { valueAsNumber: true })}
              placeholder="Número de membros"
              min="1"
              max="1000"
            />
            {form.formState.errors.numero_membros && (
              <p className="text-sm text-red-500">{form.formState.errors.numero_membros.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="ano_criacao">Ano de Criação</Label>
            <Input
              id="ano_criacao"
              type="number"
              {...form.register('ano_criacao', { valueAsNumber: true })}
              placeholder="Ano em que a organização foi criada"
              min="1900"
              max={new Date().getFullYear() + 1}
            />
            {form.formState.errors.ano_criacao && (
              <p className="text-sm text-red-500">{form.formState.errors.ano_criacao.message}</p>
            )}
          </div>

                     <div className="space-y-2">
             <Label htmlFor="area_atuacao">Área de Atuação</Label>
             <Select 
               value={form.watch('area_atuacao')} 
               onValueChange={(value) => form.setValue('area_atuacao', value)}
             >
               <SelectTrigger>
                 <SelectValue placeholder="Selecione uma área de atuação" />
               </SelectTrigger>
               <SelectContent>
                 {AREAS_ATUACAO.map((area) => (
                   <SelectItem key={area} value={area}>
                     {area}
                   </SelectItem>
                 ))}
               </SelectContent>
             </Select>
             {form.formState.errors.area_atuacao && (
               <p className="text-sm text-red-500">{form.formState.errors.area_atuacao.message}</p>
             )}
           </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Informações de Contato</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="contato">Contato</Label>
            <Input
              id="contato"
              {...form.register('contato')}
              placeholder="Email ou telefone"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="site_url">Site</Label>
            <Input
              id="site_url"
              {...form.register('site_url')}
              placeholder="https://site-da-organizacao.com"
            />
            {form.formState.errors.site_url && (
              <p className="text-sm text-red-500">{form.formState.errors.site_url.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="linkedin_url">LinkedIn</Label>
            <Input
              id="linkedin_url"
              {...form.register('linkedin_url')}
              placeholder="https://linkedin.com/company/organizacao"
            />
            {form.formState.errors.linkedin_url && (
              <p className="text-sm text-red-500">{form.formState.errors.linkedin_url.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="instagram_url">Instagram</Label>
            <Input
              id="instagram_url"
              {...form.register('instagram_url')}
              placeholder="https://instagram.com/organizacao"
            />
            {form.formState.errors.instagram_url && (
              <p className="text-sm text-red-500">{form.formState.errors.instagram_url.message}</p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Informações da Feira</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="horario_apresentacao">Horário da Apresentação</Label>
            <Input
              id="horario_apresentacao"
              {...form.register('horario_apresentacao')}
              placeholder="Ex: 14:00 - 15:30"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="local_apresentacao">Local da Apresentação</Label>
            <Input
              id="local_apresentacao"
              {...form.register('local_apresentacao')}
              placeholder="Local onde a apresentação será realizada"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="local_feira">Local da Feira</Label>
            <Input
              id="local_feira"
              {...form.register('local_feira')}
              placeholder="Local do estande na feira"
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button type="submit" disabled={loading}>
          {loading ? 'Salvando...' : 'Salvar Alterações'}
        </Button>
      </div>
    </form>
  );
};

export default EditarEntidadeForm;