import { Socket } from 'socket.io';
import { DeviceInfo, DeviceType } from './interfaces';
import { toString } from './utils';

class DeviceController {
  idToSocket: Map<string, Socket> = new Map();
  emit(deviceInfo: DeviceInfo, event: string, ...data: any): void {
    this.idToSocket.get(deviceInfo.deviceID).emit(event, ...data);
  }
  onConnect(deviceInfo: DeviceInfo, socket: Socket): void {
    console.log(`Device [${toString(deviceInfo)}] connected`);
    this.idToSocket.set(deviceInfo.deviceID, socket);
  }
  onDisconnect(deviceInfo: DeviceInfo): void {
    this.idToSocket.delete(deviceInfo.deviceID);
    console.log(`Device [${toString(deviceInfo)}] disconnected`);
  }
  onMessage(deviceInfo: DeviceInfo, message: string): void {
    console.log(`Messsage '${message}' from [${toString(deviceInfo)}]`);
    this.emit(deviceInfo, 'message', 'From controller');
  }
}

const deviceController = new DeviceController();

export default deviceController;
