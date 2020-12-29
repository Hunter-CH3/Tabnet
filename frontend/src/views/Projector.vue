<template>
  <div class="main">
    <img :src="imgUrl" class="img-responsive" />
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import io from 'socket.io-client';
import Thumbnail from '../components/Thumbnail.vue';
import { items } from '../scene';
import { DeviceType, MsgType } from '../../../src/interfaces';
import { backendUrl } from '../../../src/utils';

export default Vue.extend({
  name: 'Home',
  data() {
    return {
      deviceType: DeviceType.TV,
      socket: io.io(backendUrl),
      imgUrl: ''
    };
  },
  mounted() {
    this.socket.emit('init', this.deviceType);
    this.socket.on(MsgType.ScreenCast, (url: string) => {
      this.imgUrl = url;
      console.log(url);
    });
  }
});
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.main {
  width: auto;
  height: auto;
}

.img-responsive {
  display: inline-block;
  height: auto;
  max-width: 100%;
}
</style>
