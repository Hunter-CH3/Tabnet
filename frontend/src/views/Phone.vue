<template>
  <h1>Phone</h1>
</template>

<script lang="ts">
import Vue from 'vue';
import io from 'socket.io-client';
import { DeviceType } from '../../../src/interfaces';

export default Vue.extend({
  name: 'Home',
  data() {
    return {
      deviceType: DeviceType.Phone,
      socket: io.io('http://localhost:3000'),
      users: []
    };
  },
  mounted() {
    this.socket.emit('init', this.deviceType);
    this.socket.emit('message', `From ${DeviceType[this.deviceType]}`);
    this.socket.on('message', (message: any) => {
      console.log(message);
    });
  }
});
</script>
