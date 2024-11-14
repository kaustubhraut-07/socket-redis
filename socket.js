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

io.on('connection', (socket) => {
  console.log('A new client connected');
  
  // Handle socket events here
  
  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

(async () => {
  const pubClient = createClient({ url: "redis://localhost:6379" });  
  const subClient = pubClient.duplicate();

  await Promise.all([pubClient.connect(),subClient.connect()]);

  io.adapter(createAdapter(pubClient, subClient));

  server.listen(4000, () => {
    console.log('Server listening on port 4000');
  });
})();