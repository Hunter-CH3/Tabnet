export enum DeviceType {
  Computer = 0,
  iPad,
  Phone
}

export interface DeviceInfo {
  deviceType: DeviceType;
  deviceID: string;
}
