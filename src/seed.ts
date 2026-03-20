import { findByEmail, createUser } from './models/user.model';
import { hashPassword } from './utils/password.utils';

export const seedDatabase = async (): Promise<void> => {
  const testEmail = 'juan@company.com';
  const testCandidate = 'juan@candidate.com';

  const testEmail2 = 'jmanuel@company.com';
  const testCandidate2 = 'jmanuel@candidate.com';

  if (findByEmail(testEmail)) return;

  const passwordHash = await hashPassword('Empresa123!');
  const passwordHash2 = await hashPassword('Empresa123!');


  createUser({
    fullName: 'Juanchi',
    email: testEmail,
    passwordHash,
    role: 'company',
  });
  createUser({
    fullName: 'Juanchi',
    email: testCandidate,
    passwordHash,
    role: 'candidate',
  });
  createUser({
    fullName: 'Jesus Manuel Martinez',
    email: testEmail2,
    passwordHash,
    role: 'company'
  })
  createUser({
    fullName: 'Jesus Manuel Martinez',
    email: testCandidate2,
    passwordHash,
    role: 'candidate'
  })

  console.log(`
  ✅ Usuario de prueba creado:
     Email:      ${testEmail}
     Contraseña: Empresa123!
     Rol:        company
  `);
  console.log(`
  ✅ Usuario de prueba creado:
     Email:      ${testEmail2}
     contraseña: Empresa123!
     Rol:        company
  `);
};