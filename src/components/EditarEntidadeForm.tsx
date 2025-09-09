import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';
import { useUpdateEntidade } from '@/hooks/useUpdateEntidade';
import { useToast } from '@/hooks/use-toast';
import { AREAS_ATUACAO } from '@/lib/constants';
import GerenciarEmpresasParceiras from './GerenciarEmpresasParceiras';
import { EmpresasParceiras } from '@/types/empresa-parceira';

const formSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório').max(100, 'Nome deve ter no máximo 100 caracteres'),
  descricao_curta: z.string().min(1, 'Descrição curta é obrigatória').max(200, 'Descrição curta deve ter no máximo 200 caracteres'),
  descricao_detalhada: z.string().min(1, 'Descrição detalhada é obrigatória').max(2000, 'Descrição detalhada deve ter no máximo 2000 caracteres'),
  numero_membros: z.number().min(1, 'Deve ter pelo menos 1 membro').max(1000, 'Máximo 1000 membros'),
  ano_criacao: z.number().min(1900, 'Ano deve ser maior que 1900').max(new Date().getFullYear() + 1, 'Ano não pode ser no futuro').optional(),
  area_atuacao: z.array(z.string()).min(1, 'Pelo menos uma área de atuação é obrigatória'),
  contato: z.string().optional(),
  site_url: z.string().url('Site deve ser uma URL válida').optional().or(z.literal('')),
  linkedin_url: z.string().url('LinkedIn deve ser uma URL válida').optional().or(z.literal('')),
  instagram_url: z.string().url('Instagram deve ser uma URL válida').optional().or(z.literal('')),
  local_apresentacao: z.string().optional(),
  horario_apresentacao: z.string().optional(),
  local_feira: z.string().optional(),
  feira_ativa: z.boolean().optional(),
  processo_seletivo_ativo: z.boolean().optional(),
  link_processo_seletivo: z.string().url('Link deve ser uma URL válida').optional().or(z.literal('')),
  data_primeira_fase: z.string().optional(),
  encerramento_primeira_fase: z.string().optional(),
  data_segunda_fase: z.string().optional(),
  encerramento_segunda_fase: z.string().optional(),
  data_terceira_fase: z.string().optional(),
  encerramento_terceira_fase: z.string().optional(),
  abertura_processo_seletivo: z.string().optional(),
  fechamento_processo_seletivo: z.string().optional(),
  empresas_parceiras: z.array(z.object({
    id: z.string(),
    nome: z.string(),
    site: z.string().optional(),
    descricao: z.string().optional(),
    logo_url: z.string().optional(),
  })).optional(),
});


type FormData = z.infer<typeof formSchema>;

interface EditarEntidadeFormProps {
  entidade: any;
  onSuccess: () => void;
}

