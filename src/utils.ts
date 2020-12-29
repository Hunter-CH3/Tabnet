import { DeviceInfo, DeviceType } from './interfaces';

export function toString(deviceInfo: DeviceInfo): string {
  return `${DeviceType[deviceInfo.deviceType]}, ${deviceInfo.deviceID}`;
}

export const backendUrl = 'http://localhost:3000';