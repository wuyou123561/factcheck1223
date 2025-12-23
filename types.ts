
export interface SourceEntity {
  name: string;
  status: 'Verified' | 'Anonymous' | 'Fabricated';
  reason: string;
  url?: string;
}

export interface AtomicClaim {
  text: string;
  verdict: 'verified' | 'refuted' | 'unconfirmed';
  evidence: string;
  trail: { title: string; url: string }[];
}

export interface LogicFallacy {
  name: string;
  explanation: string;
}

export interface Message {
  role: 'user' | 'model';
  text: string;
}

/**
 * Represents a suspect in the digital detective intelligence suite.
 * Added to resolve missing export member errors in components.
 */
export interface Suspect {
  id: string;
  name: string;
  role: string;
  description: string;
  image: string;
  systemPrompt: string;
}

export interface AnalysisResult {
  summary: string;
  verdict: 'AUTHENTIC' | 'FRAUDULENT' | 'SUSPICIOUS';
  score: number;
  lensA_Source: {
    status: 'PASS' | 'BREACHED';
    entities: SourceEntity[];
    overallRating: string;
  };
  lensB_Fact: {
    status: 'PASS' | 'BREACHED';
    claims: AtomicClaim[];
  };
  lensC_Logic: {
    status: 'PASS' | 'BREACHED';
    fallacies: LogicFallacy[];
    emotionalTone: string;
    reasoningRating: string;
  };
}

export enum AppState {
  IDLE = 'IDLE',
  ANALYZING = 'ANALYZING',
  RESULT = 'RESULT'
}
