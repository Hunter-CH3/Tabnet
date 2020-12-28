<template>
  <div>
    <el-button type="primary" plain @click="toSingle">Single</el-button>
    <el-button type="danger" plain @click="toMeeting">Meeting</el-button>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import io from 'socket.io-client';
import Thumbnail from '../components/Thumbnail.vue';
import { items } from '../scene';
import { DeviceType, MsgType } from '../../../src/interfaces';

export default Vue.extend({
  name: 'Home',
  data() {
    return {
      deviceType: DeviceType.Computer,
      socket: io.io('http://localhost:3000'),
      status: 'None',
    };
  },
  methods: {
	toSingle() {
	  console.log("to single");
	  this.socket.emit('scenario', MsgType.SingleScenario);
	},
	toMeeting() {
	  this.socket.emit('scenario', MsgType.MeetingScenario);
	}
  }
});
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped></style>
