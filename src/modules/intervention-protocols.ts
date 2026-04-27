// EDU stub
export interface InterventionProtocol {
  id: string;
  title: string;
  description: string;
  domain: string;
}
export function getInterventionProtocols(_domain?: string): InterventionProtocol[] {
  return [];
}
export function generateClassInterventions(_classData?: any): InterventionProtocol[] {
  return [];
}
export function getProtocolById(_id: string): InterventionProtocol | null {
  return null;
}
export default getInterventionProtocols;
