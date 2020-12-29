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
    <thumbnail ref="thumbnail" :startPos="startPos" />
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import io from 'socket.io-client';
import { DeviceType, MsgType } from '../../../src/interfaces';
import Thumbnail from '../components/Thumbnail.vue';
import { ItemInfo } from '../scene';
import Promise from 'bluebird';
import { backendUrl } from '../../../src/utils';

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
  length(): number {
    return Math.sqrt(this.x ** 2 + this.y ** 2);
  }
}

function getPosFromEvent(event: TouchEvent | MouseEvent): Pos {
  if (event instanceof TouchEvent) {
    const touches = event.touches;
    const pos = new Pos(0, 0);
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

abstract class BaseSelectionSolver {
  protected startPos: Pos;
  protected userPos: Pos;
  protected items: ItemInfo[];
  protected tableSize = { width: 600, height: 400 };
  protected ratio = 0.4;
  public constructor(items: ItemInfo[], userPos: Pos, startPos: Pos) {
    this.items = items;
    this.userPos = userPos;
    this.startPos = startPos;
  }
  public changeUserPos(userPos: Pos): void {
    this.userPos = userPos;
  }
  public changeStartPos(startPos: Pos): void {
    this.startPos = startPos;
  }
  public abstract solve(currentPos: Pos): number;
}

class AbsoluteSelectionSolver extends BaseSelectionSolver {
  public solve(currentPos: Pos): number {
    const deltaX = currentPos.x - this.startPos.x;
    const deltaY = currentPos.y - this.startPos.y;
    const realX = this.userPos.x + deltaX / this.ratio;
    const realY = this.userPos.y + deltaY / this.ratio;
    const direction = new Pos(deltaX / this.ratio, deltaY / this.ratio);
    // console.log('>>>>');
    // console.log(direction);

    let selID = null;
    let minCos = null;
    /*    let minDisSq = 100 ** 2;
    for (let i = 0; i < this.items.length; i++) {
      const item = this.items[i];
      const curDisSq = (realX - item.position.left) ** 2 + (realY - item.position.top) ** 2;
      if (curDisSq < minDisSq) {
        selID = i;
        minDisSq = curDisSq;
      }
    }*/
    for (let i = 0; i < this.items.length; i++) {
      const item = this.items[i];
      const itemDirection = new Pos(item.position.left - this.userPos.x, item.position.top - this.userPos.y);
      // console.log(itemDirection);
      const newCos =
        (direction.x * itemDirection.x + direction.y * itemDirection.y) / direction.length() / itemDirection.length();
      if (!minCos || minCos < newCos) {
        selID = i;
        minCos = newCos;
      }
    }
    return selID;
  }
  public changeUserPos(_userPos: Pos): void {
    return;
  }
  public changeStartPos(_startPos: Pos): void {
    return;
  }
}

class IncrementalSelectionSolver extends BaseSelectionSolver {
  public solve(currentPos: Pos): number | null {
    const deltaX = currentPos.x - this.startPos.x;
    const deltaY = currentPos.y - this.startPos.y;
    // if (deltaX < 10 && deltaY < 10) return null;
    const direction = new Pos(deltaX / this.ratio, deltaY / this.ratio);
    // console.log('>>>>');
    // console.log(direction);

    let selID = null;
    let minCos = null;
    /*    let minDisSq = 100 ** 2;
    for (let i = 0; i < this.items.length; i++) {
      const item = this.items[i];
      const curDisSq = (realX - item.position.left) ** 2 + (realY - item.position.top) ** 2;
      if (curDisSq < minDisSq) {
        selID = i;
        minDisSq = curDisSq;
      }
    }*/
    for (let i = 0; i < this.items.length; i++) {
      const item = this.items[i];
      const itemDirection = new Pos(item.position.left - this.userPos.x, item.position.top - this.userPos.y);
      if (item.position.left === this.userPos.x && item.position.top === this.userPos.y) continue;
      // console.log(itemDirection);
      const newCos =
        (direction.x * itemDirection.x + direction.y * itemDirection.y) / direction.length() / itemDirection.length();
      if (!minCos || minCos < newCos) {
        selID = i;
        minCos = newCos;
      }
    }
    return selID;
  }
}

export default Vue.extend({
  name: 'Home',
  components: {
    Thumbnail
  },
  data(): {
    deviceType: DeviceType;
    socket: io.Socket;
    items: ItemInfo[] | null;
    selID: number | null;
    userPos: Pos;
    startPos: Pos | null;
    solver: BaseSelectionSolver;
    updateStartPosPromise: Promise<void>;
  } {
    return {
      deviceType: DeviceType.iPad,
      socket: io.io('http://localhost:3000'),
      items: null,
      selID: null,
      userPos: new Pos(300, 300),
      startPos: null,
      solver: null,
      updateStartPosPromise: null
    };
  },
  mounted() {
    this.socket.emit('init', this.deviceType);
    this.socket.emit('message', `From ${DeviceType[this.deviceType]}`);
    this.socket.on('message', (message: any) => {
      // console.log(message);
    });
  },
  methods: {
    onSelectStart(event: TouchEvent | MouseEvent) {
      const thumbnail = this.$refs.thumbnail;
      this.items = thumbnail.items as ItemInfo[];
      const startPos = getPosFromEvent(event);
      this.startPos = startPos;
      this.solver = new AbsoluteSelectionSolver(this.items, this.userPos, startPos);
      console.log('Select start');
      // TODO: inform the server of showing thumbnail
      this.socket.emit(MsgType.TableSelection, 'OnSelectStart');
    },
    onSelectEnd() {
      this.socket.emit('message', `selected item: ${this.selID}`);
      console.log('Select end');
      this.solver = null;
      // TODO: inform the server of the end of selection
      this.socket.emit(MsgType.TableSelection, 'OnSelectEnd');
    },
    updatePos(currentPos: Pos, newSelID: number) {
      let canceled = false;
      const cancel = () => (canceled = true);
      const promise = new Promise((): void => {
        setTimeout(() => {
          if (canceled) console.log('canceled');
          else if (this.solver) {
            const newStartPos = new Pos(this.items[newSelID].position.left, this.items[newSelID].position.top);
            this.startPos = newStartPos;
            this.solver.changeUserPos(newStartPos);
            this.solver.changeStartPos(currentPos);
          }
        }, 500);
      });
      return { promise, cancel };
    },
    updateSelectedTarget(event: TouchEvent | MouseEvent) {
      const currentPos = getPosFromEvent(event);
      if (this.solver) {
        const newSelID = this.solver.solve(currentPos) ?? this.selID;
        if (newSelID != this.selID) {
          if (newSelID) {
            if (this.updateStartPosPromise) this.updateStartPosPromise.cancel();
            console.log('updated');
            this.updateStartPosPromise = this.updatePos(currentPos, newSelID);
          }
        }
        console.log(newSelID);
        this.selID = newSelID;
      }
    }
  },
  watch: {
    selID(newId, oldId) {
      // console.log(newId, oldId);
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
