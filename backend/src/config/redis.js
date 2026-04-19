import Redis from 'ioredis';

const createRedisClient = () => {
  const client = new Redis(process.env.REDIS_URL, {
    maxRetriesPerRequest: 3,
    retryStrategy: (times) => Math.min(times * 100, 3000),
    lazyConnect: true,
  });
  client.on('connect', () => console.log('✅ Redis connected'));
  client.on('error', (err) => console.error('❌ Redis error:', err.message));
  return client;
};

export const redis = createRedisClient();
export const pubClient = createRedisClient();
export const subClient = createRedisClient();
