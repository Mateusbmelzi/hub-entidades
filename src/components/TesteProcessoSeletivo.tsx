import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import BotaoInscreverEntidade from './BotaoInscreverEntidade';
import ListaInscricoesEntidade from './ListaInscricoesEntidade';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, ClipboardList } from 'lucide-react';

interface Props {
  entidadeId: number;
}

export default function TesteProcessoSeletivo({ entidadeId }: Props) {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Processo Seletivo</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="inscrever" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="inscrever">
              <ClipboardList className="h-4 w-4 mr-2" />
              Inscrever-se
            </TabsTrigger>
            <TabsTrigger value="gerenciar">
              <Users className="h-4 w-4 mr-2" />
              Gerenciar Inscrições
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="inscrever" className="mt-6">
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Envie sua candidatura para fazer parte desta organização estudantil.
              </p>
              <BotaoInscreverEntidade entidadeId={entidadeId} />
            </div>
          </TabsContent>
          
          <TabsContent value="gerenciar" className="mt-6">
            <ListaInscricoesEntidade entidadeId={entidadeId} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
