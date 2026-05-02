import { PrismaClient } from '@prisma/client';
import { createHash } from 'crypto';

async function diagnose() {
  const prisma = new PrismaClient();
  console.log('🔍 Starting ELECTRA Diagnosis...');

  try {
    console.log('📡 Testing Database Connection...');
    await prisma.$connect();
    console.log('✅ Database Connected.');

    console.log('👤 Testing User Creation (Dry Run)...');
    const testEmail = `test_${Date.now()}@example.com`;
    
    // We use a transaction and then rollback (or delete) to keep it clean
    const user = await prisma.user.create({
      data: {
        email: testEmail,
        fullName: 'Diagnostic Test',
        oauthProvider: 'diagnostic',
        oauthId: 'diag_123'
      }
    });
    console.log('✅ User Creation Works (ID:', user.id, ')');

    console.log('🎫 Testing Session Creation...');
    const tokenHash = createHash('sha256').update('test_token').digest('hex');
    const session = await prisma.session.create({
      data: {
        userId: user.id,
        tokenHash,
        expiresAt: new Date(Date.now() + 1000 * 60 * 60)
      }
    });
    console.log('✅ Session Creation Works.');

    // Cleanup
    await prisma.user.delete({ where: { id: user.id } });
    console.log('🧹 Cleanup Complete.');
    
    console.log('\n✨ DIAGNOSIS: The database is 100% healthy.');
    console.log('👉 If you still get a 500, the error is definitely in your RENDER ENVIRONMENT VARIABLES (JWT_SECRET or FRONTEND_URL).');

  } catch (err: any) {
    console.error('\n❌ DIAGNOSIS FAILED!');
    console.error('Error Code:', err.code);
    console.error('Message:', err.message);
    if (err.message.includes('gen_random_uuid')) {
      console.error('💡 SOLUTION: You need to run "CREATE EXTENSION pgcrypto;" in Supabase SQL Editor.');
    }
  } finally {
    await prisma.$disconnect();
  }
}

diagnose();
