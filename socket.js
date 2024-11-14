// const express = require('express');
// const { createServer } = require('node:http');
// const { join } = require('node:path');
// const { Server } = require('socket.io');

// const app = express();
// const server = createServer(app);
// const io = new Server(server);

// app.get('/', (req, res) => {
//   res.sendFile(join(__dirname, 'index.html'));
// });


// io.on('connection', (socket) => {
//     // console.log('a user connected');
//     socket.on('message', (msg) => {
//         console.log('message: ' + msg);
//       });

//       socket.on('chat message', (msg) => {
//         socket.broadcast.emit('chat message', msg);
//       });
//     socket.on('disconnect', () => {
//       console.log('user disconnected');
//     });
//   });

// server.listen(3000, () => {
//   console.log('server running at http://localhost:3000');
// });

// import express from 'express';
// import { createServer } from 'http';
// import { Server } from 'socket.io';
// import { createClient } from 'redis';
// import { createAdapter } from '@socket.io/redis-adapter';
const express = require('express');
const { createServer } = require('node:http');
const { join } = require('node:path');
const { Server } = require('socket.io');
const { createClient } = require('redis');
const { createAdapter } = require('@socket.io/redis-adapter');

const app = express();
const server = createServer(app);

const localDomains = [
  'http://localhost:3000',
];

const io = new Server(server, {
  cors: {
    credentials: true,
    origin: localDomains
  },
  maxHttpBufferSize: 1e8,
});

app.get('/', (req, res) => {
  res.sendFile(join(__dirname, 'index.html'));
});

io.on('connection', (socket) => {
  console.log('A new client connected');

  socket.on('message', (data) => {
    console.log('Received message:', data);
    io.emit('message', data); // Broadcast the message to all connected clients
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

let pubClient, subClient;

(async () => {
  pubClient = createClient({ url: "redis://localhost:6379" });
  subClient = pubClient.duplicate();

  pubClient.on('error', (err) => console.error('Redis Pub Client Error:', err));
  subClient.on('error', (err) => console.error('Redis Sub Client Error:', err));

  await Promise.all([pubClient.connect(), subClient.connect()]);

  io.adapter(createAdapter(pubClient, subClient));

  const port = process.env.PORT || 4000;
  server.listen(port, () => {
    console.log(`Server listening on port ${port}`);
  });

  // Graceful shutdown
  process.on('SIGINT', async () => {
    console.log('SIGINT signal received.');
    await shutdown();
  });

  process.on('SIGTERM', async () => {
    console.log('SIGTERM signal received.');
    await shutdown();
  });
})();

async function shutdown() {
  console.log('Shutting down server...');
  io.close(() => {
    console.log('Socket.IO server closed.');
    server.close(async () => {
      console.log('HTTP server closed.');
      await pubClient.disconnect();
      await subClient.disconnect();
      console.log('Redis clients disconnected.');
      process.exit(0);
    });
  });
}
