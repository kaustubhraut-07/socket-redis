const io = require('socket.io-client');

const numClients = 10; 
const clients = [];

for (let i = 0; i < numClients; i++) {
  const port = i % 2 === 0 ? 4000 : 4001; 
  const socket = io(`http://localhost:${port}`);

  socket.on('connect', () => {
    console.log(`Client ${i + 1} connected to port ${port}`);
    socket.emit('message', `Hello from client ${i + 1}`);
  });

  socket.on('message', (data) => {
    console.log(`Client ${i + 1} received message:`, data);
  });

//   socket.on('disconnect', () => {
//     console.log(`Client ${i + 1} disconnected`);
//   });

  clients.push(socket);
}


setTimeout(() => {
  clients.forEach((socket, index) => {
    socket.disconnect();
    console.log(`Client ${index + 1} disconnected manually`);
  });
}, 10000); 
