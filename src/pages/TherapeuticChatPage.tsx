import { useSearchParams } from 'react-router-dom';
import TherapeuticChat from '@/components/TherapeuticChat';

export default function TherapeuticChatPage() {
  const [searchParams] = useSearchParams();
  const childProfileId = searchParams.get('childProfileId') || undefined;

  return <TherapeuticChat childProfileId={childProfileId} variant="full" />;
}
