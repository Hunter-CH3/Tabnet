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

const itemsAll = {
  'scene1': [
    new ItemInfo(100, 100, 'Alice'),
    new ItemInfo(300, 100, 'Bob'),
    new ItemInfo(500, 100, 'Carol'),
    new ItemInfo(100, 300, 'Dave'),
    // new ItemInfo(300, 300),
    new ItemInfo(500, 300, 'Eve')
  ],
  'scene2': [
    new ItemInfo(100, 100, 'Alice'),
    new ItemInfo(500, 100, 'Bob'),
  ],
  'scene3': [
    new ItemInfo(200, 100, 'Alice'),
    new ItemInfo(300, 100, 'Bob'),
    new ItemInfo(400, 100, 'Carol')
  ],
  'scene4': [
    new ItemInfo(100, 100, 'Alice'),
    new ItemInfo(180, 100, 'Bob'),
    new ItemInfo(100, 180, 'Carol'),
    new ItemInfo(500, 100, 'Dave'),
    new ItemInfo(420, 100, 'Eve'),
    new ItemInfo(500, 180, 'Francis')
  ]
};

export const items = itemsAll['scene2'];
