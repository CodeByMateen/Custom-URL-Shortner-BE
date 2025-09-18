# Database Sharding Implementation

This document explains how to implement database sharding for your URL shortener to handle massive scale.

## What is Database Sharding?

Database sharding is a horizontal scaling technique where you split your database into multiple smaller databases (shards) based on a sharding key. Each shard contains a subset of your data.

## Sharding Strategies Implemented

### 1. Hash-Based Sharding (Recommended)
- Uses a hash function on the `shortCode` to determine which shard to use
- Provides even distribution of data
- Simple to implement and maintain

### 2. Range-Based Sharding
- Splits data based on character ranges (e.g., shortCodes starting with 'a'-'m')
- Good for alphabetical ordering but may cause uneven distribution

### 3. Directory-Based Sharding
- Uses a lookup table to determine shard location
- Most flexible but requires additional metadata management

## Implementation Files

- `src/config/sharding.ts` - Sharding configuration
- `src/utils/sharding.ts` - Sharding logic and utilities
- `src/utils/prismaSharded.ts` - Prisma client management for shards
- `src/services/urlServiceSharded.ts` - Sharded URL service
- `src/scripts/migrateToShards.ts` - Data migration script

## Setup Instructions

### 1. Configure Environment Variables

Copy `src/config/sharding.env.example` to your `.env` file:

```bash
# Set up your shard databases
DATABASE_URL_SHARD_0="postgresql://user:pass@localhost:5432/urlshortener_shard_0"
DATABASE_URL_SHARD_1="postgresql://user:pass@localhost:5432/urlshortener_shard_1"
DATABASE_URL_SHARD_2="postgresql://user:pass@localhost:5432/urlshortener_shard_2"

# Configure sharding
SHARDING_STRATEGY="hash"
TOTAL_SHARDS=3
```

### 2. Create Shard Databases

Create separate PostgreSQL databases for each shard:

```sql
-- Create databases
CREATE DATABASE urlshortener_shard_0;
CREATE DATABASE urlshortener_shard_1;
CREATE DATABASE urlshortener_shard_2;
```

### 3. Run Migrations on Each Shard

```bash
# Set DATABASE_URL to each shard and run migrations
DATABASE_URL="postgresql://user:pass@localhost:5432/urlshortener_shard_0" npx prisma migrate deploy
DATABASE_URL="postgresql://user:pass@localhost:5432/urlshortener_shard_1" npx prisma migrate deploy
DATABASE_URL="postgresql://user:pass@localhost:5432/urlshortener_shard_2" npx prisma migrate deploy
```

### 4. Migrate Existing Data

Run the migration script to move existing data to shards:

```bash
npx ts-node src/scripts/migrateToShards.ts
```

### 5. Update Your Application

Replace the original `UrlService` with `UrlServiceSharded` in your controllers:

```typescript
// In urlController.ts
import { UrlServiceSharded } from "../services/urlServiceSharded";

const urlService = new UrlServiceSharded();
```

## Benefits of Sharding

1. **Horizontal Scaling**: Add more shards as your data grows
2. **Improved Performance**: Smaller databases = faster queries
3. **Fault Isolation**: If one shard fails, others continue working
4. **Parallel Processing**: Operations can run across multiple shards simultaneously

## Considerations

### Challenges
- **Cross-shard Queries**: Getting all URLs requires querying all shards
- **Data Consistency**: No ACID transactions across shards
- **Complexity**: More complex deployment and monitoring

### Best Practices
- **Consistent Hashing**: Use hash-based sharding for even distribution
- **Monitor Shard Sizes**: Ensure balanced data distribution
- **Cache Aggressively**: Use Redis to reduce cross-shard queries
- **Plan for Growth**: Design sharding key to handle future scaling

## Monitoring Shards

Use the built-in statistics method to monitor shard health:

```typescript
const urlService = new UrlServiceSharded();
const stats = await urlService.getShardStatistics();
console.log('Shard statistics:', stats);
```

## Scaling Further

When you need more capacity:

1. **Add More Shards**: Update configuration and redistribute data
2. **Read Replicas**: Add read-only replicas for each shard
3. **Caching Layer**: Implement more aggressive caching
4. **CDN**: Use CDN for static content and frequently accessed URLs

## Production Considerations

- **Backup Strategy**: Backup each shard independently
- **Monitoring**: Monitor each shard's performance and health
- **Load Balancing**: Distribute read/write operations across shards
- **Disaster Recovery**: Plan for shard failure scenarios

