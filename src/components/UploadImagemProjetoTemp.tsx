import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Upload, X, ImageIcon, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface UploadImagemProjetoTempProps {
  onImagemSelected: (url: string) => void;
  currentImagemUrl?: string | null;
  disabled?: boolean;
}

export const UploadImagemProjetoTemp: React.FC<UploadImagemProjetoTempProps> = ({
  onImagemSelected,
  currentImagemUrl,
  disabled = false
}) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentImagemUrl || null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validar tipo de arquivo
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Tipo de arquivo inválido",
        description: "Por favor, selecione apenas imagens (JPEG, PNG, GIF, WebP ou SVG).",
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

    // Fazer upload automaticamente após seleção
    await uploadImagem(file);
  };

  const uploadImagem = async (file: File) => {
    try {
      // Verificar autenticação
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Usuário não está autenticado. Faça login novamente.');
      }
      
      setIsUploading(true);

      // Gerar nome único para o arquivo
      const fileExt = file.name.split('.').pop();
      const fileName = `temp-${Date.now()}.${fileExt}`;
      const filePath = `projetos-fotos/${fileName}`;

      // Upload para o Supabase Storage
      const { data, error } = await supabase.storage
        .from('projetos-fotos')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        throw error;
      }

      // Obter URL pública
      const { data: { publicUrl } } = supabase.storage
        .from('projetos-fotos')
        .getPublicUrl(filePath);

      setUploadSuccess(true);
      onImagemSelected(publicUrl);
      
      // Resetar o estado após um delay
      setTimeout(() => {
        setUploadSuccess(false);
      }, 2000);
      
      toast({
        title: "✅ Imagem selecionada!",
        description: "A imagem será associada ao projeto quando você criar o projeto.",
      });

    } catch (error: any) {
      console.error('Erro ao fazer upload:', error);
      
      let errorMessage = "Não foi possível fazer o upload da imagem. Tente novamente.";
      
      if (error instanceof Error) {
        if (error.message.includes('permission')) {
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
        description: "Por favor, selecione uma imagem primeiro.",
        variant: "destructive"
      });
      return;
    }

    await uploadImagem(file);
  };

  const removeImagem = () => {
    setPreviewUrl(null);
    onImagemSelected('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">Imagem do Projeto (Opcional)</label>
        {previewUrl && !disabled && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={removeImagem}
            disabled={isUploading}
            className="text-destructive hover:text-destructive"
          >
            <X className="h-4 w-4 mr-1" />
            Remover
          </Button>
        )}
      </div>

      <div className="flex flex-col items-center justify-center w-full">
        {previewUrl ? (
          <div className="relative w-full max-w-md">
            <div className="relative aspect-video rounded-lg overflow-hidden border-2 border-dashed border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
              <img
                src={previewUrl}
                alt="Preview da imagem do projeto"
                className="w-full h-full object-cover"
              />
              {uploadSuccess && (
                <div className="absolute inset-0 bg-green-500/20 flex items-center justify-center">
                  <div className="bg-green-500 text-white px-4 py-2 rounded-md font-medium">
                    ✓ Upload concluído!
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div
            className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg cursor-pointer hover:border-gray-400 dark:hover:border-gray-600 transition-colors bg-gray-50 dark:bg-gray-900"
            onClick={() => !disabled && fileInputRef.current?.click()}
          >
            <ImageIcon className="w-12 h-12 text-gray-400 mb-2" />
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
              Clique para fazer upload de uma imagem
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500">
              JPEG, PNG, GIF, WebP ou SVG (máx. 5MB)
            </p>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/gif,image/webp,image/svg+xml"
          onChange={handleFileSelect}
          className="hidden"
          disabled={disabled || isUploading}
        />

        {previewUrl && !disabled && (
          <div className="flex gap-2 mt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
            >
              <Upload className="h-4 w-4 mr-2" />
              Trocar Imagem
            </Button>
            {!uploadSuccess && previewUrl && (
              <Button
                type="button"
                onClick={handleUpload}
                disabled={isUploading || !fileInputRef.current?.files?.[0]}
              >
                {isUploading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Enviar Imagem
                  </>
                )}
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

