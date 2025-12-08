import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Watch, Heart, Activity, Moon, Zap, AlertCircle, 
  Plus, Unplug, RefreshCw, TrendingUp, TrendingDown 
} from 'lucide-react';
import { useWearables } from '@/hooks/useWearables';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface WearablesDashboardProps {
  childId?: string;
}

const providerIcons: Record<string, React.ReactNode> = {
  apple_watch: <Watch className="h-5 w-5" />,
  fitbit: <Activity className="h-5 w-5" />,
  amazfit: <Watch className="h-5 w-5" />,
  garmin: <Activity className="h-5 w-5" />
};

const providerNames: Record<string, string> = {
  apple_watch: 'Apple Watch',
  fitbit: 'Fitbit',
  amazfit: 'Amazfit',
  garmin: 'Garmin'
};

export function WearablesDashboard({ childId }: WearablesDashboardProps) {
  const { t } = useLanguage();
  const { 
    connections, 
    readings, 
    alerts, 
    loading,
    connectDevice,
    disconnectDevice,
    acknowledgeAlert,
    getLatestReading,
    getAverageReading,
    simulateReading,
    reload
  } = useWearables(childId);

  const [showConnectDialog, setShowConnectDialog] = useState(false);

  const latestHeartRate = getLatestReading('heart_rate');
  const latestHRV = getLatestReading('hrv');
  const latestSleep = getLatestReading('sleep');
  const latestStress = getLatestReading('stress');

  const avgHeartRate = getAverageReading('heart_rate', 24);

  const handleConnect = async (provider: 'apple_watch' | 'fitbit' | 'amazfit' | 'garmin') => {
    await connectDevice(provider);
    setShowConnectDialog(false);
  };

  // Simulate some readings for demo
  const handleSimulate = async () => {
    await simulateReading('heart_rate', 72 + Math.random() * 20, 'bpm');
    await simulateReading('hrv', 45 + Math.random() * 30, 'ms');
    await simulateReading('stress', Math.random() * 100, '%');
    await simulateReading('sleep', 6 + Math.random() * 3, 'hours');
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32 w-full" />
        <div className="grid grid-cols-2 gap-4">
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Connected Devices */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <Watch className="h-5 w-5 text-primary" />
            {t('phase5.wearables.connectedDevices')}
          </CardTitle>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={handleSimulate}>
              <RefreshCw className="h-4 w-4 mr-1" />
              {t('phase5.wearables.simulate')}
            </Button>
            <Dialog open={showConnectDialog} onOpenChange={setShowConnectDialog}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-1" />
                  {t('phase5.wearables.connect')}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{t('phase5.wearables.connectDevice')}</DialogTitle>
                </DialogHeader>
                <div className="grid grid-cols-2 gap-4 py-4">
                  {(['apple_watch', 'fitbit', 'amazfit', 'garmin'] as const).map(provider => (
                    <Button
                      key={provider}
                      variant="outline"
                      className="h-20 flex flex-col gap-2"
                      onClick={() => handleConnect(provider)}
                    >
                      {providerIcons[provider]}
                      <span>{providerNames[provider]}</span>
                    </Button>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground text-center">
                  {t('phase5.wearables.placeholderIntegration')}
                </p>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {connections.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              <Watch className="h-10 w-10 mx-auto mb-2 opacity-50" />
              <p>{t('phase5.wearables.noDevices')}</p>
              <p className="text-sm">{t('phase5.wearables.connectToMonitor')}</p>
            </div>
          ) : (
            <div className="space-y-2">
              {connections.map(conn => (
                <div key={conn.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div className="flex items-center gap-3">
                    {providerIcons[conn.provider]}
                    <div>
                      <p className="font-medium">{providerNames[conn.provider]}</p>
                      {conn.last_sync_at && (
                        <p className="text-xs text-muted-foreground">
                          {t('phase5.wearables.lastSync')}: {new Date(conn.last_sync_at).toLocaleString()}
                        </p>
                      )}
                    </div>
                  </div>
                  <Button 
                    size="sm" 
                    variant="ghost"
                    onClick={() => disconnectDevice(conn.id)}
                  >
                    <Unplug className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Vital Signs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Heart className="h-4 w-4 text-red-500" />
              <span className="text-sm text-muted-foreground">{t('phase5.wearables.heartRate')}</span>
            </div>
            <div className="text-2xl font-bold">
              {latestHeartRate ? `${Math.round(latestHeartRate.value)}` : '--'}
              <span className="text-sm font-normal text-muted-foreground"> bpm</span>
            </div>
            {avgHeartRate && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                {latestHeartRate && latestHeartRate.value > avgHeartRate ? (
                  <TrendingUp className="h-3 w-3 text-orange-500" />
                ) : (
                  <TrendingDown className="h-3 w-3 text-green-500" />
                )}
                {t('phase5.wearables.avg24h')}: {Math.round(avgHeartRate)}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="h-4 w-4 text-purple-500" />
              <span className="text-sm text-muted-foreground">{t('phase5.wearables.hrv')}</span>
            </div>
            <div className="text-2xl font-bold">
              {latestHRV ? `${Math.round(latestHRV.value)}` : '--'}
              <span className="text-sm font-normal text-muted-foreground"> ms</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="h-4 w-4 text-orange-500" />
              <span className="text-sm text-muted-foreground">{t('phase5.wearables.stressLevel')}</span>
            </div>
            <div className="text-2xl font-bold">
              {latestStress ? `${Math.round(latestStress.value)}` : '--'}
              <span className="text-sm font-normal text-muted-foreground">%</span>
            </div>
            {latestStress && (
              <Progress 
                value={latestStress.value} 
                className="h-1 mt-2"
              />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Moon className="h-4 w-4 text-blue-500" />
              <span className="text-sm text-muted-foreground">{t('phase5.wearables.sleep')}</span>
            </div>
            <div className="text-2xl font-bold">
              {latestSleep ? `${latestSleep.value.toFixed(1)}` : '--'}
              <span className="text-sm font-normal text-muted-foreground"> {t('phase5.wearables.hours')}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alerts */}
      {alerts.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-orange-500" />
              {t('phase5.emotionalAI.alerts')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {alerts.map(alert => (
              <div 
                key={alert.id}
                className={`flex items-start justify-between p-3 rounded-lg border ${
                  alert.severity === 'urgent' ? 'bg-red-50 border-red-200' :
                  alert.severity === 'warning' ? 'bg-orange-50 border-orange-200' :
                  'bg-blue-50 border-blue-200'
                }`}
              >
                <div>
                  <Badge variant={
                    alert.severity === 'urgent' ? 'destructive' :
                    alert.severity === 'warning' ? 'default' : 'secondary'
                  }>
                    {alert.alert_type}
                  </Badge>
                  <p className="mt-1 text-sm">{alert.message}</p>
                  {alert.recommendation && (
                    <p className="mt-1 text-xs text-muted-foreground">{alert.recommendation}</p>
                  )}
                </div>
                <Button 
                  size="sm" 
                  variant="ghost"
                  onClick={() => acknowledgeAlert(alert.id)}
                >
                  {t('phase5.wearables.understood')}
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
