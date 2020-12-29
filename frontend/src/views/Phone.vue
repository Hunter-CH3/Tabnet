<template>
  <div class="phone">
    <el-input v-model="title" placeholder="title" @input="onTextChange"></el-input>
    <el-input
      v-model="content"
      type="textarea"
      placeholder="content"
      @input="onTextChange"
      :autosize="{ minRows: 10 }"
    ></el-input>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import io from 'socket.io-client';
import { DeviceType, MsgType } from '../../../src/interfaces';
import { backendUrl } from '../../../src/utils';

export default Vue.extend({
  name: 'Home',
  data() {
    return {
      deviceType: DeviceType.Phone,
      socket: io.io(backendUrl),
      users: [],
      title: '',
      content: '',
      receiving: false
    };
  },
  mounted() {
    this.socket.emit('init', this.deviceType);
    this.socket.emit('message', `From ${DeviceType[this.deviceType]}`);
    this.socket.on('message', (message: any) => {
      console.log(message);
    });
    this.socket.on(MsgType.PCToPhone, (message: string) => {
      const data = JSON.parse(message);
      this.receiving = true;
      this.title = data.title;
      this.content = data.content;
    });
  },
  methods: {
    onTextChange(value: string | number) {
      if (this.receiving) {
        this.receiving = false;
        return;
      }
      this.socket.emit(MsgType.PhoneToPC, JSON.stringify({ title: this.title, content: this.content }));
    }
  }
});
</script>

<style scoped>
.phone {
  width: 80%;
  margin: 0 auto;
  margin-top: 20vh;
}

.el-input {
  padding: 10px 0;
}
</style>
