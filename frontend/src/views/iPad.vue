<template>
  <div
    class="iPad"
    @touchstart="onSelectStart"
    @touchend="onSelectEnd"
    @touchmove="updateSelectedTarget"
    @mousedown="onSelectStart"
    @mouseup="onSelectEnd"
    @mousemove="updateSelectedTarget"
  >
    <h1>iPad</h1>
    <thumbnail ref="thumbnail" />
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import io from 'socket.io-client';
import { DeviceType, MsgType } from '../../../src/interfaces';
import Thumbnail from '../components/Thumbnail.vue';
import { ItemInfo } from '../scene';

class Pos {
  x: number;
  y: number;
  public constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }
  toString(): string {
    return `x: ${this.x}, y: ${this.y}`;
  }
}

function getPosFromEvent(event: TouchEvent | MouseEvent): { x: number; y: number } {
  if (event instanceof TouchEvent) {
    const touches = event.touches;
    const pos = { x: 0, y: 0 };
    for (let i = 0; i < touches.length; i++) {
      const touch = touches.item(i);
      pos.x += touch.clientX;
      pos.y += touch.clientY;
    }
    pos.x /= touches.length;
    pos.y /= touches.length;
    return pos;
  } else {
    return new Pos(event.x, event.y);
  }
}

enum SolverType {
  ABSOLUTE, // 用户的输入通过线性的映射直接作用到桌面物体坐标上
  INCREMENTAL // 增量式修正，例如用户一开始移到了某一个位置，某物体亮；用户再向右修正（一个阈值），目标自动更新到该物体右侧的物体上
}

class AbsoluteSelectionSolver {
  private startPos: Pos;
  private userPos: Pos;
  private items: ItemInfo[];
  private tableSize = { width: 600, height: 400 };
  private ratio = 0.4;
  public constructor(items: ItemInfo[], userPos: Pos, startPos: Pos) {
    this.items = items;
    this.userPos = userPos;
    this.startPos = startPos;
  }
  public solve(currentPos: Pos): number {
    const deltaX = currentPos.x - this.startPos.x;
    const deltaY = currentPos.y - this.startPos.y;
    const realX = this.userPos.x + deltaX / this.ratio;
    const realY = this.userPos.y + deltaY / this.ratio;

    let selId = null;
    let minDisSq = 100 ** 2;
    for (let i = 0; i < this.items.length; i++) {
      const item = this.items[i];
      const curDisSq = (realX - item.position.left) ** 2 + (realY - item.position.top) ** 2;
      if (curDisSq < minDisSq) {
        selId = i;
        minDisSq = curDisSq;
      }
    }
    return selId;
  }
}

export default Vue.extend({
  name: 'Home',
  components: {
    Thumbnail
  },
  data() {
    return {
      deviceType: DeviceType.iPad,
      socket: io.io('http://localhost:3000'),
      users: [],
      items: null,
      selId: null,
      userPos: new Pos(300, 300),
      solver: null
    };
  },
  mounted() {
    this.socket.emit('init', this.deviceType);
    this.socket.emit('message', `From ${DeviceType[this.deviceType]}`);
    this.socket.on('message', (message: any) => {
      console.log(message);
    });
  },
  methods: {
    onSelectStart(event: TouchEvent | MouseEvent) {
      const thumbnail = this.$refs.thumbnail;
      this.items = thumbnail.items as ItemInfo[];
      const startPos = getPosFromEvent(event);
      this.solver = new AbsoluteSelectionSolver(this.items, this.userPos, startPos);
      // TODO: inform the server of showing thumbnail
      this.socket.emit(MsgType.TableSelection, 'OnSelectStart');
    },
    onSelectEnd() {
      this.socket.emit('message', `selected item: ${this.selId}`);
      this.solver = null;
      // TODO: inform the server of the end of selection
      this.socket.emit(MsgType.TableSelection, 'OnSelectEnd');
    },
    updateSelectedTarget(event: TouchEvent | MouseEvent) {
      const currentPos = getPosFromEvent(event);
      if (this.solver) {
        this.selId = this.solver.solve(currentPos);
      }
    }
  },
  watch: {
    selId(newId, oldId) {
      console.log(newId, oldId);
      if (newId !== null) {
        this.$refs.thumbnail.selectItem(newId);
        // TODO: inform the server of updating selected target
        this.socket.emit(MsgType.TableSelection, newId);
      }
    }
  }
});
</script>

<style scoped>
.iPad {
  height: 80vh;
}

.thumbnail {
  margin: 0 auto;
}

* {
  -webkit-touch-callout: none;

  /* iOS Safari */
  -webkit-user-select: none;

  /* Safari */
  -khtml-user-select: none;

  /* Konqueror HTML */
  -moz-user-select: none;

  /* Firefox */
  -ms-user-select: none;

  /* Internet Explorer/Edge */
  user-select: none;

  /* Non-prefixed version, currently supported by Chrome and Opera */
}
</style>
