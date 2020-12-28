<template>
  <div>
    <h1>Computer</h1>
    {{ status }}
    <el-input type="textarea" :rows="2" placeholder="Please input" v-model="textarea" @input="onTextChange"> </el-input>
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
      deviceType: DeviceType.Computer,
      socket: io.io('http://localhost:3000'),
      users: [],
      status: 'None',
      textarea: '',
      title: '',
      content: ''
    };
  },
  mounted() {
    this.socket.emit('init', this.deviceType);
    this.socket.emit('message', `From ${DeviceType[this.deviceType]}`);
    this.socket.emit('scenario', MsgType.SingleScenario);
    this.socket.on('message', (message: any) => {
      console.log(message);
    });
    this.socket.on('scenario', (message: any) => {
      this.status = message;
      console.log(message);
    });
  },
  methods: {
    onTextChange(value: string | number) {
      this.socket.emit('text', value);
    }
  }
});
</script>
