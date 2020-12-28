export class ItemInfo {
  position: {
    left: number;
    top: number;
  };
  text = '';
  public constructor(left: number, top: number, text?: string) {
    this.position = { left: left, top: top };
    if (text) this.text = text;
  }
}

export const items = [
  new ItemInfo(100, 100, 'Alice'),
  new ItemInfo(300, 100, 'Bob'),
  new ItemInfo(500, 100, 'Carol'),
  new ItemInfo(100, 300, 'Dave'),
  // new ItemInfo(300, 300),
  new ItemInfo(500, 300, 'Eve')
];
