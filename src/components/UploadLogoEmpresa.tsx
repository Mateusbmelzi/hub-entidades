import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface UploadLogoEmpresaProps {
  onLogoUploaded: (logoUrl: string) => void;
  currentLogo?: string;
  className?: string;
}

export const UploadLogoEmpresa: React.FC<UploadLogoEmpresaProps> = ({
  onLogoUploaded,
  currentLogo,
  className = '',
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(currentLogo || null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleFileUpload = async (file: File) => {
    // Validar tipo de arquivo
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Erro',
        description: 'Por favor, selecione apenas arquivos de imagem.',
        variant: 'destructive',
      });
      return;
    }

    // Validar tamanho (máximo 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      toast({
        title: 'Erro',
        description: 'O arquivo deve ter no máximo 5MB.',
        variant: 'destructive',
      });
      return;
    }

    setIsUploading(true);

    try {
      // Criar preview local
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);

      // Gerar nome único para o arquivo
      const fileExt = file.name.split('.').pop();
      const fileName = `empresa-logo-${Date.now()}.${fileExt}`;
      const filePath = `empresas-logos/${fileName}`;

      // Upload para o Supabase Storage
      const { data, error } = await supabase.storage
        .from('empresas-logos')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (error) {
        throw error;
      }

      // Obter URL pública
      const { data: { publicUrl } } = supabase.storage
        .from('empresas-logos')
        .getPublicUrl(filePath);

      onLogoUploaded(publicUrl);
      
      toast({
        title: 'Sucesso',
        description: 'Logo enviada com sucesso!',
      });

    } catch (error) {
      console.error('Erro no upload:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao enviar logo. Tente novamente.',
        variant: 'destructive',
      });
      setPreview(null);
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveLogo = () => {
    setPreview(null);
    onLogoUploaded('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div
        className={`
          border-2 border-dashed rounded-lg p-6 text-center transition-colors
          ${preview ? 'border-green-300 bg-green-50' : 'border-gray-300 hover:border-gray-400'}
          ${isUploading ? 'opacity-50 pointer-events-none' : 'cursor-pointer'}
        `}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
          disabled={isUploading}
        />

        {isUploading ? (
          <div className="flex flex-col items-center space-y-2">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            <p className="text-sm text-gray-600">Enviando logo...</p>
          </div>
        ) : preview ? (
          <div className="flex flex-col items-center space-y-2">
            <div className="relative">
              <img
                src={preview}
                alt="Preview da logo"
                className="h-20 w-20 object-cover rounded-lg border"
              />
              <Button
                type="button"
                size="sm"
                variant="destructive"
                className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemoveLogo();
                }}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
            <p className="text-sm text-green-600">Logo carregada com sucesso!</p>
            <p className="text-xs text-gray-500">Clique para alterar</p>
          </div>
        ) : (
          <div className="flex flex-col items-center space-y-2">
            <Upload className="h-8 w-8 text-gray-400" />
            <div>
              <p className="text-sm font-medium text-gray-900">
                Clique para enviar ou arraste uma logo
              </p>
              <p className="text-xs text-gray-500">
                PNG, JPG, GIF até 5MB
              </p>
            </div>
          </div>
        )}
      </div>

      {preview && (
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-2">
            <ImageIcon className="h-4 w-4 text-gray-500" />
            <span className="text-sm text-gray-700">Logo selecionada</span>
          </div>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={handleRemoveLogo}
            disabled={isUploading}
          >
            Remover
          </Button>
        </div>
      )}
    </div>
  );
};
