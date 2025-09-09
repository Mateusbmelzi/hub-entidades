import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Camera, Upload, X, ImageIcon, Building2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface UploadLogoEmpresaProps {
  empresaId: number;
  onLogoUpdated: (url: string) => void;
  currentLogoUrl?: string | null;
  disabled?: boolean;
}

export const UploadLogoEmpresa: React.FC<UploadLogoEmpresaProps> = ({
  empresaId,
  onLogoUpdated,
  currentLogoUrl,
  disabled = false
}) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Inicializar preview com a logo atual se existir
  useEffect(() => {
    if (currentLogoUrl) {
      setPreviewUrl(currentLogoUrl);
    }
  }, [currentLogoUrl]);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    return session;
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validar tipo de arquivo
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Tipo de arquivo inválido",
        description: "Por favor, selecione apenas arquivos de imagem.",
        variant: "destructive"
      });
      return;
    }

    // Validar tamanho (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Arquivo muito grande",
        description: "Por favor, selecione uma imagem menor que 5MB.",
        variant: "destructive"
      });
      return;
    }

    // Criar preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const uploadLogo = async (file: File) => {
    try {
      // Verificar autenticação
      const session = await checkAuth();
      if (!session) {
        throw new Error('Usuário não está autenticado. Faça login novamente.');
      }
      
      setIsUploading(true);

      // Gerar nome único para o arquivo
      const fileExt = file.name.split('.').pop();
      const fileName = `${empresaId}-${Date.now()}.${fileExt}`;
      const filePath = `empresas-logos/${fileName}`;

      // Upload para o Supabase Storage
      const { data, error } = await supabase.storage
        .from('empresas-logos')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        throw error;
      }

      // Obter URL pública
      const { data: { publicUrl } } = supabase.storage
        .from('empresas-logos')
        .getPublicUrl(filePath);

      // Atualizar URL no banco de dados
      const { error: updateError } = await supabase
        .from('empresas_parceiras')
        .update({ logo_url: publicUrl })
        .eq('id', empresaId);

      if (updateError) {
        throw updateError;
      }

      setUploadSuccess(true);
      onLogoUpdated(publicUrl);
      
      // Resetar o estado após um delay
      setTimeout(() => {
        setUploadSuccess(false);
        setPreviewUrl(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }, 2000);
      
      toast({
        title: "✅ Logo atualizada com sucesso!",
        description: "A logo da empresa foi atualizada.",
      });

    } catch (error) {
      console.error('Erro ao fazer upload:', error);
      
      let errorMessage = "Não foi possível fazer o upload da logo. Tente novamente.";
      
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
        description: "Por favor, selecione uma logo primeiro.",
        variant: "destructive"
      });
      return;
    }

    await uploadLogo(file);
  };

  const removeLogo = async () => {
    try {
      setIsUploading(true);

      // Remover do banco de dados
      const { error } = await supabase
        .from('empresas_parceiras')
        .update({ logo_url: null })
        .eq('id', empresaId);

      if (error) {
        throw error;
      }

      setPreviewUrl(null);
      onLogoUpdated('');
      
      toast({
        title: "Logo removida",
        description: "A logo da empresa foi removida com sucesso.",
      });

    } catch (error) {
      console.error('Erro ao remover logo:', error);
      toast({
        title: "Erro ao remover logo",
        description: "Não foi possível remover a logo. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Mensagem de sucesso */}
          {uploadSuccess && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <p className="text-sm text-green-800 font-medium">
                  Logo atualizada com sucesso!
                </p>
              </div>
            </div>
          )}
          
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-900">Logo da Empresa</h3>
            {previewUrl && (
              <Button
                variant="ghost"
                size="sm"
                onClick={removeLogo}
                disabled={isUploading || disabled || uploadSuccess}
                className="text-red-600 hover:text-red-700 h-6 px-2"
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>

          {/* Preview da logo */}
          <div className="flex justify-center">
            <div className="relative">
              <div className={`w-16 h-16 rounded-lg overflow-hidden bg-gray-100 border-2 flex items-center justify-center transition-all duration-300 ${
                uploadSuccess 
                  ? 'border-green-500 bg-green-50' 
                  : 'border-gray-200'
              }`}>
                {previewUrl ? (
                  <img
                    src={previewUrl}
                    alt="Logo da empresa"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Building2 className="w-6 h-6 text-gray-400" />
                )}
                
                {/* Overlay de sucesso */}
                {uploadSuccess && (
                  <div className="absolute inset-0 bg-green-500 bg-opacity-20 flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-1">
                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <p className="text-xs text-green-700 font-semibold">Sucesso!</p>
                    </div>
                  </div>
                )}
              </div>
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
                className="w-full bg-blue-600 hover:bg-blue-700 h-8 text-sm"
              >
                <Upload className="w-3 h-3 mr-1" />
                Selecionar Logo
              </Button>
            ) : (
              <div className="space-y-1">
                <Button
                  onClick={triggerFileInput}
                  disabled={isUploading || disabled || uploadSuccess}
                  variant="outline"
                  className="w-full border-blue-600 text-blue-600 hover:bg-blue-50 h-7 text-sm"
                >
                  <Camera className="w-3 h-3 mr-1" />
                  Trocar Logo
                </Button>
                 
                <Button
                  onClick={handleUpload}
                  disabled={isUploading || disabled || uploadSuccess}
                  className="w-full bg-blue-600 hover:bg-blue-700 h-7 text-sm"
                >
                  {isUploading ? (
                    <>
                      <div className="w-3 h-3 mr-1 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Fazendo upload...
                    </>
                  ) : uploadSuccess ? (
                    <>
                      <svg className="w-3 h-3 mr-1 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Logo salva!
                    </>
                  ) : (
                    <>
                      <Upload className="w-3 h-3 mr-1" />
                      Salvar Logo
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>

          {/* Informações */}
          <div className="text-xs text-gray-500 text-center">
            <p>Formatos: JPG, PNG, GIF, WebP</p>
            <p>Tamanho máximo: 5MB</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
