import type { Model } from "@atlex/orm";

declare module "vitest" {
  interface Assertion<T = unknown> {
    toBeModel(modelClass: typeof Model): T;
    toMatchModel(attributes: Record<string, unknown>): T;
    toHaveCount(count: number): T;
    toHaveValidationErrors(fields: string[]): T;
    toBeAuthenticated(): T;
    toExistInDatabase(table?: string, column?: string): Promise<T>;
    toBeSoftDeleted(): T;
  }

  interface AsymmetricMatchersContaining {
    toBeModel(modelClass: typeof Model): unknown;
    toMatchModel(attributes: Record<string, unknown>): unknown;
    toHaveCount(count: number): unknown;
    toHaveValidationErrors(fields: string[]): unknown;
    toBeAuthenticated(): unknown;
    toExistInDatabase(table?: string, column?: string): unknown;
    toBeSoftDeleted(): unknown;
  }
}
