import ep from 'embedded-postgres';
import path from 'path';
import fs from 'fs';
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const EmbeddedPostgres = (ep as any).default || ep;

async function run() {
  const dataDir = path.resolve(process.cwd(), '.embedded-postgres');
  console.log('Starting Embedded PostgreSQL in:', dataDir);

  const pidFile = path.join(dataDir, 'postmaster.pid');
  if (fs.existsSync(pidFile)) {
    try {
      fs.unlinkSync(pidFile);
    } catch {
      // ignore
    }
  }

  const pg = new EmbeddedPostgres({
    databaseDir: dataDir,
    port: 5432,
    user: 'postgres',
    password: 'postgres',
    initialDatabase: 'artvest',
  });

  const isInitialized = fs.existsSync(path.join(dataDir, 'PG_VERSION'));
  if (!isInitialized) {
    await pg.initialise();
  }
  await pg.start();
  console.log('✓ Embedded PostgreSQL is running on localhost:5432 with database "artvest"');

  // Keep alive if run directly
  process.on('SIGINT', async () => {
    console.log('Stopping Embedded Postgres...');
    await pg.stop();
    process.exit(0);
  });
}

run().catch((err) => {
  console.error('Failed to start embedded postgres:', err);
  process.exit(1);
});
