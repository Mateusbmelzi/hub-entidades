import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2 } from 'lucide-react';
import { useAplicacaoProcesso } from '@/hooks/useAplicacaoProcesso';
import { useFasesProcesso } from '@/hooks/useFasesProcesso';
import { useTemplatesFormularios } from '@/hooks/useTemplatesFormularios';
import { useAreasInternas } from '@/hooks/useAreasInternas';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import type { CampoPersonalizado } from '@/types/processo-seletivo';

interface Props {
  entidadeId?: number;
}

export default function BotaoInscreverEntidade({ entidadeId }: Props) {
  const { aplicar, loading, jaInscrito, verificandoInscricao } = useAplicacaoProcesso(entidadeId);
  const { fases } = useFasesProcesso(entidadeId || 0);
  const { getTemplateById } = useTemplatesFormularios(entidadeId || 0);
  const { areasPS } = useAreasInternas(entidadeId || 0);
  const { profile } = useAuth();
  const { toast } = useToast();
  
  const [open, setOpen] = useState(false);
  
  // Buscar fase 1 e template vinculado
  const fase1 = fases.find(f => f.ordem === 1);
  const template = fase1?.template_formulario_id ? getTemplateById(fase1.template_formulario_id) : null;
  
  // Debug logs
  useEffect(() => {
    console.log('BotaoInscreverEntidade - Estado:', {
      entidadeId,
      jaInscrito,
      verificandoInscricao,
      totalFases: fases.length,
      fase1: fase1 ? `${fase1.nome} (ordem: ${fase1.ordem})` : 'não encontrada',
      temTemplate: !!template,
      templateNome: template?.nome_template
    });
  }, [entidadeId, jaInscrito, verificandoInscricao, fases, fase1, template]);
  
  // Estado do formulário - campos padrão
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    curso: '',
    semestre: '',
    area_interesse: '',
    mensagem: '',
  });
  
  // Estado dos campos personalizados
  const [respostasExtras, setRespostasExtras] = useState<Record<string, any>>({});
  
  // Preencher com dados do perfil quando disponível
  useEffect(() => {
    if (profile && open) {
      setFormData({
        nome: profile.nome || '',
        email: profile.email || '',
        curso: profile.curso || '',
        semestre: profile.semestre?.toString() || '',
        area_interesse: '',
        mensagem: '',
      });
    }
  }, [profile, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validar campos obrigatórios personalizados
    if (template?.campos_personalizados) {
      for (const campo of template.campos_personalizados) {
        if (campo.obrigatorio && !respostasExtras[campo.id]) {
          toast({
            title: '❌ Campo obrigatório',
            description: `O campo "${campo.label}" é obrigatório.`,
            variant: 'destructive',
          });
          return;
        }
      }
    }
    
    const res = await aplicar({
      nome_estudante: formData.nome,
      email_estudante: formData.email,
      curso_estudante: formData.curso,
      semestre_estudante: formData.semestre ? parseInt(formData.semestre) : undefined,
      area_interesse: formData.area_interesse,
      mensagem: formData.mensagem,
    }, respostasExtras);
    
    if (res.success) {
      setOpen(false);
      toast({
        title: '✅ Inscrição enviada!',
        description: 'Sua inscrição no processo seletivo foi enviada com sucesso.',
      });
    } else {
      toast({
        title: '❌ Erro ao inscrever',
        description: res.error || 'Tente novamente mais tarde.',
        variant: 'destructive',
      });
    }
  };
  
  const renderCampoPersonalizado = (campo: CampoPersonalizado) => {
    const value = respostasExtras[campo.id] || '';
    
    switch (campo.tipo) {
      case 'text':
        return (
          <Input
            id={campo.id}
            value={value}
            onChange={(e) => setRespostasExtras({ ...respostasExtras, [campo.id]: e.target.value })}
            placeholder={campo.placeholder}
            required={campo.obrigatorio}
          />
        );
      case 'textarea':
        return (
          <Textarea
            id={campo.id}
            value={value}
            onChange={(e) => setRespostasExtras({ ...respostasExtras, [campo.id]: e.target.value })}
            placeholder={campo.placeholder}
            required={campo.obrigatorio}
            rows={3}
          />
        );
      case 'select':
        return (
          <Select
            value={value}
            onValueChange={(val) => setRespostasExtras({ ...respostasExtras, [campo.id]: val })}
            required={campo.obrigatorio}
          >
            <SelectTrigger>
              <SelectValue placeholder={campo.placeholder || 'Selecione uma opção'} />
            </SelectTrigger>
            <SelectContent>
              {campo.opcoes?.map(opcao => (
                <SelectItem key={opcao} value={opcao}>{opcao}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      case 'checkbox':
        return (
          <div className="flex items-center space-x-2">
            <Checkbox
              id={campo.id}
              checked={!!value}
              onCheckedChange={(checked) => setRespostasExtras({ ...respostasExtras, [campo.id]: checked })}
              required={campo.obrigatorio}
            />
            <label htmlFor={campo.id} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              {campo.label}
            </label>
          </div>
        );
      default:
        return null;
    }
  };

  if (verificandoInscricao) {
    return (
      <Button disabled className="bg-red-600 hover:bg-red-700">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        Verificando...
      </Button>
    );
  }

  if (jaInscrito) {
    return (
      <Button disabled className="bg-green-600 hover:bg-green-700">
        ✓ Inscrito no Processo Seletivo
      </Button>
    );
  }

  const handleOpenDialog = () => {
    console.log('Botão clicado! Abrindo dialog...');
    setOpen(true);
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      console.log('Dialog onOpenChange:', isOpen);
      setOpen(isOpen);
    }}>
      <DialogTrigger asChild>
        <Button 
          disabled={!entidadeId} 
          className="bg-red-600 hover:bg-red-700"
          onClick={handleOpenDialog}
        >
          Inscrever-se no Processo Seletivo
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Inscrição no Processo Seletivo</DialogTitle>
          <DialogDescription>
            Preencha os dados abaixo para se inscrever no processo seletivo.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Campos padrão */}
          <div>
            <Label htmlFor="nome">Nome Completo *</Label>
            <Input
              id="nome"
              value={formData.nome}
              onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
              required
            />
          </div>
          
          <div>
            <Label htmlFor="email">E-mail *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="curso">Curso</Label>
              <Input
                id="curso"
                value={formData.curso}
                onChange={(e) => setFormData({ ...formData, curso: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="semestre">Semestre</Label>
              <Input
                id="semestre"
                type="number"
                value={formData.semestre}
                onChange={(e) => setFormData({ ...formData, semestre: e.target.value })}
                min="1"
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="area_interesse">Área de Interesse</Label>
            {areasPS.length > 0 ? (
              <Select
                value={formData.area_interesse}
                onValueChange={(value) => setFormData({ ...formData, area_interesse: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma área" />
                </SelectTrigger>
                <SelectContent>
                  {areasPS.map(area => (
                    <SelectItem key={area} value={area}>
                      {area}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <>
                <Input
                  id="area_interesse"
                  value={formData.area_interesse}
                  onChange={(e) => setFormData({ ...formData, area_interesse: e.target.value })}
                  placeholder="Ex: Marketing, Finanças, Projetos..."
                />
                <p className="text-xs text-muted-foreground text-yellow-600 mt-1">
                  Nenhuma área disponível no processo seletivo
                </p>
              </>
            )}
          </div>
          
          <div>
            <Label htmlFor="mensagem">Mensagem</Label>
            <Textarea
              id="mensagem"
              value={formData.mensagem}
              onChange={(e) => setFormData({ ...formData, mensagem: e.target.value })}
              placeholder="Por que você deseja fazer parte desta organização?"
              rows={3}
            />
          </div>
          
          {/* Campos personalizados do template */}
          {template?.campos_personalizados && template.campos_personalizados.length > 0 && (
            <>
              <div className="border-t pt-4 mt-4">
                <h3 className="text-lg font-semibold mb-4">Informações Adicionais</h3>
              </div>
              {template.campos_personalizados.map(campo => (
                <div key={campo.id}>
                  {campo.tipo !== 'checkbox' && (
                    <Label htmlFor={campo.id}>
                      {campo.label} {campo.obrigatorio && <span className="text-red-500">*</span>}
                    </Label>
                  )}
                  {renderCampoPersonalizado(campo)}
                </div>
              ))}
            </>
          )}
          
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading} className="bg-red-600 hover:bg-red-700">
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Enviar Inscrição
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}


