<template>
  <div>
    <div v-if="!isMeeting">
      <h1>Computer</h1>
      <el-input type="textarea" :rows="2" placeholder="Please input" v-model="textarea"> </el-input>
    </div>
    <div v-else>
      <div class="menu-wrapper">
        <el-button v-if="showUserButton" type="primary" @click="userDialogVisible = !userDialogVisible"
          >显示与会者</el-button
        >
      </div>
      <div class="file-gallery"></div>
      <el-dialog title="与会者" :visible.sync="userDialogVisible">
        <div v-if="howToShowUsers === 'list'">
          <div v-for="(item, idx) in items" :key="idx">
            {{ item.text }}
          </div>
        </div>
        <thumbnail id="thumbnail" v-show="howToShowUsers === 'thumbnail'" ref="thumbnail" />
      </el-dialog>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import io from 'socket.io-client';
import { DeviceType } from '../../../src/interfaces';
import Thumbnail from '../components/Thumbnail.vue';
import { items } from '../scene';

export default Vue.extend({
  name: 'Home',
  components: {
    Thumbnail
  },
  data() {
    return {
      deviceType: DeviceType.Computer,
      socket: io.io('http://localhost:3000'),
      users: [],
      textarea: '',
      isMeeting: true,
      showUserButton: true,
      userDialogVisible: false,
      howToShowUsers: 'thumbnail',
      items: items
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
    handleItemSelected() {}
  }
});
</script>

<style scoped>
.menu-wrapper {
  display: flex;
  justify-content: flex-end;
}

#thumbnail {
  margin: 0 auto;
}
</style>
