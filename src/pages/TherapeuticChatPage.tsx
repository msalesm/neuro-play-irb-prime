import { useSearchParams } from 'react-router-dom';
import TherapeuticChat from '@/components/TherapeuticChat';
import { PlatformOnboarding } from '@/components/PlatformOnboarding';

export default function TherapeuticChatPage() {
  const [searchParams] = useSearchParams();
  const childProfileId = searchParams.get('childProfileId') || undefined;

  return (
    <>
      <PlatformOnboarding pageName="therapeutic-chat" />
      <TherapeuticChat childProfileId={childProfileId} variant="full" />
    </>
  );
}
