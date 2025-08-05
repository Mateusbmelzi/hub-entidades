import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Shield, Check, X, GraduationCap, Database, Eye, Mail, Users, ExternalLink } from 'lucide-react';

interface TermosModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAccept: () => void;
}

const TermosModal: React.FC<TermosModalProps> = ({ isOpen, onClose, onAccept }) => {
  const [hasAccepted, setHasAccepted] = useState(false);

  const handleAccept = () => {
    if (hasAccepted) {
      onAccept();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0">
        <DialogHeader className="p-6 pb-4 border-b">
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Shield className="w-5 h-5 text-insper-red" />
            Termos de Uso e Política de Privacidade
          </DialogTitle>
          <p className="text-sm text-insper-dark-gray">
            Leia atentamente os termos antes de prosseguir com o cadastro
          </p>
        </DialogHeader>

        <ScrollArea className="h-[60vh] p-6">
          <div className="space-y-6">
            {/* Quem Somos */}
            <section>
              <h2 className="text-lg font-semibold text-insper-black mb-3 flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Quem Somos?
              </h2>
              <p className="text-insper-dark-gray leading-relaxed mb-4 text-sm">
                Esta plataforma foi idealizada e desenvolvida por dois alunos do Insper com o objetivo de 
                transformar a experiência estudantil por meio da tecnologia e da centralização das informações 
                das Organizações Estudantis da instituição.
              </p>
              
              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div className="bg-insper-light-gray p-3 rounded-lg">
                  <h3 className="font-semibold text-insper-black mb-1 flex items-center gap-2">
                    <GraduationCap className="w-3 h-3" />
                    Mateus Bellon Melzi
                  </h3>
                  <p className="text-xs text-insper-dark-gray">
                    Aluno do curso de Administração no Insper, responsável pela concepção do projeto, 
                    gestão estratégica e integração com as entidades estudantis e a instituição.
                  </p>
                </div>
                
                <div className="bg-insper-light-gray p-3 rounded-lg">
                  <h3 className="font-semibold text-insper-black mb-1 flex items-center gap-2">
                    <GraduationCap className="w-3 h-3" />
                    Gabriel Pradyumna Alencar Costa
                  </h3>
                  <p className="text-xs text-insper-dark-gray">
                    Aluno do curso de Ciência da Computação no Insper, responsável pelo desenvolvimento 
                    técnico da plataforma e pela implementação das funcionalidades do sistema.
                  </p>
                </div>
              </div>
              
              <div className="bg-insper-red/5 border border-insper-red/20 p-3 rounded-lg">
                <p className="text-xs text-insper-dark-gray">
                  <strong>Nota Importante:</strong> Nós atuaremos como controladores de dados pessoais, 
                  cada um em sua pessoa física, nesta etapa de desenvolvimento da plataforma. Uma vez 
                  criada uma pessoa jurídica para a plataforma, essa PJ passará a ser controlador desses dados pessoais.
                </p>
              </div>
            </section>

            {/* Por que pedimos seus dados */}
            <section>
              <h2 className="text-lg font-semibold text-insper-black mb-3 flex items-center gap-2">
                <Database className="w-4 h-4" />
                Por que pedimos seus dados no cadastro?
              </h2>
              <p className="text-insper-dark-gray leading-relaxed mb-3 text-sm">
                Ao se cadastrar na plataforma, solicitamos algumas informações como nome, e-mail 
                institucional, data de nascimento, curso, semestre, telefone e áreas de interesse. 
                Esses dados são necessários para:
              </p>
              
              <ul className="space-y-1 mb-3">
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-insper-red rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-xs text-insper-dark-gray">Classificar sua posição e relação com Insper (curso, semestre e afins)</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-insper-red rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-xs text-insper-dark-gray">Personalizar sua experiência na plataforma com base no seu perfil acadêmico e interesses</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-insper-red rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-xs text-insper-dark-gray">Facilitar sua conexão com eventos, oportunidades e organizações estudantis mais relevantes</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-insper-red rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-xs text-insper-dark-gray">Gerar análises e dados agregados que ajudam a melhorar a vivência estudantil no Insper</span>
                </li>
              </ul>

              <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg mb-3">
                <h3 className="font-semibold text-insper-black mb-1 text-sm">Uso dos Dados</h3>
                <p className="text-xs text-insper-dark-gray mb-2">
                  Seus dados não serão compartilhados com terceiros para fins comerciais. Serão utilizados 
                  para gerar relatórios agregados compartilhados com o Insper para melhorias no ecossistema acadêmico.
                </p>
                <p className="text-xs text-insper-dark-gray">
                  O Insper não realizará atividades de tratamento de dados pessoais diretamente, apenas receberá 
                  os dados agrupados, sem a possibilidade de identificação de titulares.
                </p>
              </div>
            </section>

            {/* Seus Direitos */}
            <section>
              <h2 className="text-lg font-semibold text-insper-black mb-3 flex items-center gap-2">
                <Eye className="w-4 h-4" />
                Seus Direitos
              </h2>
              <p className="text-insper-dark-gray leading-relaxed mb-3 text-sm">
                Você, como titular de dados pessoais possui direitos previstos pela LGPD, incluindo:
              </p>
              
              <div className="grid grid-cols-1 gap-2">
                <div className="flex items-center gap-2">
                  <Check className="w-3 h-3 text-insper-red" />
                  <span className="text-xs text-insper-dark-gray">Confirmação da existência de tratamento de dados</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-3 h-3 text-insper-red" />
                  <span className="text-xs text-insper-dark-gray">Acesso e correção dos dados</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-3 h-3 text-insper-red" />
                  <span className="text-xs text-insper-dark-gray">Eliminação e portabilidade dos dados</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-3 h-3 text-insper-red" />
                  <span className="text-xs text-insper-dark-gray">Revogação de consentimento</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-3 h-3 text-insper-red" />
                  <span className="text-xs text-insper-dark-gray">Informação sobre compartilhamento de dados</span>
                </div>
              </div>
            </section>

            {/* Contato */}
            <section>
              <h2 className="text-lg font-semibold text-insper-black mb-3 flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Contato
              </h2>
              <p className="text-sm text-insper-dark-gray mb-2">
                Para exercer seus direitos ou esclarecer dúvidas:
              </p>
              <div className="bg-insper-light-gray p-3 rounded-lg">
                <p className="text-sm font-medium text-insper-black">mateusbm@al.insper.edu.br</p>
                <p className="text-xs text-insper-dark-gray">Telefone: (17) 99285-2877</p>
              </div>
            </section>

            {/* Relação com Insper */}
            <section>
              <h2 className="text-lg font-semibold text-insper-black mb-3 flex items-center gap-2">
                <Users className="w-4 h-4" />
                Relação com o Insper
              </h2>
              <p className="text-sm text-insper-dark-gray mb-2">
                Para todos os fins, tanto Insper quanto o grupo de indivíduos atuará como Controlador dos dados 
                pessoais à medida de sua atuação. Você pode contatar o Insper ou consultar seu Aviso de 
                Privacidade em:
              </p>
              <a 
                href="https://www.insper.edu.br/pt/atendimento/portal-da-privacidade/aviso-de-privacidade" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-xs text-insper-red hover:text-insper-red/80 underline inline-flex items-center gap-1"
              >
                Portal da Privacidade do Insper
                <ExternalLink className="w-3 h-3" />
              </a>
            </section>
          </div>
        </ScrollArea>

        <div className="p-6 border-t bg-insper-light-gray">
          <div className="flex items-start space-x-3 mb-4">
            <Checkbox
              id="accept-terms"
              checked={hasAccepted}
              onCheckedChange={(checked) => setHasAccepted(checked as boolean)}
            />
            <Label htmlFor="accept-terms" className="text-sm text-insper-dark-gray leading-relaxed">
              Li e concordo com os <strong>Termos de Uso e Política de Privacidade</strong> descritos acima. 
              Entendo que meus dados serão tratados conforme descrito e que posso exercer meus direitos 
              a qualquer momento.
            </Label>
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              <X className="w-4 h-4 mr-2" />
              Cancelar
            </Button>
            <Button
              onClick={handleAccept}
              disabled={!hasAccepted}
              className="flex-1 bg-insper-red hover:bg-insper-red/90"
            >
              <Check className="w-4 h-4 mr-2" />
              Concordo e Continuar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TermosModal; 