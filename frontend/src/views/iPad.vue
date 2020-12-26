<template>
  <div class="iPad" @touchstart="onSelectStart" @touchend="onSelectEnd" @touchmove="updateSelectedTarget">
    <h1>iPad</h1>
    <thumbnail ref="thumbnail" />
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import io from 'socket.io-client';
import { DeviceType } from '../../../src/interfaces';
import Thumbnail, { ItemInfo } from '../components/Thumbnail.vue';

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
      selStartPos: null,
      selId: null
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
    onSelectStart(event: TouchEvent) {
      const thumbnail = this.$refs.thumbnail;
      this.items = thumbnail.items as ItemInfo[];
      this.selStartPos = { x: event.x, y: event.y };
    },
    onSelectEnd() {
      if (this.selId === null) {
        this.selId = 0;
      } else {
        this.selId = (this.selId + 1) % this.items.length;
      }
    },
    updateSelectedTarget(event: TouchEvent) {
      console.log(event);
    }
  },
  watch: {
    selId(newId, oldId) {
      if (newId !== null) {
        if (oldId !== null) this.$refs.thumbnail.unselectItem(oldId);
        this.$refs.thumbnail.selectItem(newId);
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