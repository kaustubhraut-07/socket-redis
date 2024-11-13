const redis = require('redis');
const client = redis.createClient({ host: 'localhost', port: 6379 });

client.on('error', (err) => {
  console.error('Error:', err);
});

client.on('connect', () => {
  console.log('Connected to Redis');

  for (let i = 0; i < 5; i++) {
    const message = `Message ${i}`;
    client.publish('mychannel', message, (err, reply) => {
      if (err) {
        console.error('Error publishing message:', err);
      } else {
        console.log(`Published: ${message}`);
      }
    });
    setTimeout(() => {}, 1000);  // Wait for 1 second before publishing the next message
  }

  // Keep the script running to allow the subscriber to receive messages
  // You can use a long timeout or an event-driven approach to keep the script alive
  setTimeout(() => {
    client.quit();
  }, 10000);  // Keep the script running for 10 seconds
});
