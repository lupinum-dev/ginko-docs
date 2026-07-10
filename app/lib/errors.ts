export type ErrorKind = "accessDenied" | "notFound" | "server" | "unavailable";

export interface NormalizedAppError {
  kind: ErrorKind;
  message: string;
  statusCode: number;
  statusMessage: string;
}

type ErrorLike = {
  data?: unknown;
  fatal?: boolean;
  message?: string;
  name?: string;
  status?: number;
  statusCode?: number;
  statusMessage?: string;
  statusText?: string;
};

type ContentNotFoundError = Error & {
  data: {
    kind: "content-not-found";
  };
  fatal: true;
  status: 404;
  statusCode: 404;
  statusMessage: "Not Found";
  statusText: "Not Found";
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
  if (statusCode === 403) return "accessDenied";
  if (statusCode >= 500) return "server";
  return "unavailable";
}

function defaultStatusMessage(statusCode: number, kind: ErrorKind): string {
  if (kind === "notFound") return "Not Found";
  if (kind === "accessDenied") return "Forbidden";
  if (kind === "server") return "Internal Server Error";
  return statusCode >= 400 ? "Unavailable" : "Error";
}

export function normalizeAppError(error: unknown): NormalizedAppError {
  const source = toErrorLike(error);
  const statusCode = toStatusCode(source);
  const kind = errorKind(statusCode);
  const statusMessage =
    source.statusMessage ?? source.statusText ?? defaultStatusMessage(statusCode, kind);
  const message = source.message ?? statusMessage;

  return {
    kind,
    message,
    statusCode,
    statusMessage,
  };
}

export function createContentNotFoundError(): ContentNotFoundError {
  const error = new Error("Content not found") as ContentNotFoundError;
  error.data = { kind: "content-not-found" };
  error.fatal = true;
  error.status = 404;
  error.statusCode = 404;
  error.statusMessage = "Not Found";
  error.statusText = "Not Found";
  return error;
}
