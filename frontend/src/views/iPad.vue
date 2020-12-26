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
import { DeviceType } from '../../../src/interfaces';
import Thumbnail, { ItemInfo } from '../components/Thumbnail.vue';

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
  public constructor(items: ItemInfo[], userPos: Pos, startPos: Pos) {
    this.items = items;
    this.userPos = userPos;
    this.startPos = startPos;
  }
  public solve(currentPos: Pos): number {
    console.log(`current position: ${currentPos}`);
    return 0;
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
    },
    onSelectEnd() {
      this.socket.emit('message', `selected item: ${this.selId}`);
      this.solver = null;
      // TODO: inform the server of the end of selection
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
      if (newId !== null) {
        if (oldId !== null) this.$refs.thumbnail.unselectItem(oldId);
        this.$refs.thumbnail.selectItem(newId);
        // TODO: inform the server of updating selected target
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