import { describe, expect, it } from 'vitest';

import { a01QuerySchema } from '../../../src/contracts/session/a-01-auth-login.js';
import {
  a02QuerySchema,
  a02ResponseSchema,
} from '../../../src/contracts/session/a-02-auth-callback.js';
import { a04ResponseSchema } from '../../../src/contracts/session/a-04-session.js';
import { v01ResponseSchema } from '../../../src/contracts/shell/v-01-shell-status.js';

// Round-trips of A-01..V-02 are covered by the generic manifest-driven test (registry.contract.test.ts); these are the
// prose rules the examples do not exercise.
const session = {
  user: {
    id: 'usr_01J9Y7C2QK',
    displayName: 'Camila Bravo',
    avatarFileId: null,
    roleLabelKey: 'role.executiveViewer',
  },
  role: 'executive_viewer',
  hasAdminAccess: false,
  requiresGate: false,
  navigation: [{ id: 'inicio', labelKey: 'nav.inicio', to: '/inicio', isLocked: false }],
  analysisContext: { defaultAnalysisId: null },
  permissions: { canViewAnalysisList: false },
};

describe('A-01..V-02 session and shell rules', () => {
  it('A-01 returnTo keeps same-origin relative paths and silently falls back to /inicio', () => {
    expect(a01QuerySchema.parse({})).toEqual({ returnTo: '/inicio' });
    expect(a01QuerySchema.parse({ returnTo: '/analisis?ref=tbg-ilp' }).returnTo).toBe(
      '/analisis?ref=tbg-ilp',
    );
    for (const returnTo of ['//evil.example', 'https://evil.example/x', 'inicio']) {
      expect(a01QuerySchema.parse({ returnTo }).returnTo).toBe('/inicio');
    }
    expect(a01QuerySchema.parse({ loginHint: '  camila.bravo@ecopetrol.com.co ' }).loginHint).toBe(
      'camila.bravo@ecopetrol.com.co',
    );
    expect(a01QuerySchema.safeParse({ prompt: 'login' }).success).toBe(false);
  });

  it('A-02 callback carries state plus either code or an IdP error', () => {
    expect(a02QuerySchema.safeParse({ code: 'c0de', state: 's1' }).success).toBe(true);
    expect(
      a02QuerySchema.safeParse({
        state: 's1',
        error: 'access_denied',
        error_description: 'AADSTS50105',
      }).success,
    ).toBe(true);
    expect(a02QuerySchema.safeParse({ state: 's1' }).success).toBe(false);
    expect(a02QuerySchema.safeParse({ code: 'c0de' }).success).toBe(false);
  });

  it('A-02 redirects only inside the app and maps to the four SCR-01 codes', () => {
    const decision = { location: '/acceso', loginErrorCodes: ['unknown'] };
    expect(a02ResponseSchema.safeParse(decision).success).toBe(true);
    expect(a02ResponseSchema.safeParse({ ...decision, location: '//evil.example' }).success).toBe(
      false,
    );
    expect(a02ResponseSchema.safeParse({ ...decision, loginErrorCodes: ['expired'] }).success).toBe(
      false,
    );
  });

  it('A-04 accepts a missing avatar and default analysis, and the ADR-0004 csrfToken', () => {
    expect(a04ResponseSchema.safeParse(session).success).toBe(true);
    expect(a04ResponseSchema.safeParse({ ...session, csrfToken: 'tok_01' }).success).toBe(true);
    expect(a04ResponseSchema.safeParse({ ...session, role: 'admin' }).success).toBe(false);
  });

  it('V-01 unread count is a non-negative integer', () => {
    expect(v01ResponseSchema.safeParse({ unreadNotifications: 0, permissions: {} }).success).toBe(
      true,
    );
    expect(v01ResponseSchema.safeParse({ unreadNotifications: -1, permissions: {} }).success).toBe(
      false,
    );
    expect(v01ResponseSchema.safeParse({ unreadNotifications: 1.5, permissions: {} }).success).toBe(
      false,
    );
  });
});
