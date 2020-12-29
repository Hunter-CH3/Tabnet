import { Socket } from 'socket.io';
import { DeviceInfo, DeviceType } from './interfaces';
import { toString } from './utils';

class DeviceController {
  idToSocket: Map<DeviceInfo, Socket> = new Map();
  emit(deviceInfo: DeviceInfo, event: string, ...data: any): void {
    this.idToSocket.get(deviceInfo).emit(event, ...data);
  }
  onConnect(deviceInfo: DeviceInfo, socket: Socket): void {
    console.log(`Device [${toString(deviceInfo)}] connected`);
    this.idToSocket.set(deviceInfo, socket);
  }
  onDisconnect(deviceInfo: DeviceInfo): void {
    this.idToSocket.delete(deviceInfo);
    console.log(`Device [${toString(deviceInfo)}] disconnected`);
  }
  onMessage(deviceInfo: DeviceInfo, message: string): void {
    console.log(`Messsage '${message}' from [${toString(deviceInfo)}]`);
    this.emit(deviceInfo, 'message', 'From controller');
  }
  broadcast(deviceType: DeviceType, event: string, ...data: any): void {
    this.idToSocket.forEach((value, key) => {
      if (key.deviceType == deviceType) this.emit(key, event, ...data);
    });
  }
}

const deviceController = new DeviceController();

export default deviceController;
