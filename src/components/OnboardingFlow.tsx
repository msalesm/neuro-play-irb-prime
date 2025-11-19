interface OnboardingFlowProps {
  onComplete?: () => void;
}

export default function OnboardingFlow({ onComplete }: OnboardingFlowProps = {}) {
  return (
    <div className="p-6">
      <h2 className="text-xl font-bold">Onboarding</h2>
      <p className="text-muted-foreground">Onboarding flow placeholder</p>
      {onComplete && (
        <button onClick={onComplete} className="mt-4 px-4 py-2 bg-primary text-white rounded">
          Complete
        </button>
      )}
    </div>
  );
}
