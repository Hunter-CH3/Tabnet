import * as express from 'express';
import * as socketio from 'socket.io';
import { Socket } from 'socket.io';
import * as http from 'http';
import deviceController from './controller';
import { DeviceType, DeviceInfo, MsgType } from './interfaces';
import { validateLocaleAndSetLanguage } from 'typescript';

const app = express();

app.set('port', process.env.PORT || 3000);

const httpServer = new http.Server(app);

const io = new socketio.Server(httpServer, {
  cors: {
    // origin: 'http://localhost:8080',
    methods: ['GET', 'POST']
  }
});

io.on('connection', function (socket: Socket) {
  let deviceInfo: DeviceInfo | null;
  socket.on('init', (deviceType: DeviceType) => {
    deviceInfo = {
      deviceType,
      deviceID: socket.id
    };
    deviceController.onConnect(deviceInfo, socket);
  });
  socket.on('message', (message: any) => deviceController.onMessage(deviceInfo, message));
  socket.on('scenario', (message: any) => deviceController.broadcast(DeviceType.Computer, 'scenario', message));
  socket.on(MsgType.TableSelection, (message: any) =>
    deviceController.broadcast(DeviceType.Computer, MsgType.TableSelection, message)
  );
  socket.on(MsgType.PhoneToPC, (message: any) =>
    deviceController.broadcast(DeviceType.Computer, MsgType.PhoneToPC, message)
  );
  socket.on(MsgType.PCToPhone, (message: any) =>
    deviceController.broadcast(DeviceType.Phone, MsgType.PCToPhone, message)
  );
  socket.on(MsgType.ScreenCast, (message: any) =>
    deviceController.broadcast(DeviceType.TV, MsgType.ScreenCast, message)
  );
  socket.once('disconnect', () => {
    if (deviceInfo) deviceController.onDisconnect(deviceInfo);
  });
});

httpServer.listen(3000, function () {
  console.log('listening on *:3000');
});
