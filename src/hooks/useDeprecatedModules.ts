// Lista estática de módulos deprecados para performance (não depende de tipos)
const DEPRECATED_PATHS = [
  '/games',
  '/community',
  '/fase5',
  '/avatar',
  '/achievements',
  '/rotinas',
  '/admin/story-editor',
  '/content-manager',
  '/admin/content',
];

export function useDeprecatedModules() {
  const isDeprecated = (path: string): boolean => {
    return DEPRECATED_PATHS.some(dp => path.startsWith(dp));
  };

  const filterDeprecated = <T extends { path: string }>(items: T[]): T[] => {
    return items.filter(item => !isDeprecated(item.path));
  };

  return {
    isDeprecated,
    filterDeprecated,
    DEPRECATED_PATHS,
  };
}
