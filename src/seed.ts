import { findByEmail, createUser } from './models/user.model';
import { hashPassword } from './utils/password.utils';

export const seedDatabase = async (): Promise<void> => {
    const testEmail = 'empresa@recruitpro.com';

    if (findByEmail(testEmail)) return;

    const passwordHash = await hashPassword('Empresa123!');

    createUser({
        fullName: 'Tech Corp SA',
        email: testEmail,
        passwordHash,
        role: 'company',
    });

    console.log(`
  ✅ Usuario de prueba creado:
     Email:      ${testEmail}
     Contraseña: Empresa123!
     Rol:        company
  `);
};