<template>
  <div>
    <h1>Computer</h1>
	{{ status }}
    <el-input v-model="title" placeholder="title" @input="onTextChange"></el-input>
    <el-input type="textarea" :autosize="{ minRows: 10 }" placeholder="Please input" v-model="content"
	 @input="onTextChange"> </el-input>
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
	// receive sync message from phone
	this.socket.on(MsgType.PhoneToPC, (message: string) => {
      const data = JSON.parse(message);
      this.title = data.title;
      this.content = data.content;
	});
  },
  methods: {
    onTextChange(value: string | number) {
	  this.socket.emit(MsgType.PCToPhone,
					   JSON.stringify({ title: this.title, content: this.content }));
    }
  }
});
</script>
