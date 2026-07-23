export type ErrorKind = "accessDenied" | "notFound" | "server" | "unavailable";

export interface NormalizedAppError {
  kind: ErrorKind;
  statusCode: number;
}

type ErrorLike = {
  status?: number;
  statusCode?: number;
};

function isObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === "object");
}

function toErrorLike(error: unknown): ErrorLike {
  return isObject(error) ? error : {};
}

function toStatusCode(error: ErrorLike): number {
  const status = error.statusCode ?? error.status;
  return typeof status === "number" && Number.isInteger(status) ? status : 500;
}

function errorKind(statusCode: number): ErrorKind {
  if (statusCode === 404) return "notFound";
  if (statusCode === 401 || statusCode === 403) return "accessDenied";
  if (statusCode >= 500) return "server";
  return "unavailable";
}

export function normalizeAppError(error: unknown): NormalizedAppError {
  const source = toErrorLike(error);
  const statusCode = toStatusCode(source);
  return { kind: errorKind(statusCode), statusCode };
}
