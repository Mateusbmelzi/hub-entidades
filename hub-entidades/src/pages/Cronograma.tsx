import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, MapPin } from "lucide-react";

interface Evento {
  id: string;
  titulo: string;
  descricao: string;
  data: string;
  hora: string;
  local: string;
  status: "agendado" | "em_andamento" | "concluido" | "cancelado";
  tipo: "palestra" | "workshop" | "reuniao" | "outro";
}

const Cronograma = () => {
  const [eventos] = useState<Evento[]>([
    {
      id: "1",
      titulo: "Workshop de Inovação",
      descricao: "Workshop sobre metodologias de inovação e design thinking",
      data: "2024-01-15",
      hora: "14:00",
      local: "Auditório Principal",
      status: "agendado",
      tipo: "workshop"
    },
    {
      id: "2",
      titulo: "Palestra: Futuro da Tecnologia",
      descricao: "Discussão sobre tendências tecnológicas e seu impacto na sociedade",
      data: "2024-01-16",
      hora: "10:00",
      local: "Sala de Conferências",
      status: "agendado",
      tipo: "palestra"
    },
    {
      id: "3",
      titulo: "Reunião de Planejamento",
      descricao: "Reunião para planejamento estratégico do próximo trimestre",
      data: "2024-01-14",
      hora: "16:00",
      local: "Sala de Reuniões",
      status: "concluido",
      tipo: "reuniao"
    }
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "agendado":
        return "bg-red-100 text-red-800";
      case "em_andamento":
        return "bg-yellow-100 text-yellow-800";
      case "concluido":
        return "bg-green-100 text-green-800";
      case "cancelado":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getTipoColor = (tipo: string) => {
    switch (tipo) {
      case "palestra":
        return "bg-purple-100 text-purple-800";
      case "workshop":
        return "bg-orange-100 text-orange-800";
      case "reuniao":
        return "bg-indigo-100 text-indigo-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Cronograma</h1>
        <p className="text-gray-600">Acompanhe os eventos e atividades programadas</p>
      </div>

      <div className="grid gap-6">
        {eventos.map((evento) => (
          <Card key={evento.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-xl mb-2">{evento.titulo}</CardTitle>
                  <CardDescription className="text-gray-600 mb-3">
                    {evento.descricao}
                  </CardDescription>
                </div>
                <div className="flex flex-col gap-2 ml-4">
                  <Badge className={getStatusColor(evento.status)}>
                    {evento.status.replace('_', ' ')}
                  </Badge>
                  <Badge className={getTipoColor(evento.tipo)}>
                    {evento.tipo}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-600">
                    {formatDate(evento.data)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-600">
                    {evento.hora}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-600">
                    {evento.local}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {eventos.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Calendar className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Nenhum evento programado
            </h3>
            <p className="text-gray-600 text-center">
              Não há eventos no cronograma no momento.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Cronograma; 