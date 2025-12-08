import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Settings, Building2, Mail, Phone, MapPin, Save, Shield, Bell, Palette } from 'lucide-react';
import { Institution } from '@/hooks/useInstitution';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface InstitutionSettingsTabProps {
  institution: Institution;
  isAdmin: boolean;
  onUpdate: () => void;
}

export function InstitutionSettingsTab({ institution, isAdmin, onUpdate }: InstitutionSettingsTabProps) {
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: institution.name,
    contact_email: institution.contact_email || '',
    contact_phone: institution.contact_phone || '',
    address: institution.address || '',
    city: institution.city || '',
    state: institution.state || ''
  });

  const [settings, setSettings] = useState({
    emailNotifications: true,
    weeklyReports: true,
    allowSelfRegistration: false,
    requireApproval: true
  });

  const handleSave = async () => {
    if (!isAdmin) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('institutions')
        .update({
          name: formData.name,
          contact_email: formData.contact_email,
          contact_phone: formData.contact_phone,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          settings: settings
        })
        .eq('id', institution.id);

      if (error) throw error;

      toast.success('Configurações salvas com sucesso');
      onUpdate();
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Erro ao salvar configurações');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Basic Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            Informações da Instituição
          </CardTitle>
          <CardDescription>
            Dados cadastrais e informações de contato
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome da Instituição</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                disabled={!isAdmin}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">E-mail de Contato</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  className="pl-10"
                  value={formData.contact_email}
                  onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                  disabled={!isAdmin}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Telefone</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="phone"
                  className="pl-10"
                  value={formData.contact_phone}
                  onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                  disabled={!isAdmin}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="city">Cidade</Label>
              <Input
                id="city"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                disabled={!isAdmin}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="address">Endereço</Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
              <Textarea
                id="address"
                className="pl-10 min-h-[80px]"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                disabled={!isAdmin}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Notificações
          </CardTitle>
          <CardDescription>
            Configure como você deseja receber atualizações
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Notificações por E-mail</p>
              <p className="text-sm text-muted-foreground">Receba alertas importantes por e-mail</p>
            </div>
            <Switch
              checked={settings.emailNotifications}
              onCheckedChange={(checked) => setSettings({ ...settings, emailNotifications: checked })}
              disabled={!isAdmin}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Relatórios Semanais</p>
              <p className="text-sm text-muted-foreground">Receba um resumo semanal de atividades</p>
            </div>
            <Switch
              checked={settings.weeklyReports}
              onCheckedChange={(checked) => setSettings({ ...settings, weeklyReports: checked })}
              disabled={!isAdmin}
            />
          </div>
        </CardContent>
      </Card>

      {/* Access Control */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Controle de Acesso
          </CardTitle>
          <CardDescription>
            Configurações de segurança e permissões
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Auto-registro</p>
              <p className="text-sm text-muted-foreground">Permitir que usuários se registrem sozinhos</p>
            </div>
            <Switch
              checked={settings.allowSelfRegistration}
              onCheckedChange={(checked) => setSettings({ ...settings, allowSelfRegistration: checked })}
              disabled={!isAdmin}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Aprovação Obrigatória</p>
              <p className="text-sm text-muted-foreground">Novos membros precisam de aprovação</p>
            </div>
            <Switch
              checked={settings.requireApproval}
              onCheckedChange={(checked) => setSettings({ ...settings, requireApproval: checked })}
              disabled={!isAdmin}
            />
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      {isAdmin && (
        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={saving}>
            <Save className="w-4 h-4 mr-2" />
            {saving ? 'Salvando...' : 'Salvar Configurações'}
          </Button>
        </div>
      )}
    </div>
  );
}
