import axios from "axios";
import type {
  IdempotencyBody,
  IdempotencyDependencyList,
  IdempotencyScope,
} from "@/lib/idempotency";

export async function runIdempotentOperation<TSubmit extends object, TResult>(
  scope: IdempotencyScope,
  submitData: TSubmit,
  request: (idempotencyKey: string) => Promise<TResult>,
  runtimeDependencies: IdempotencyDependencyList = [],
): Promise<TResult> {
  const body = scope.withKey(submitData as IdempotencyBody, runtimeDependencies);
  try {
    const result = await request(body.idempotency_key);
    scope.reset(runtimeDependencies);
    return result;
  } catch (error) {
    if (axios.isCancel(error)) scope.reset(runtimeDependencies);
    throw error;
  }
}

export function runIdempotentRequest<TSubmit extends object, TResult>(
  scope: IdempotencyScope,
  submitData: TSubmit,
  request: (body: TSubmit & { idempotency_key: string }) => Promise<TResult>,
  runtimeDependencies: IdempotencyDependencyList = [],
): Promise<TResult> {
  return runIdempotentOperation(
    scope,
    submitData,
    (idempotencyKey) => request({ ...submitData, idempotency_key: idempotencyKey }),
    runtimeDependencies,
  );
}
