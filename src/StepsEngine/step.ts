export interface Step {
  action: string;
  value?: unknown;
  selector?: string;
  optional?: boolean;
  options?: Record<string, unknown>;
}