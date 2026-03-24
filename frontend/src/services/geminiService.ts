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

export const generateInsight = async (topic: string): Promise<ETCognifyInsight> => {
  // Mock function that currently forces the static fallback
  throw new Error("API not currently configured. Using semantic fallback for " + topic);
};
