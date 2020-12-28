export enum DeviceType {
  Computer = 0,
  iPad,
  Phone
}

export interface DeviceInfo {
  deviceType: DeviceType;
  deviceID: string;
}

export enum MsgType {
  pc_to_phone = "PC_TO_PHONE",            // 手机和电脑始终定期将当前文本框中的内容发给server，当用户拿起/放下手机时，
  // 在server终端键入，server将档案保存的文本发送给电脑/手机
  phone_to_pc = "PHONE_TO_PC",
  single_scenario = "SINGLE_SCENARIO",    // 单人场景，似乎不需要这个type
  meeting_scenario = "MEETING_SCENARIO",  // 会议场景，server端在终端触发，发送一个msg给PC，PC切换当前页面
  table_selection = "TABLE_SELECTION"     // "TableSelectOn", "TableSelectEnd", ${selectedId} server收到之后直接转发给PC就好
}