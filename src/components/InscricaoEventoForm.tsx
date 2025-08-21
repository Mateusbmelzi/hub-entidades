import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { User, Mail, Phone } from 'lucide-react';
import { useInscricaoEvento } from '@/hooks/useInscricaoEvento';

interface InscricaoEventoFormProps {
  eventoId: string;
  eventoNome: string;
  link_evento: string; 
  onSuccess: () => void;
}
// console.log(link_evento)

export default function InscricaoEventoForm({ eventoId, eventoNome, link_evento, onSuccess}: InscricaoEventoFormProps) {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  
  const { inscreverEvento, loading, user, profile } = useInscricaoEvento();

  // Preencher automaticamente com dados do perfil do usuário
  useEffect(() => {
    if (profile) {
      setNome(profile.nome || '');
      setEmail(profile.email || user?.email || '');
      setTelefone(profile.celular || '');
    }
  }, [profile, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Primeiro, salvar na tabela participantes_evento
      const result = await inscreverEvento(eventoId, {
        nome_participante: nome,
        email: email || undefined,
        telefone: telefone || undefined
      });
      
      if (result.success) {
        // Após salvar com sucesso, abrir o link externo em uma nova aba
        window.open(link_evento, '_blank');
        
        // Chamar onSuccess para fechar o modal e atualizar a interface
        onSuccess();
      }
    } catch (error) {
      console.error('❌ Erro ao processar inscrição:', error);
      // Mesmo com erro, tentar abrir o link para não bloquear o usuário
      window.open(link_evento, '_blank');
    }
  };

  const handleGotoExternalLink = () => {
  };


  return (
    <>
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Inscrever-se no Evento
        </DialogTitle>
        <DialogDescription>
          Complete seus dados para se inscrever em "{eventoNome}"
        </DialogDescription>
      </DialogHeader>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="nome">Nome Completo</Label>
          <Input
            id="nome"
            type="text"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            placeholder="Seu nome completo"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email" className="flex items-center">
            <Mail className="mr-1 h-4 w-4" />
            Email (opcional)
          </Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="seu.email@exemplo.com"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="telefone" className="flex items-center">
            <Phone className="mr-1 h-4 w-4" />
            Telefone (opcional)
          </Label>
          <Input
            id="telefone"
            type="tel"
            value={telefone}
            onChange={(e) => setTelefone(e.target.value)}
            placeholder="(11) 99999-9999"
          />
        </div>

        <div className="flex gap-3 pt-4">
          <Button type='submit'  className='flex-1'>
            {loading ? 'Abrindo...' : 'Ir para Página do Evento'}
          </Button>
        </div>
      </form>
    </>
  );
}