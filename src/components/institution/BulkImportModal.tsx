import { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, Download, FileSpreadsheet, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface BulkImportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  institutionId: string;
  onImportComplete: () => void;
}

interface ImportRow {
  email: string;
  name: string;
  role: string;
  department?: string;
}

interface ImportResult {
  success: number;
  failed: number;
  errors: string[];
}

export function BulkImportModal({ open, onOpenChange, institutionId, onImportComplete }: BulkImportModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [parsedRows, setParsedRows] = useState<ImportRow[]>([]);

  const downloadTemplate = () => {
    const csvContent = `email,nome,funcao,departamento
joao@exemplo.com,João Silva,therapist,Psicologia
maria@exemplo.com,Maria Santos,teacher,Educação Especial
pedro@exemplo.com,Pedro Costa,member,Administrativo`;

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'template_importacao.csv';
    link.click();
  };

  const parseCSV = (text: string): ImportRow[] => {
    const lines = text.trim().split('\n');
    const headers = lines[0].toLowerCase().split(',').map(h => h.trim());
    
    const emailIdx = headers.findIndex(h => h.includes('email'));
    const nameIdx = headers.findIndex(h => h.includes('nome') || h.includes('name'));
    const roleIdx = headers.findIndex(h => h.includes('funcao') || h.includes('role') || h.includes('função'));
    const deptIdx = headers.findIndex(h => h.includes('depart') || h.includes('dept'));

    if (emailIdx === -1 || nameIdx === -1) {
      throw new Error('CSV deve conter colunas "email" e "nome"');
    }

    const rows: ImportRow[] = [];
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim());
      if (values[emailIdx] && values[nameIdx]) {
        rows.push({
          email: values[emailIdx],
          name: values[nameIdx],
          role: values[roleIdx] || 'member',
          department: values[deptIdx] || undefined
        });
      }
    }

    return rows;
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setResult(null);

    try {
      const text = await selectedFile.text();
      const rows = parseCSV(text);
      setParsedRows(rows);
    } catch (error: any) {
      toast.error(error.message || 'Erro ao processar arquivo');
      setFile(null);
      setParsedRows([]);
    }
  };

  const handleImport = async () => {
    if (parsedRows.length === 0) return;

    setImporting(true);
    setProgress(0);
    
    const errors: string[] = [];
    let successCount = 0;

    for (let i = 0; i < parsedRows.length; i++) {
      const row = parsedRows[i];
      
      try {
        // Generate invite code
        const inviteCode = crypto.randomUUID().slice(0, 8).toUpperCase();
        
        // Create invitation for each user
        const { error } = await supabase
          .from('invitations')
          .insert({
            inviter_id: (await supabase.auth.getUser()).data.user?.id,
            invite_type: 'institution_member',
            invite_code: inviteCode,
            status: 'pending',
            child_name: row.email,
            child_conditions: {
              name: row.name,
              role: row.role,
              department: row.department,
              institution_id: institutionId
            }
          });

        if (error) throw error;
        successCount++;
      } catch (error: any) {
        errors.push(`${row.email}: ${error.message}`);
      }

      setProgress(Math.round(((i + 1) / parsedRows.length) * 100));
    }

    setResult({
      success: successCount,
      failed: parsedRows.length - successCount,
      errors
    });

    setImporting(false);

    if (successCount > 0) {
      toast.success(`${successCount} convites gerados com sucesso`);
      onImportComplete();
    }
  };

  const resetState = () => {
    setFile(null);
    setParsedRows([]);
    setResult(null);
    setProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { onOpenChange(o); if (!o) resetState(); }}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Importar Usuários em Massa
          </DialogTitle>
          <DialogDescription>
            Importe múltiplos usuários de uma vez usando um arquivo CSV
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Template Download */}
          <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
            <div className="flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-muted-foreground" />
              <span className="text-sm">Baixar modelo CSV</span>
            </div>
            <Button variant="outline" size="sm" onClick={downloadTemplate}>
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>
          </div>

          {/* File Upload */}
          <div className="space-y-2">
            <Label>Arquivo CSV</Label>
            <div 
              className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                className="hidden"
                onChange={handleFileChange}
              />
              {file ? (
                <div className="flex items-center justify-center gap-2">
                  <FileSpreadsheet className="w-5 h-5 text-primary" />
                  <span className="font-medium">{file.name}</span>
                  <span className="text-muted-foreground">({parsedRows.length} linhas)</span>
                </div>
              ) : (
                <div className="text-muted-foreground">
                  <Upload className="w-8 h-8 mx-auto mb-2" />
                  <p>Clique para selecionar arquivo CSV</p>
                </div>
              )}
            </div>
          </div>

          {/* Preview */}
          {parsedRows.length > 0 && !result && (
            <div className="space-y-2">
              <Label>Pré-visualização ({parsedRows.length} usuários)</Label>
              <div className="max-h-40 overflow-y-auto border rounded-lg">
                <table className="w-full text-sm">
                  <thead className="bg-muted sticky top-0">
                    <tr>
                      <th className="px-3 py-2 text-left">Email</th>
                      <th className="px-3 py-2 text-left">Nome</th>
                      <th className="px-3 py-2 text-left">Função</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {parsedRows.slice(0, 5).map((row, i) => (
                      <tr key={i}>
                        <td className="px-3 py-2">{row.email}</td>
                        <td className="px-3 py-2">{row.name}</td>
                        <td className="px-3 py-2">{row.role}</td>
                      </tr>
                    ))}
                    {parsedRows.length > 5 && (
                      <tr>
                        <td colSpan={3} className="px-3 py-2 text-center text-muted-foreground">
                          +{parsedRows.length - 5} mais...
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Progress */}
          {importing && (
            <div className="space-y-2">
              <Label>Importando...</Label>
              <Progress value={progress} />
              <p className="text-sm text-muted-foreground text-center">{progress}%</p>
            </div>
          )}

          {/* Results */}
          {result && (
            <div className="space-y-3">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-green-500">
                  <CheckCircle2 className="w-5 h-5" />
                  <span>{result.success} sucesso</span>
                </div>
                {result.failed > 0 && (
                  <div className="flex items-center gap-2 text-red-500">
                    <XCircle className="w-5 h-5" />
                    <span>{result.failed} falhas</span>
                  </div>
                )}
              </div>

              {result.errors.length > 0 && (
                <Alert variant="destructive">
                  <AlertTriangle className="w-4 h-4" />
                  <AlertDescription>
                    <div className="max-h-20 overflow-y-auto text-xs">
                      {result.errors.map((err, i) => (
                        <p key={i}>{err}</p>
                      ))}
                    </div>
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => { onOpenChange(false); resetState(); }}>
            {result ? 'Fechar' : 'Cancelar'}
          </Button>
          {!result && (
            <Button 
              onClick={handleImport} 
              disabled={parsedRows.length === 0 || importing}
            >
              {importing ? 'Importando...' : `Importar ${parsedRows.length} Usuários`}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
