import { useState, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Building2, Upload, Mail, Globe, X, ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useDropzone } from 'react-dropzone';
import { cn } from '@/lib/utils';

interface FirmDataStepProps {
  data: {
    firm_name: string;
    cnpj: string;
    email: string;
    website: string;
    logo_url: string;
  };
  onChange: (field: string, value: string) => void;
  onLogoUpload: (file: File) => Promise<string | null>;
}

const FirmDataStep = ({ data, onChange, onLogoUpload }: FirmDataStepProps) => {
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(data.logo_url || null);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    // Create preview
    const preview = URL.createObjectURL(file);
    setPreviewUrl(preview);
    
    setUploading(true);
    const url = await onLogoUpload(file);
    if (url) {
      onChange('logo_url', url);
    }
    setUploading(false);
  }, [onLogoUpload, onChange]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.svg', '.webp']
    },
    maxFiles: 1,
    maxSize: 5 * 1024 * 1024, // 5MB
  });

  const formatCNPJ = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 2) return numbers;
    if (numbers.length <= 5) return `${numbers.slice(0, 2)}.${numbers.slice(2)}`;
    if (numbers.length <= 8) return `${numbers.slice(0, 2)}.${numbers.slice(2, 5)}.${numbers.slice(5)}`;
    if (numbers.length <= 12) return `${numbers.slice(0, 2)}.${numbers.slice(2, 5)}.${numbers.slice(5, 8)}/${numbers.slice(8)}`;
    return `${numbers.slice(0, 2)}.${numbers.slice(2, 5)}.${numbers.slice(5, 8)}/${numbers.slice(8, 12)}-${numbers.slice(12, 14)}`;
  };

  const removeLogo = () => {
    setPreviewUrl(null);
    onChange('logo_url', '');
  };

  return (
    <div className="space-y-6 max-w-lg">
      {/* Logo Upload */}
      <div className="space-y-3">
        <Label className="text-sm font-medium flex items-center gap-2">
          <ImageIcon className="w-4 h-4 text-muted-foreground" />
          Logo do Escritório
        </Label>
        {previewUrl ? (
          <div className="relative inline-block">
            <div className="w-28 h-28 rounded-2xl border-2 border-border overflow-hidden bg-muted/50 shadow-sm">
              <img
                src={previewUrl}
                alt="Logo preview"
                className="w-full h-full object-contain"
              />
            </div>
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="absolute -top-2 -right-2 w-7 h-7 rounded-full shadow-lg"
              onClick={removeLogo}
            >
              <X className="w-3.5 h-3.5" />
            </Button>
          </div>
        ) : (
          <div
            {...getRootProps()}
            className={cn(
              "border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-200",
              isDragActive 
                ? "border-primary bg-primary/5 scale-[1.02]" 
                : "border-border/50 hover:border-primary/50 hover:bg-muted/30"
            )}
          >
            <input {...getInputProps()} />
            <div className="w-14 h-14 rounded-xl bg-muted/50 flex items-center justify-center mx-auto mb-3">
              <Upload className="w-6 h-6 text-muted-foreground" />
            </div>
            {uploading ? (
              <p className="text-sm text-muted-foreground">Enviando...</p>
            ) : isDragActive ? (
              <p className="text-sm text-primary font-medium">Solte a imagem aqui</p>
            ) : (
              <>
                <p className="text-sm text-foreground font-medium">
                  Arraste uma imagem ou clique para selecionar
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  PNG, JPG, SVG ou WebP (máx. 5MB)
                </p>
              </>
            )}
          </div>
        )}
      </div>

      {/* Firm Name */}
      <div className="space-y-2">
        <Label htmlFor="firm_name" className="text-sm font-medium flex items-center gap-2">
          <Building2 className="w-4 h-4 text-muted-foreground" />
          Nome do Escritório
        </Label>
        <Input
          id="firm_name"
          placeholder="Silva & Associados Advocacia"
          value={data.firm_name}
          onChange={(e) => onChange('firm_name', e.target.value)}
          className="h-12 rounded-xl border-border/50 bg-muted/30 focus:bg-background transition-colors"
        />
      </div>

      {/* CNPJ */}
      <div className="space-y-2">
        <Label htmlFor="cnpj" className="text-sm font-medium text-muted-foreground">
          CNPJ (opcional)
        </Label>
        <Input
          id="cnpj"
          placeholder="00.000.000/0001-00"
          value={data.cnpj}
          onChange={(e) => onChange('cnpj', formatCNPJ(e.target.value))}
          maxLength={18}
          className="h-12 rounded-xl border-border/50 bg-muted/30 focus:bg-background transition-colors"
        />
      </div>

      {/* Email */}
      <div className="space-y-2">
        <Label htmlFor="email" className="text-sm font-medium flex items-center gap-2">
          <Mail className="w-4 h-4 text-muted-foreground" />
          E-mail Comercial
        </Label>
        <Input
          id="email"
          type="email"
          placeholder="contato@escritorio.com.br"
          value={data.email}
          onChange={(e) => onChange('email', e.target.value)}
          className="h-12 rounded-xl border-border/50 bg-muted/30 focus:bg-background transition-colors"
        />
      </div>

      {/* Website */}
      <div className="space-y-2">
        <Label htmlFor="website" className="text-sm font-medium flex items-center gap-2">
          <Globe className="w-4 h-4 text-muted-foreground" />
          Website (opcional)
        </Label>
        <Input
          id="website"
          placeholder="https://www.escritorio.com.br"
          value={data.website}
          onChange={(e) => onChange('website', e.target.value)}
          className="h-12 rounded-xl border-border/50 bg-muted/30 focus:bg-background transition-colors"
        />
      </div>
    </div>
  );
};

export default FirmDataStep;
