import type { AuthManager, Authenticatable } from '@atlex/auth'
import type { Application } from '@atlex/core'
import type { NextFunction, Request, RequestHandler, Response } from 'express'

const HEADER = 'x-atlex-test-auth-id'

/**
 * Express middleware: reads {@link TEST_AUTH_HEADER} and logs the resolved user into the default guard.
 * Pair with {@link import("../TestClient.js").TestClient.actingAs}.
 *
 * @param app - Application container (resolves `auth`).
 * @param resolveUser - Load an {@link Authenticatable} by primary key string.
 * @returns Express middleware.
 */
export function createTestingAuthMiddleware(
  app: Application,
  resolveUser: (id: string) => Promise<Authenticatable | null>,
): RequestHandler {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    const raw = req.headers[HEADER]
    const id = Array.isArray(raw) ? raw[0] : raw
    if (id === undefined || id.length === 0) {
      next()
      return
    }
    try {
      const user = await resolveUser(id)
      if (user !== null) {
        const auth = app.make<AuthManager>('auth')
        const guard = auth.guard()
        guard.setUser(user)
      }
    } catch {
      /* optional auth */
    }
    next()
  }
}

/**
 * Header name used by {@link createTestingAuthMiddleware} and {@link import("../TestClient.js").TestClient.actingAs}.
 */
export const TEST_AUTH_HEADER = HEADER
