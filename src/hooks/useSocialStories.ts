// EDU stub
export interface SocialStory {
  id: string;
  title: string;
  description?: string;
  pages?: any[];
}
export function useSocialStories() { return { stories: [] as SocialStory[], loading: false }; }
export default useSocialStories;
