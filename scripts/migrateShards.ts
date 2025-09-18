// Script to run migrations on all shard databases
import { execSync } from 'child_process';
import dotenv from 'dotenv';

dotenv.config();

interface ShardConfig {
  id: number;
  url: string | undefined;
}

const shards: ShardConfig[] = [
  { id: 0, url: process.env.DATABASE_URL_SHARD_0 },
  { id: 1, url: process.env.DATABASE_URL_SHARD_1 },
  { id: 2, url: process.env.DATABASE_URL_SHARD_2 }
];

console.log('Running migrations on all shard databases...\n');

shards.forEach(shard => {
  if (!shard.url) {
    console.log(`DATABASE_URL_SHARD_${shard.id} not found in .env file`);
    return;
  }

  try {
    console.log(`Migrating shard ${shard.id}...`);
    
    // Set DATABASE_URL and run migration
    execSync('npx prisma migrate deploy', { 
      stdio: 'inherit',
      env: { ...process.env, DATABASE_URL: shard.url }
    });
    
    console.log(`Shard ${shard.id} migrated successfully\n`);
  } catch (error) {
    console.error(`Error migrating shard ${shard.id}:`, (error as Error).message);
  }
});

console.log('All shard migrations completed!');