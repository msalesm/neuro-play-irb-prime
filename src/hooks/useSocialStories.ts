// EDU stub
export interface SocialStory {
  id: string;
  title: string;
  description?: string;
  pages?: any[];
  age_min?: number;
  age_max?: number;
}
export function useSocialStories() { return { stories: [] as SocialStory[], loading: false }; }
export default useSocialStories;
