import * as express from 'express';
import * as path from 'path';

const app = express();
app.set('port', process.env.PORT || 3000);

const http = require('http').Server(app);
// set up socket.io and bind it to our
// http server.
const io = require('socket.io')(http, {
  cors: {
    origin: 'http://localhost:8080',
    methods: ['GET', 'POST']
  }
});

app.get('/', (req: any, res: any) => {
  // res.sendFile(path.resolve('./client/index.html'));
});

// whenever a user connects on port 3000 via
// a websocket, log that a user has connected
io.on('connection', function (socket: any) {
  console.log('a user connected');
  // whenever we receive a 'message' we log it out
  socket.on('computer', function (message: any) {
    console.log('From computer: ' + message);
  });
  socket.on('ipad', function (message: any) {
    console.log('From ipad: ' + message);
  });
  socket.on('phone', function (message: any) {
    console.log('From phone: ' + message);
  });
});

const server = http.listen(3000, function () {
  console.log('listening on *:3000');
});
