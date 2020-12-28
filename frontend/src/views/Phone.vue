<template>
  <div class="phone">
    <h1>Phone</h1>
    <el-input v-model="title" placeholder="title"></el-input>
    <el-input v-model="content" type="textarea" placeholder="content"></el-input>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import io from 'socket.io-client';
import { DeviceType, MsgType } from '../../../src/interfaces';

export default Vue.extend({
  name: 'Home',
  data() {
    return {
      deviceType: DeviceType.Phone,
      socket: io.io('http://localhost:3000'),
      users: [],
      title: '',
      content: ''
    };
  },
  mounted() {
    this.socket.emit('init', this.deviceType);
    this.socket.emit('message', `From ${DeviceType[this.deviceType]}`);
    this.socket.on('message', (message: any) => {
      console.log(message);
    });
    window.setInterval(() => {
      this.socket.emit('message', JSON.stringify({ title: this.title, content: this.content }));
    }, 1000);
    this.socket.on(MsgType.PCToPhone, (message: string) => {
      const data = JSON.parse(message);
      this.title = data.title;
      this.content = data.content;
    });
  }
});
</script>

<style scoped>
.phone {
  width: 80%;
  margin: 0 auto;
}

.el-input {
  padding: 10px 0;
}

.content {
  min-height: 500px;
}
</style>