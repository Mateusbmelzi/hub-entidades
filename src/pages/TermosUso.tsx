import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { GraduationCap, Shield, Users, Database, Eye, Mail, ExternalLink } from 'lucide-react';

const TermosUso: React.FC = () => {
  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-insper-black mb-2">
            Termos de Uso e Política de Privacidade
          </h1>
          <p className="text-insper-dark-gray">
            Última atualização: {new Date().toLocaleDateString('pt-BR')}
          </p>
        </div>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl text-insper-black flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Quem Somos?
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <section>
              <p className="text-insper-dark-gray leading-relaxed mb-4">
                Esta plataforma foi idealizada e desenvolvida por dois alunos do Insper com o objetivo de 
                transformar a experiência estudantil por meio da tecnologia e da centralização das informações 
                das Organizações Estudantis da instituição.
              </p>
              
              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div className="bg-insper-light-gray p-4 rounded-lg">
                  <h3 className="font-semibold text-insper-black mb-2 flex items-center gap-2">
                    <GraduationCap className="w-4 h-4" />
                    Mateus Bellon Melzi
                  </h3>
                  <p className="text-sm text-insper-dark-gray">
                    Aluno do curso de Administração no Insper, responsável pela concepção do projeto, 
                    gestão estratégica e integração com as entidades estudantis e a instituição.
                  </p>
                </div>
                
                <div className="bg-insper-light-gray p-4 rounded-lg">
                  <h3 className="font-semibold text-insper-black mb-2 flex items-center gap-2">
                    <GraduationCap className="w-4 h-4" />
                    Gabriel Pradyumna Alencar Costa
                  </h3>
                  <p className="text-sm text-insper-dark-gray">
                    Aluno do curso de Ciência da Computação no Insper, responsável pelo desenvolvimento 
                    técnico da plataforma e pela implementação das funcionalidades do sistema.
                  </p>
                </div>
              </div>
              
              <p className="text-insper-dark-gray leading-relaxed mb-4">
                Ambos atuam de forma direta na evolução do projeto, prezando pela ética, transparência e 
                segurança no tratamento dos dados dos usuários, em conformidade com a LGPD.
              </p>
              
              <div className="bg-insper-red/5 border border-insper-red/20 p-4 rounded-lg">
                <p className="text-sm text-insper-dark-gray">
                  <strong>Nota Importante:</strong> Nós atuaremos como controladores de dados pessoais, 
                  cada um em sua pessoa física, nesta etapa de desenvolvimento da plataforma. Uma vez 
                  criada uma pessoa jurídica para a plataforma, essa PJ passará a ser controlador desses dados pessoais.
                </p>
              </div>
            </section>

            <Separator />

            <section>
              <h2 className="text-lg font-semibold text-insper-black mb-3 flex items-center gap-2">
                <Database className="w-5 h-5" />
                Por que pedimos seus dados no cadastro?
              </h2>
              <p className="text-insper-dark-gray leading-relaxed mb-4">
                Ao se cadastrar na plataforma, solicitamos algumas informações como nome, e-mail 
                institucional, data de nascimento, curso, semestre, telefone e áreas de interesse. 
                Esses dados são necessários para que possamos:
              </p>
              
              <ul className="space-y-2 mb-4">
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-insper-red rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-insper-dark-gray">Classificar sua posição e relação com Insper (curso, semestre e afins);</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-insper-red rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-insper-dark-gray">Personalizar sua experiência na plataforma com base no seu perfil acadêmico e interesses;</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-insper-red rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-insper-dark-gray">Facilitar sua conexão com eventos, oportunidades e organizações estudantis mais relevantes para você;</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-insper-red rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-insper-dark-gray">Gerar análises e dados agregados que ajudam a melhorar a vivência estudantil no Insper, sempre de forma segura e responsável.</span>
                </li>
              </ul>

              <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg mb-4">
                <h3 className="font-semibold text-insper-black mb-2">Uso dos Dados</h3>
                <p className="text-sm text-insper-dark-gray mb-3">
                  Seus dados não serão compartilhados com terceiros para fins comerciais. No entanto, a 
                  infraestrutura da plataforma pode utilizar serviços de terceiros (como provedores de nuvem), 
                  que atuam como operadores de dados conforme a LGPD. Esses prestadores apenas processam 
                  os dados conforme nossas instruções, de maneira segura e controlada.
                </p>
                <p className="text-sm text-insper-dark-gray">
                  Seus dados serão utilizados para gerar relatórios com informações agregadas, que serão 
                  compartilhados com o Insper para os fins de melhoria no ambiente e ecossistema acadêmico, 
                  bem como para auxiliar com a integração entre as organizações estudantis.
                </p>
              </div>

              <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                <h3 className="font-semibold text-insper-black mb-2">Proteção de Dados</h3>
                <p className="text-sm text-insper-dark-gray">
                  O Insper não realizará atividades de tratamento de dados pessoais diretamente, apenas receberá 
                  os dados agrupados, sem a possibilidade de identificação de titulares.
                </p>
              </div>
            </section>

            <Separator />

            <section>
              <h2 className="text-lg font-semibold text-insper-black mb-3 flex items-center gap-2">
                <Eye className="w-5 h-5" />
                Seus Direitos
              </h2>
              <p className="text-insper-dark-gray leading-relaxed mb-4">
                Você, como titular de dados pessoais possui direitos previstos pela LGPD. Seus direitos são:
              </p>
              
              <div className="grid md:grid-cols-2 gap-3">
                <div className="flex items-start gap-2">
                  <Badge variant="outline" className="bg-insper-red/5 text-insper-red border-insper-red/20 text-xs">
                    ✓
                  </Badge>
                  <span className="text-sm text-insper-dark-gray">Confirmação da existência de tratamento de dados</span>
                </div>
                <div className="flex items-start gap-2">
                  <Badge variant="outline" className="bg-insper-red/5 text-insper-red border-insper-red/20 text-xs">
                    ✓
                  </Badge>
                  <span className="text-sm text-insper-dark-gray">Acesso aos dados</span>
                </div>
                <div className="flex items-start gap-2">
                  <Badge variant="outline" className="bg-insper-red/5 text-insper-red border-insper-red/20 text-xs">
                    ✓
                  </Badge>
                  <span className="text-sm text-insper-dark-gray">Correção de dados incompletos, inexatos ou desatualizados</span>
                </div>
                <div className="flex items-start gap-2">
                  <Badge variant="outline" className="bg-insper-red/5 text-insper-red border-insper-red/20 text-xs">
                    ✓
                  </Badge>
                  <span className="text-sm text-insper-dark-gray">Anonimização, bloqueio ou eliminação de dados desnecessários, excessivos ou tratados em desconformidade com a LGPD</span>
                </div>
                <div className="flex items-start gap-2">
                  <Badge variant="outline" className="bg-insper-red/5 text-insper-red border-insper-red/20 text-xs">
                    ✓
                  </Badge>
                  <span className="text-sm text-insper-dark-gray">Portabilidade dos dados a outro fornecedor de serviço ou produto, mediante requisição expressa</span>
                </div>
                <div className="flex items-start gap-2">
                  <Badge variant="outline" className="bg-insper-red/5 text-insper-red border-insper-red/20 text-xs">
                    ✓
                  </Badge>
                  <span className="text-sm text-insper-dark-gray">Eliminação de dados tratados com seu consentimento</span>
                </div>
                <div className="flex items-start gap-2">
                  <Badge variant="outline" className="bg-insper-red/5 text-insper-red border-insper-red/20 text-xs">
                    ✓
                  </Badge>
                  <span className="text-sm text-insper-dark-gray">Revogação de consentimento anteriormente fornecido</span>
                </div>
                <div className="flex items-start gap-2">
                  <Badge variant="outline" className="bg-insper-red/5 text-insper-red border-insper-red/20 text-xs">
                    ✓
                  </Badge>
                  <span className="text-sm text-insper-dark-gray">Informação das entidades públicas e privadas com as quais o controlador realizou uso compartilhado de dados</span>
                </div>
              </div>
            </section>

            <Separator />

            <section>
              <h2 className="text-lg font-semibold text-insper-black mb-3 flex items-center gap-2">
                <Mail className="w-5 h-5" />
                Contato e Exercício de Direitos
              </h2>
              <p className="text-insper-dark-gray leading-relaxed mb-4">
                Você poderá exercer seus direitos a qualquer tempo e de maneira gratuita, por meio de nosso 
                canal de privacidade:
              </p>
              
              <div className="bg-insper-light-gray p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Mail className="w-4 h-4 text-insper-red" />
                  <span className="font-medium text-insper-black">mateusbm@al.insper.edu.br</span>
                </div>
                <p className="text-sm text-insper-dark-gray">
                  Telefone: (17) 99285-2877
                </p>
              </div>
              
              <p className="text-sm text-insper-dark-gray mt-4">
                As informações serão utilizadas apenas para os fins descritos aqui, respeitando os princípios 
                de necessidade, transparência e segurança. Este aviso pode ser atualizado a qualquer momento 
                e suas disposições sempre ficarão à disposição para consulta na plataforma, sem prejuízo de eventuais 
                comunicados de atualização.
              </p>
            </section>

            <Separator />

            <section>
              <h2 className="text-lg font-semibold text-insper-black mb-3 flex items-center gap-2">
                <Users className="w-5 h-5" />
                Relação com o Insper
              </h2>
              <p className="text-insper-dark-gray leading-relaxed">
                Para todos os fins, tanto Insper quanto o grupo de indivíduos atuará como Controlador dos dados 
                pessoais à medida de sua atuação. Você pode contatar o Insper ou consultar seu Aviso de 
                Privacidade neste endereço:{' '}
                <a 
                  href="https://www.insper.edu.br/pt/atendimento/portal-da-privacidade/aviso-de-privacidade" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-insper-red hover:text-insper-red/80 underline inline-flex items-center gap-1"
                >
                  https://www.insper.edu.br/pt/atendimento/portal-da-privacidade/aviso-de-privacidade
                  <ExternalLink className="w-3 h-3" />
                </a>
              </p>
            </section>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TermosUso; 