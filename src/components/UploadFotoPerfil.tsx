import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Camera, Upload, X, ImageIcon } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface UploadFotoPerfilProps {
  entidadeId: number;
  onFotoUpdated: (url: string) => void;
  currentFotoUrl?: string | null;
  disabled?: boolean;
}

export const UploadFotoPerfil: React.FC<UploadFotoPerfilProps> = ({
  entidadeId,
  onFotoUpdated,
  currentFotoUrl,
  disabled = false
}) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Inicializar preview com a foto atual se existir
  useEffect(() => {
    if (currentFotoUrl) {
      setPreviewUrl(currentFotoUrl);
    }
  }, [currentFotoUrl]);

  // Debug: monitorar mudanças no previewUrl
  useEffect(() => {
    console.log('🖼️ Preview URL mudou:', previewUrl);
  }, [previewUrl]);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    console.log('🔐 Status da autenticação:', { session: !!session, userId: session?.user?.id });
    return session;
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    console.log('📁 Arquivo selecionado:', file);
    if (!file) return;

    // Validar tipo de arquivo
    if (!file.type.startsWith('image/')) {
      console.log('❌ Tipo de arquivo inválido:', file.type);
      toast({
        title: "Tipo de arquivo inválido",
        description: "Por favor, selecione apenas arquivos de imagem.",
        variant: "destructive"
      });
      return;
    }

    // Validar tamanho (5MB)
    if (file.size > 5 * 1024 * 1024) {
      console.log('❌ Arquivo muito grande:', file.size);
      toast({
        title: "Arquivo muito grande",
        description: "Por favor, selecione uma imagem menor que 5MB.",
        variant: "destructive"
      });
      return;
    }

    console.log('✅ Arquivo válido, criando preview...');
    // Criar preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string);
      console.log('✅ Preview criado');
    };
    reader.readAsDataURL(file);
  };

  const uploadFoto = async (file: File) => {
    try {
      console.log('🚀 Iniciando upload da foto...');
      console.log('📋 Dados do upload:', { entidadeId, fileName: file.name, fileSize: file.size });
      
      // Verificar autenticação
      const session = await checkAuth();
      if (!session) {
        throw new Error('Usuário não está autenticado. Faça login novamente.');
      }
      
      setIsUploading(true);

      // Gerar nome único para o arquivo
      const fileExt = file.name.split('.').pop();
      const fileName = `${entidadeId}-${Date.now()}.${fileExt}`;
      const filePath = `entidades-fotos/${fileName}`;
      
      console.log('📁 Caminho do arquivo:', filePath);

      // Upload para o Supabase Storage
      console.log('📤 Fazendo upload para o Supabase Storage...');
      const { data, error } = await supabase.storage
        .from('entidades-fotos')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      console.log('📥 Resposta do upload:', { data, error });

      if (error) {
        console.error('❌ Erro no upload:', error);
        throw error;
      }

      console.log('✅ Upload realizado com sucesso, obtendo URL pública...');
      // Obter URL pública
      const { data: { publicUrl } } = supabase.storage
        .from('entidades-fotos')
        .getPublicUrl(filePath);

      console.log('🔗 URL pública:', publicUrl);

      // Atualizar URL no banco de dados
      console.log('💾 Atualizando URL no banco de dados...');
      const { error: updateError } = await supabase
        .from('entidades')
        .update({ foto_perfil_url: publicUrl })
        .eq('id', entidadeId);

      console.log('📊 Resposta da atualização:', { updateError });

      if (updateError) {
        console.error('❌ Erro na atualização do banco:', updateError);
        throw updateError;
      }

      console.log('✅ Foto atualizada com sucesso!');
      setUploadSuccess(true);
      onFotoUpdated(publicUrl);
      
      // Resetar o estado após um delay
      setTimeout(() => {
        setUploadSuccess(false);
        setPreviewUrl(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }, 2000);
      
      toast({
        title: "✅ Foto atualizada com sucesso!",
        description: "A foto de perfil da organização foi atualizada.",
      });

    } catch (error) {
      console.error('❌ Erro ao fazer upload:', error);
      
      let errorMessage = "Não foi possível fazer o upload da foto. Tente novamente.";
      
      if (error instanceof Error) {
        if (error.message.includes('Bucket de storage não configurado')) {
          errorMessage = "Storage não configurado. Execute o script SQL primeiro.";
        } else if (error.message.includes('permission')) {
          errorMessage = "Sem permissão para fazer upload. Verifique se está logado.";
        } else if (error.message.includes('não está autenticado')) {
          errorMessage = "Sessão expirada. Faça login novamente.";
        } else {
          errorMessage = error.message;
        }
      }
      
      toast({
        title: "Erro ao fazer upload",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleUpload = async () => {
    const file = fileInputRef.current?.files?.[0];
    if (!file) {
      toast({
        title: "Nenhum arquivo selecionado",
        description: "Por favor, selecione uma foto primeiro.",
        variant: "destructive"
      });
      return;
    }

    await uploadFoto(file);
  };

  const removeFoto = async () => {
    try {
      setIsUploading(true);

      // Remover do banco de dados
      const { error } = await supabase
        .from('entidades')
        .update({ foto_perfil_url: null })
        .eq('id', entidadeId);

      if (error) {
        throw error;
      }

      setPreviewUrl(null);
      onFotoUpdated('');
      
      toast({
        title: "Foto removida",
        description: "A foto de perfil foi removida com sucesso.",
      });

    } catch (error) {
      console.error('Erro ao remover foto:', error);
      toast({
        title: "Erro ao remover foto",
        description: "Não foi possível remover a foto. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  const triggerFileInput = () => {
    console.log('🖱️ Botão clicado, acionando input de arquivo...');
    console.log('📁 Referência do input:', fileInputRef.current);
    fileInputRef.current?.click();
    console.log('✅ Input acionado');
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Mensagem de sucesso */}
          {uploadSuccess && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <p className="text-sm text-green-800 font-medium">
                  Foto atualizada com sucesso! O modal será fechado automaticamente.
                </p>
              </div>
            </div>
          )}
          
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Foto de Perfil</h3>
            {previewUrl && (
              <Button
                variant="ghost"
                size="sm"
                onClick={removeFoto}
                disabled={isUploading || disabled || uploadSuccess}
                className="text-red-600 hover:text-red-700"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>

          {/* Preview da foto */}
          <div className="flex justify-center">
            <div className="relative">
              <div className={`w-32 h-32 rounded-full overflow-hidden bg-gray-100 border-2 flex items-center justify-center transition-all duration-300 ${
                uploadSuccess 
                  ? 'border-green-500 bg-green-50' 
                  : 'border-red-200'
              }`}>
                {previewUrl ? (
                  <img
                    src={previewUrl}
                    alt="Foto de perfil"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Camera className="w-12 h-12 text-gray-400" />
                )}
                
                {/* Overlay de sucesso */}
                {uploadSuccess && (
                  <div className="absolute inset-0 bg-green-500 bg-opacity-20 flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-1">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <p className="text-xs text-green-700 font-semibold">Sucesso!</p>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Overlay de upload */}
              {!previewUrl && !uploadSuccess && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <ImageIcon className="w-8 h-8 text-gray-500 mx-auto mb-2" />
                    <p className="text-xs text-gray-500">Sem foto</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Botões de ação */}
          <div className="space-y-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
             
            {!previewUrl ? (
              <Button
                onClick={triggerFileInput}
                disabled={isUploading || disabled || uploadSuccess}
                className="w-full bg-red-600 hover:bg-red-700"
              >
                <Upload className="w-4 h-4 mr-2" />
                Selecionar Foto
              </Button>
            ) : (
              <div className="space-y-2">
                <Button
                  onClick={triggerFileInput}
                  disabled={isUploading || disabled || uploadSuccess}
                  variant="outline"
                  className="w-full border-red-600 text-red-600 hover:bg-red-50"
                >
                  <Camera className="w-4 h-4 mr-2" />
                  Trocar Foto
                </Button>
                 
                <Button
                  onClick={handleUpload}
                  disabled={isUploading || disabled || uploadSuccess}
                  className="w-full bg-red-600 hover:bg-red-700"
                >
                  {isUploading ? (
                    <>
                      <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Fazendo upload...
                    </>
                  ) : uploadSuccess ? (
                    <>
                      <svg className="w-4 h-4 mr-2 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Foto salva!
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2" />
                      Salvar Foto
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>

          {/* Informações */}
          <div className="text-xs text-gray-500 text-center">
            <p>Formatos aceitos: JPG, PNG, GIF</p>
            <p>Tamanho máximo: 5MB</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}; 