export const EditarEntidadeForm: React.FC<EditarEntidadeFormProps> = ({ entidade, onSuccess }) => {
  const { updateEntidade, loading } = useUpdateEntidade();
  const { toast } = useToast();
  
  // Estado para empresas parceiras
  const [empresasParceiras, setEmpresasParceiras] = useState<EmpresasParceiras>(() => {
    if (entidade.empresas_parceiras && Array.isArray(entidade.empresas_parceiras)) {
      return entidade.empresas_parceiras;
    }
    return [];
  });

  // Converter area_atuacao para array se for string
  const getInitialAreaAtuacao = () => {
    console.log('🔍 getInitialAreaAtuacao chamado');
    console.log('🔍 entidade.area_atuacao:', entidade.area_atuacao);
    console.log('🔍 Tipo:', typeof entidade.area_atuacao);
    console.log('🔍 É array?', Array.isArray(entidade.area_atuacao));
    
    if (!entidade.area_atuacao) return [];
    if (Array.isArray(entidade.area_atuacao)) return entidade.area_atuacao;
    return [entidade.area_atuacao];
  };

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nome: entidade.nome || '',
      descricao_curta: entidade.descricao_curta || '',
      descricao_detalhada: entidade.descricao_detalhada || '',
      numero_membros: entidade.numero_membros || 10,
      ano_criacao: entidade.ano_criacao || new Date().getFullYear(),
      area_atuacao: getInitialAreaAtuacao(),
      contato: entidade.contato || '',
      site_url: entidade.site_url || '',
      linkedin_url: entidade.linkedin_url || '',
      instagram_url: entidade.instagram_url || '',
      local_apresentacao: entidade.local_apresentacao || '',
      horario_apresentacao: entidade.horario_apresentacao || '',
      local_feira: entidade.local_feira || '',
      feira_ativa: entidade.feira_ativa || false,
      processo_seletivo_ativo: entidade.processo_seletivo_ativo || false,
      link_processo_seletivo: entidade.link_processo_seletivo || '',
      abertura_processo_seletivo: entidade.abertura_processo_seletivo || '',
      data_primeira_fase: entidade.data_primeira_fase || '',
      encerramento_primeira_fase: entidade.encerramento_primeira_fase || '',
      data_segunda_fase: entidade.data_segunda_fase || '',
      encerramento_segunda_fase: entidade.encerramento_segunda_fase || '',
      data_terceira_fase: entidade.data_terceira_fase || '',
      encerramento_terceira_fase: entidade.encerramento_terceira_fase || '',
      fechamento_processo_seletivo: entidade.fechamento_processo_seletivo || '',
      empresas_parceiras: empresasParceiras,
    },
  });

  const onSubmit = async (data: FormData) => {
    console.log('🚀 onSubmit chamado com dados:', data);
    console.log('🚀 ID da entidade:', entidade.id);
    console.log('🚀 Tipo do ID:', typeof entidade.id);
    console.log('🚀 area_atuacao no formulário:', data.area_atuacao);
    console.log('🚀 Tipo de area_atuacao:', typeof data.area_atuacao);
    console.log('🚀 É array?', Array.isArray(data.area_atuacao));
    console.log('🚀 Conteúdo do array:', JSON.stringify(data.area_atuacao));
    
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
        feira_ativa: data.feira_ativa || false,
        processo_seletivo_ativo: data.processo_seletivo_ativo || false,
        link_processo_seletivo: data.link_processo_seletivo || null,
        abertura_processo_seletivo: data.abertura_processo_seletivo || null,
        fechamento_processo_seletivo: data.fechamento_processo_seletivo || null,
        data_primeira_fase: data.data_primeira_fase || null,
        encerramento_primeira_fase: data.encerramento_primeira_fase || null,
        data_segunda_fase: data.data_segunda_fase || null,
        encerramento_segunda_fase: data.encerramento_segunda_fase || null,
        data_terceira_fase: data.data_terceira_fase || null,
        encerramento_terceira_fase: data.encerramento_terceira_fase || null,
        empresas_parceiras: empresasParceiras
      });

      if (success) {
        toast({
          title: '✅ Sucesso!',
          description: 'Informações da entidade atualizadas com sucesso. A página será atualizada automaticamente.',
        });
        
        // Pequeno delay para mostrar o feedback antes de fechar
        setTimeout(() => {
          onSuccess();
        }, 500);
      } else {
        toast({
          title: '❌ Erro!',
          description: 'Erro ao atualizar informações da entidade.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Erro ao atualizar entidade:', error);
      toast({
        title: '❌ Erro!',
        description: 'Erro ao atualizar informações da entidade.',
        variant: 'destructive',
      });
    }
  };

  const addAreaAtuacao = (area: string) => {
    const currentAreas = form.watch('area_atuacao');
    console.log('➕ addAreaAtuacao:', { area, currentAreas });
    if (!currentAreas.includes(area)) {
      const newAreas = [...currentAreas, area];
      console.log('➕ Novas áreas:', newAreas);
      form.setValue('area_atuacao', newAreas);
    }
  };

  const removeAreaAtuacao = (areaToRemove: string) => {
    const currentAreas = form.watch('area_atuacao');
    console.log('➖ removeAreaAtuacao:', { areaToRemove, currentAreas });
    const newAreas = currentAreas.filter(area => area !== areaToRemove);
    console.log('➖ Novas áreas:', newAreas);
    form.setValue('area_atuacao', newAreas);
  };

  const selectedAreas = form.watch('area_atuacao');
  console.log('👀 selectedAreas atualizado:', selectedAreas);
  console.log('👀 Tipo:', typeof selectedAreas);
  console.log('👀 É array?', Array.isArray(selectedAreas));
  const availableAreas = AREAS_ATUACAO.filter(area => !selectedAreas.includes(area));

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
            <Label htmlFor="area_atuacao">Áreas de Atuação</Label>
            
            {/* Áreas selecionadas - Feedback visual */}
            {selectedAreas.length > 0 && (
              <div className="mb-4">
                <p className="text-sm font-medium text-gray-700 mb-2">
                  Áreas selecionadas ({selectedAreas.length}):
                </p>
                <div className="flex flex-wrap gap-2">
                  {selectedAreas.map((area) => (
                    <Badge key={area} variant="secondary" className="flex items-center gap-1 bg-red-100 text-red-800 border-red-200">
                      {area}
                      <button
                        type="button"
                        onClick={() => removeAreaAtuacao(area)}
                        className="ml-1 hover:bg-red-200 rounded-full p-0.5 transition-colors"
                        title={`Remover ${area}`}
                      >
                        <X size={12} />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            
            {/* Áreas disponíveis como checkboxes */}
            <div className="grid grid-cols-2 gap-3 mt-2">
              {AREAS_ATUACAO.map((area) => (
                <div key={area} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id={`area-${area}`}
                    checked={selectedAreas.includes(area)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        addAreaAtuacao(area);
                      } else {
                        removeAreaAtuacao(area);
                      }
                    }}
                    className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                  />
                  <label htmlFor={`area-${area}`} className="text-sm text-gray-700">
                    {area.charAt(0).toUpperCase() + area.slice(1)}
                  </label>
                </div>
              ))}
            </div>

            {selectedAreas.length === 0 && (
              <p className="text-sm text-gray-500 mt-2">
                Selecione pelo menos uma área de atuação
              </p>
            )}

            {form.formState.errors.area_atuacao && (
              <p className="text-sm text-red-500 mt-2">{form.formState.errors.area_atuacao.message}</p>
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
          <div className="flex items-center space-x-2">
            <Checkbox
              id="feira_ativa"
              checked={form.watch('feira_ativa')}
              onCheckedChange={(checked) => form.setValue('feira_ativa', checked as boolean)}
            />
            <Label htmlFor="feira_ativa" className="text-sm font-normal cursor-pointer">
              Feira ativa
            </Label>
          </div>

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

      <Card>
      <CardHeader>
        <CardTitle>Processo Seletivo</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="processo_seletivo_ativo"
            checked={form.watch('processo_seletivo_ativo')}
            onCheckedChange={(checked) => form.setValue('processo_seletivo_ativo', checked as boolean)}
          />
          <Label htmlFor="processo_seletivo_ativo" className="text-sm font-normal cursor-pointer">
            Processo seletivo ativo
          </Label>
        </div>

        <div className="space-y-2">
          <Label htmlFor="abertura_processo_seletivo">Abertura do Processo Seletivo</Label>
          <Input
            id="abertura_processo_seletivo"
            type="date"
            {...form.register('abertura_processo_seletivo')}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="fechamento_processo_seletivo">Fechamento do Processo Seletivo</Label>
          <Input
            id="fechamento_processo_seletivo"
            type="date"
            {...form.register('fechamento_processo_seletivo')}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="link_processo_seletivo">Link do Processo Seletivo</Label>
          <Input
            id="link_processo_seletivo"
            {...form.register('link_processo_seletivo')}
            placeholder="https://forms.google.com/processo-seletivo"
          />
          {form.formState.errors.link_processo_seletivo && (
            <p className="text-sm text-red-500">{form.formState.errors.link_processo_seletivo.message}</p>
          )}
        </div>

        {/* Grupos de fases alinhados à esquerda */}
        <div className="space-y-6">
          {/* Primeira Fase */}
          <div className="flex justify-start items-center gap-8">
            <div className="space-y-2">
              <Label htmlFor="data_primeira_fase">Início 1ª Fase</Label>
              <Input
                id="data_primeira_fase"
                type="date"
                {...form.register('data_primeira_fase')}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="encerramento_primeira_fase">Encerramento 1ª Fase</Label>
              <Input
                id="encerramento_primeira_fase"
                type="date"
                {...form.register('encerramento_primeira_fase')}
              />
            </div>
          </div>

          {/* Segunda Fase */}
          <div className="flex justify-start items-center gap-8">
            <div className="space-y-2">
              <Label htmlFor="data_segunda_fase">Início 2ª Fase</Label>
              <Input
                id="data_segunda_fase"
                type="date"
                {...form.register('data_segunda_fase')}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="encerramento_segunda_fase">Encerramento 2ª Fase</Label>
              <Input
                id="encerramento_segunda_fase"
                type="date"
                {...form.register('encerramento_segunda_fase')}
              />
            </div>
          </div>

          {/* Terceira Fase */}
          <div className="flex justify-start items-center gap-8">
            <div className="space-y-2">
              <Label htmlFor="data_terceira_fase">Início 3ª Fase</Label>
              <Input
                id="data_terceira_fase"
                type="date"
                {...form.register('data_terceira_fase')}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="encerramento_terceira_fase">Encerramento 3ª Fase</Label>
              <Input
                id="encerramento_terceira_fase"
                type="date"
                {...form.register('encerramento_terceira_fase')}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>

    {/* Card para Empresas Parceiras */}
    <GerenciarEmpresasParceiras
      empresasParceiras={empresasParceiras}
      onEmpresasChange={setEmpresasParceiras}
    />

      <div className="flex justify-end">
        <Button type="submit" disabled={loading}>
          {loading ? 'Salvando...' : 'Salvar Alterações'}
        </Button>
      </div>
    </form>
  );
};

export default EditarEntidadeForm;