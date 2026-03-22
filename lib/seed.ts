import { findByEmail, createUser } from './models/user.model';
import { hashPassword } from './utils/password.utils';

let seeded = false;

export const seedDatabase = async (): Promise<void> => {
  // Evitar re-seed en hot reload de Next.js
  if (seeded) return;

  const testEmail      = 'juan@company.com';
  const testCandidate  = 'juan@candidate.com';
  const testEmail2     = 'jmanuel@company.com';
  const testCandidate2 = 'jmanuel@candidate.com';

  if (findByEmail(testEmail)) {
    seeded = true;
    return;
  }

  const passwordHash = await hashPassword('Empresa123!');

  createUser({ fullName: 'Juanchi',               email: testEmail,      passwordHash, role: 'company'   });
  createUser({ fullName: 'Juanchi',               email: testCandidate,  passwordHash, role: 'candidate' });
  createUser({ fullName: 'Jesus Manuel Martinez', email: testEmail2,     passwordHash, role: 'company'   });
  createUser({ fullName: 'Jesus Manuel Martinez', email: testCandidate2, passwordHash, role: 'candidate' });

  seeded = true;

  console.log(`
  ✅ Usuarios de prueba creados:
     ${testEmail}      / Empresa123! / company
     ${testCandidate}  / Empresa123! / candidate
     ${testEmail2}    / Empresa123! / company
     ${testCandidate2}/ Empresa123! / candidate
  `);
};
