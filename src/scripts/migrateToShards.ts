import { PrismaClient } from '@prisma/client';
import { getShardingConfig } from '../config/sharding';
import { getShardId } from '../utils/shardingUtils';
import { getPrismaClientByShardId } from '../database/prismaSharded';

/**
 * Migration script to move existing data from single database to sharded databases
 * Run this script to migrate your existing URLs to the sharded setup
 */

/**
 * To run the script
 * npx ts-node src/scripts/migrateToShards.ts
 */

async function migrateDataToShards() {
  console.log('Starting migration to sharded databases...');
  
  const config = getShardingConfig();
  const sourcePrisma = new PrismaClient(); // Original database
  
  try {
    // Get all existing URLs from the source database
    console.log('Fetching existing URLs...');
    const existingUrls = await sourcePrisma.url.findMany({
      orderBy: { createdAt: 'asc' }
    });
    
    console.log(`Found ${existingUrls.length} URLs to migrate`);
    
    let migratedCount = 0;
    let errorCount = 0;
    
    // Migrate each URL to its appropriate shard
    for (const url of existingUrls) {
      try {
        // Determine which shard this URL should go to
        const shardId = getShardId(url.shortCode, config);
        const targetPrisma = getPrismaClientByShardId(shardId, config);
        
        // Check if URL already exists in target shard
        const existingInShard = await targetPrisma.url.findUnique({
          where: { shortCode: url.shortCode }
        });
        
        if (!existingInShard) {
          // Create URL in the target shard
          await targetPrisma.url.create({
            data: {
              id: url.id,
              originalUrl: url.originalUrl,
              shortCode: url.shortCode,
              createdAt: url.createdAt,
              expiresAt: url.expiresAt
            }
          });
          
          migratedCount++;
          
          if (migratedCount % 100 === 0) {
            console.log(`Migrated ${migratedCount} URLs...`);
          }
        } else {
          console.log(`URL ${url.shortCode} already exists in shard ${shardId}`);
        }
        
      } catch (error) {
        console.error(`Error migrating URL ${url.shortCode}:`, error);
        errorCount++;
      }
    }
    
    console.log(`Migration completed!`);
    console.log(`- Successfully migrated: ${migratedCount} URLs`);
    console.log(`- Errors: ${errorCount} URLs`);
    
    // Verify migration by checking counts
    console.log('\nVerifying migration...');
    const shardStats = await getShardStatistics(config);
    
    console.log('Shard statistics:');
    shardStats.forEach(stat => {
      console.log(`- Shard ${stat.shardId}: ${stat.count} URLs`);
    });
    
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  } finally {
    await sourcePrisma.$disconnect();
  }
}

async function getShardStatistics(config: any) {
  const { executeAcrossAllShards } = await import('../database/prismaSharded');
  
  const results = await executeAcrossAllShards(
    config,
    async (prisma: PrismaClient, shardId: number) => {
      const count = await prisma.url.count();
      return { shardId, count };
    }
  );

  return Array.from(results.values());
}

// Run migration if this script is executed directly
if (require.main === module) {
  migrateDataToShards()
    .then(() => {
      console.log('Migration script completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Migration script failed:', error);
      process.exit(1);
    });
}

export { migrateDataToShards };

