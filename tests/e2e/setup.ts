import { execSync } from 'child_process'

export async function setup() {
  // Ensure test DB is migrated
  process.env.DATABASE_URL ??= 'postgresql://postgres:postgres@localhost:5432/caraggregator_test'
  process.env.REDIS_HOST ??= 'localhost'
  try {
    execSync('npx prisma migrate deploy', {
      cwd: '../packages/database',
      env: { ...process.env },
      stdio: 'inherit',
    })
  } catch {
    // migration may already be applied
  }
}

export async function teardown() {}
