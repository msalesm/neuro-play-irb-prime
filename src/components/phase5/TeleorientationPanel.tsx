import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Video, Calendar, Clock, User, FileText, 
  Plus, Play, CheckCircle, XCircle, ExternalLink
} from 'lucide-react';
import { useTeleorientation, TeleorientationSession } from '@/hooks/useTeleorientation';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { format } from 'date-fns';
import { enUS, es, ptBR } from 'date-fns/locale';

export function TeleorientationPanel() {
  const { t, language } = useLanguage();
  const { 
    sessions, 
    notes,
    loading, 
    scheduleSession, 
    updateSessionStatus,
    addSessionNote,
    cancelSession,
    getUpcomingSessions,
    getPastSessions
  } = useTeleorientation();

  const [showScheduleDialog, setShowScheduleDialog] = useState(false);
  const [showNotesDialog, setShowNotesDialog] = useState(false);
  const [selectedSession, setSelectedSession] = useState<TeleorientationSession | null>(null);
  const [newSession, setNewSession] = useState({
    parent_id: '',
    session_type: 'orientation' as const,
    scheduled_at: '',
    duration_minutes: 30
  });
  const [newNote, setNewNote] = useState({
    notes: '',
    follow_up_needed: false
  });

  const upcomingSessions = getUpcomingSessions();
  const pastSessions = getPastSessions();

  const getLocale = () => {
    switch (language) {
      case 'en': return enUS;
      case 'es': return es;
      default: return ptBR;
    }
  };

  const statusLabels: Record<string, string> = {
    scheduled: t('phase5.teleorientation.statusScheduled'),
    in_progress: t('phase5.teleorientation.statusInProgress'),
    completed: t('phase5.teleorientation.statusCompleted'),
    cancelled: t('phase5.teleorientation.statusCancelled'),
    no_show: t('phase5.teleorientation.statusNoShow')
  };

  const sessionTypeLabels: Record<string, string> = {
    orientation: t('phase5.teleorientation.typeOrientation'),
    follow_up: t('phase5.teleorientation.typeFollowUp'),
    evaluation: t('phase5.teleorientation.typeEvaluation')
  };

  const handleSchedule = async () => {
    if (!newSession.parent_id || !newSession.scheduled_at) return;
    
    await scheduleSession(newSession);
    setShowScheduleDialog(false);
    setNewSession({
      parent_id: '',
      session_type: 'orientation',
      scheduled_at: '',
      duration_minutes: 30
    });
  };

  const handleAddNote = async () => {
    if (!selectedSession || !newNote.notes) return;
    
    await addSessionNote({
      session_id: selectedSession.id,
      notes: newNote.notes,
      follow_up_needed: newNote.follow_up_needed
    });
    setShowNotesDialog(false);
    setNewNote({ notes: '', follow_up_needed: false });
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Video className="h-6 w-6 text-primary" />
          {t('phase5.teleorientation.title')}
        </h2>
        <Dialog open={showScheduleDialog} onOpenChange={setShowScheduleDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              {t('phase5.teleorientation.schedule')}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t('phase5.teleorientation.scheduleNew')}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <label className="text-sm font-medium">{t('phase5.teleorientation.parentId')}</label>
                <Input
                  placeholder={t('phase5.teleorientation.parentIdPlaceholder')}
                  value={newSession.parent_id}
                  onChange={(e) => setNewSession({ ...newSession, parent_id: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium">{t('phase5.teleorientation.sessionType')}</label>
                <Select
                  value={newSession.session_type}
                  onValueChange={(value: any) => setNewSession({ ...newSession, session_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="orientation">{t('phase5.teleorientation.typeOrientation')}</SelectItem>
                    <SelectItem value="follow_up">{t('phase5.teleorientation.typeFollowUp')}</SelectItem>
                    <SelectItem value="evaluation">{t('phase5.teleorientation.typeEvaluation')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">{t('phase5.teleorientation.dateTime')}</label>
                <Input
                  type="datetime-local"
                  value={newSession.scheduled_at}
                  onChange={(e) => setNewSession({ ...newSession, scheduled_at: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium">{t('phase5.teleorientation.durationMinutes')}</label>
                <Select
                  value={String(newSession.duration_minutes)}
                  onValueChange={(value) => setNewSession({ ...newSession, duration_minutes: Number(value) })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15">15 {t('phase5.teleorientation.minutes')}</SelectItem>
                    <SelectItem value="30">30 {t('phase5.teleorientation.minutes')}</SelectItem>
                    <SelectItem value="45">45 {t('phase5.teleorientation.minutes')}</SelectItem>
                    <SelectItem value="60">60 {t('phase5.teleorientation.minutes')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowScheduleDialog(false)}>
                {t('common.cancel')}
              </Button>
              <Button onClick={handleSchedule}>
                {t('phase5.teleorientation.schedule')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Upcoming Sessions */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            {t('phase5.teleorientation.upcoming')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {upcomingSessions.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              <Calendar className="h-10 w-10 mx-auto mb-2 opacity-50" />
              <p>{t('phase5.teleorientation.noUpcoming')}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {upcomingSessions.map(session => (
                <SessionCard
                  key={session.id}
                  session={session}
                  onStart={() => updateSessionStatus(session.id, 'in_progress')}
                  onCancel={() => cancelSession(session.id)}
                  onAddNote={() => {
                    setSelectedSession(session);
                    setShowNotesDialog(true);
                  }}
                  statusLabels={statusLabels}
                  sessionTypeLabels={sessionTypeLabels}
                  locale={getLocale()}
                  t={t}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Past Sessions */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <Clock className="h-5 w-5" />
            {t('phase5.teleorientation.history')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {pastSessions.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              <p>{t('phase5.teleorientation.noHistory')}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pastSessions.slice(0, 5).map(session => (
                <SessionCard
                  key={session.id}
                  session={session}
                  onComplete={() => updateSessionStatus(session.id, 'completed')}
                  onAddNote={() => {
                    setSelectedSession(session);
                    setShowNotesDialog(true);
                  }}
                  statusLabels={statusLabels}
                  sessionTypeLabels={sessionTypeLabels}
                  locale={getLocale()}
                  t={t}
                  isPast
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Notes Dialog */}
      <Dialog open={showNotesDialog} onOpenChange={setShowNotesDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('phase5.teleorientation.sessionNotes')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Textarea
              placeholder={t('phase5.teleorientation.notesPlaceholder')}
              value={newNote.notes}
              onChange={(e) => setNewNote({ ...newNote, notes: e.target.value })}
              rows={5}
            />
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="follow_up"
                checked={newNote.follow_up_needed}
                onChange={(e) => setNewNote({ ...newNote, follow_up_needed: e.target.checked })}
              />
              <label htmlFor="follow_up" className="text-sm">
                {t('phase5.teleorientation.requiresFollowUp')}
              </label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNotesDialog(false)}>
              {t('common.cancel')}
            </Button>
            <Button onClick={handleAddNote}>
              {t('phase5.teleorientation.saveNotes')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

interface SessionCardProps {
  session: TeleorientationSession;
  onStart?: () => void;
  onComplete?: () => void;
  onCancel?: () => void;
  onAddNote?: () => void;
  statusLabels: Record<string, string>;
  sessionTypeLabels: Record<string, string>;
  locale: any;
  t: (key: string) => string;
  isPast?: boolean;
}

const statusColors: Record<string, string> = {
  scheduled: 'bg-blue-100 text-blue-800',
  in_progress: 'bg-green-100 text-green-800',
  completed: 'bg-gray-100 text-gray-800',
  cancelled: 'bg-red-100 text-red-800',
  no_show: 'bg-orange-100 text-orange-800'
};

function SessionCard({ session, onStart, onComplete, onCancel, onAddNote, statusLabels, sessionTypeLabels, locale, t, isPast }: SessionCardProps) {
  const sessionDate = new Date(session.scheduled_at);
  
  return (
    <div className="flex items-center justify-between p-4 border rounded-lg">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <Badge className={statusColors[session.status]}>
            {statusLabels[session.status]}
          </Badge>
          <span className="text-sm text-muted-foreground">
            {sessionTypeLabels[session.session_type]}
          </span>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <span className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {format(sessionDate, "dd/MM/yyyy", { locale })}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {format(sessionDate, "HH:mm")} ({session.duration_minutes}min)
          </span>
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        {session.status === 'scheduled' && !isPast && (
          <>
            {session.meeting_url && (
              <Button size="sm" variant="outline" asChild>
                <a href={session.meeting_url} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4 mr-1" />
                  Link
                </a>
              </Button>
            )}
            <Button size="sm" onClick={onStart}>
              <Play className="h-4 w-4 mr-1" />
              {t('phase5.teleorientation.start')}
            </Button>
            <Button size="sm" variant="ghost" onClick={onCancel}>
              <XCircle className="h-4 w-4" />
            </Button>
          </>
        )}
        
        {session.status === 'in_progress' && (
          <Button size="sm" onClick={onComplete}>
            <CheckCircle className="h-4 w-4 mr-1" />
            {t('phase5.teleorientation.complete')}
          </Button>
        )}
        
        {(session.status === 'completed' || isPast) && (
          <Button size="sm" variant="outline" onClick={onAddNote}>
            <FileText className="h-4 w-4 mr-1" />
            {t('phase5.teleorientation.notes')}
          </Button>
        )}
      </div>
    </div>
  );
}
