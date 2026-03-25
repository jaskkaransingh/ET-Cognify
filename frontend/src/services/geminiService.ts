export type Perspective = 'Neutral' | 'Shareholder' | 'Gig Worker' | 'FII' | 'Farmer' | 'Short Seller';

export interface ETCognifyInsight {
  headline: string;
  summary: string;
  perspectives: Record<Perspective, string>;
  butterflyEffect: {
    trigger: string;
    directImpact: string;
    personalRipples: {
      label: string;
      value: string;
      cost?: string;
    }[];
  };
  debate: {
    topic: string;
    bull: string;
    bear: string;
  };
  newsDNA: {
    profile: string;
    blindSpot: string;
  };
}

export const generateInsight = async (topic: string, url?: string): Promise<ETCognifyInsight> => {
  let articleContent = "";
  if (url) {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      const response = await fetch(`${apiUrl}/api/article?url=${encodeURIComponent(url)}`);
      const data = await response.json();
      if (data && data.content) {
        articleContent = data.content;
      }
    } catch (e) {
      console.error("Failed to fetch article text", e);
    }
  }

  // We throw a tailored error that includes the articleContent on the error object, 
  // or return a mock structure. Let's just return a mock structure since ArenaPage depends on it.
  throw Object.assign(new Error("API not currently configured. Using semantic fallback for " + topic), { articleContent });
};
