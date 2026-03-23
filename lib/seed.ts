import { findByEmail, createUser, markEmailVerified } from './models/user.model';
import { hashPassword } from './utils/password.utils';

const seedDatabase = async (): Promise<void> => {
  const existing = await findByEmail('juan@company.com');
  if (existing) { 
    console.log('⚠️ Los usuarios de prueba ya existen en Neon.');
    return; 
  }

  const passwordHash = await hashPassword('Empresa123!');

  const u1 = await createUser({ fullName: 'Juanchi',               email: 'juan@company.com',    passwordHash, role: 'company'   });
  const u2 = await createUser({ fullName: 'Juanchi',               email: 'juan@candidate.com',  passwordHash, role: 'candidate' });
  const u3 = await createUser({ fullName: 'Jesus Manuel Martinez', email: 'jmanuel@company.com', passwordHash, role: 'company'   });
  const u4 = await createUser({ fullName: 'Jesus Manuel Martinez', email: 'jmanuel@candidate.com', passwordHash, role: 'candidate' });

  await markEmailVerified(u1.id);
  await markEmailVerified(u2.id);
  await markEmailVerified(u3.id);
  await markEmailVerified(u4.id);

  console.log(`
  ✅ Seed completado en Neon:
     juan@company.com      / Empresa123!
     juan@candidate.com    / Empresa123!
     jmanuel@company.com   / Empresa123!
     jmanuel@candidate.com / Empresa123!
  `);
};

// Ejecutar la función y cerrar el proceso
seedDatabase()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });