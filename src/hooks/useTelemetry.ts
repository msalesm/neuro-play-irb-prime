// EDU stub
export function useTelemetry() {
  return {
    track: (_e?: string, _p?: any) => {},
    identify: (_id?: string) => {},
    trackScreenView: (_name?: string) => {},
    trackAccessibilityChange: (_change?: any) => {},
  };
}
export default useTelemetry;
