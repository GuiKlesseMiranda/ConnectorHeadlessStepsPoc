import { z } from 'zod';

export const RequestMatcher = z.object({
  id: z.string(),
  method: z.string().optional(),
  url: z.string().optional(),
  urlPathPattern: z.string().optional(),
});

export const ResponseMatcher = z.object({
  id: z.string(),
  url: z.string().optional(),
  urlPathPattern: z.string().optional(),
  status: z.number().optional(),
});

export const Step = z.object({
  action: z.string(),
  value: z.any().optional(),
  selector: z.string().optional(),
  optional: z.boolean().optional().default(false),
  options: z.record(z.any()).optional(),
});

export const TaskPayload = z.object({
  browser: z
    .enum(['chromium', 'firefox', 'webkit'])
    .optional()
    .default('chromium'),
  headless: z.boolean().optional().default(true),
  contextOptions: z.record(z.any()).optional(),
  pageOptions: z.record(z.any()).optional(),

  beforePageScript: z.string().optional().default(''),
  steps: z.array(Step).default([]),
  matchers: z
    .object({
      requests: z.array(RequestMatcher).optional().default([]),
      responses: z.array(ResponseMatcher).optional().default([]),
    })
    .optional()
    .default({ requests: [], responses: [] }),
  afterExecutionScript: z.string().optional().default(''),
});
export type TTaskPayload = z.infer<typeof TaskPayload>;

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
