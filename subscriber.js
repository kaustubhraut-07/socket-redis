const redis = require('redis');
const client = redis.createClient({ host: 'localhost', port: 6379 });

client.on('error', (err) => {
  console.error('Error:', err);
});

client.on('connect', () => {
  console.log('Connected to Redis');

  client.subscribe('mychannel');

  client.on('message', (channel, message) => {
    console.log(`Received: ${message}`);
  });
});

// Keep the script running indefinitely
process.stdin.resume();
