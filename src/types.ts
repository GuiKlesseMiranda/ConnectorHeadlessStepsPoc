import { Page } from 'playwright';

export const BROWSERS = ['chromium', 'firefox', 'webkit'] as const;
export type Browser = (typeof BROWSERS)[number];

export interface RequestMatcher {
  id: string;
  method?: string;
  url?: string;
  urlPathPattern?: string;
}

export interface ResponseMatcher {
  id: string;
  url?: string;
  urlPathPattern?: string;
  status?: number;
}
export interface TaskPayload {
  browser?: Browser;
  headless?: boolean;
  contextOptions?: Record<string, unknown>;
  pageOptions?: Record<string, unknown>;
  beforePageScript?: string;
  steps: Step[];
  matchers?: {
    requests?: RequestMatcher[];
    responses?: ResponseMatcher[];
  };
  afterExecutionScript?: string;
}

export type TTaskPayload = TaskPayload;

export interface NormalizedTaskPayload {
  browser: Browser;
  headless: boolean;
  contextOptions: Record<string, unknown>;
  pageOptions: Record<string, unknown>;
  beforePageScript: string;
  steps: Step[];
  matchers: {
    requests: RequestMatcher[];
    responses: ResponseMatcher[];
  };
  afterExecutionScript: string;
}

export type CapturedRequest = {
  matcherId?: string;
  url: string;
  method: string;
  headers: Record<string, string>;
  postData?: string | null;
  timestamp: number;
};

export type CapturedResponse = {
  matcherId?: string;
  url: string;
  status: number;
  headers: Record<string, string>;
  bodyBase64?: string;
  timestamp: number;
};

export type RunResult = {
  ok: boolean;
  error?: string;
  credentials: Record<string, any>;
  matchedRequests: CapturedRequest[];
  matchedResponses: CapturedResponse[];
  cookies: any[];
};

export type StepHandler = Record<
  string,
  (page: Page, step: Step) => Promise<any>
>;
