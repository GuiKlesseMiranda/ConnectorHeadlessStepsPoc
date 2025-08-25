import type { TTaskPayload, CapturedRequest, CapturedResponse } from "./types";

export function makePathRegex(pattern?: string): RegExp | null {
  if (!pattern) return null;
  // permite padrões simples tipo "/api/v1/resource" ou com .* etc.
  const source = pattern.startsWith("^") ? pattern : `^.*${pattern.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`.replace(/\\\.\*/g, ".*");
  return new RegExp(source);
}

export function buildRequestMatcherFns(payload: TTaskPayload) {
  const reqs = payload.matchers.requests ?? [];
  return reqs.map(m => {
    const pathRx = makePathRegex(m.urlPathPattern);
    return {
      id: m.id,
      test: (url: URL, method: string) => {
        if (m.method && m.method.toUpperCase() !== method.toUpperCase()) return false;
        if (m.url && m.url !== url.toString()) return false;
        if (pathRx && !pathRx.test(url.pathname)) return false;
        return true;
      }
    };
  });
}

export function buildResponseMatcherFns(payload: TTaskPayload) {
  const resps = payload.matchers.responses ?? [];
  return resps.map(m => {
    const pathRx = makePathRegex(m.urlPathPattern);
    return {
      id: m.id,
      test: (url: URL, status: number) => {
        if (m.status && m.status !== status) return false;
        if (m.url && m.url !== url.toString()) return false;
        if (pathRx && !pathRx.test(url.pathname)) return false;
        return true;
      }
    };
  });
}

export function attachMatcherId<T extends CapturedRequest | CapturedResponse>(
  item: T,
  matcherId?: string
): T {
  return { ...item, matcherId } as T;
}
