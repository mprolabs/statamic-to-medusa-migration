const Redis = require('ioredis');

async function testRedisConnection() {
  console.log('Testing Redis connection...');
  const redis = new Redis('redis://localhost:6379');
  
  try {
    await redis.set('test-key', 'Hello from Bolen Ana Pro!');
    const value = await redis.get('test-key');
    console.log('Redis connection successful!');
    console.log(`Retrieved test value: ${value}`);
    await redis.del('test-key');
  } catch (error) {
    console.error('Redis connection failed:', error.message);
  } finally {
    redis.disconnect();
  }
}

testRedisConnection();
