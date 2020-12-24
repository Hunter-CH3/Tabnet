import { DeviceInfo, DeviceType } from './interfaces';

export function toString(deviceInfo: DeviceInfo): string {
  return `${DeviceType[deviceInfo.deviceType]}, ${deviceInfo.deviceID}`;
}
