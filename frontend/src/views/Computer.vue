<template>
  <div class="computer">
    <div v-if="!isMeeting" class="single-wrapper">
      <el-input v-model="title" placeholder="title" @input="onTextChange"></el-input>
      <el-input
        type="textarea"
        :autosize="{ minRows: 10 }"
        placeholder="Please input"
        v-model="content"
        @input="onTextChange"
      >
      </el-input>
    </div>
    <div v-else>
      <div class="menu-wrapper">
        <el-button v-if="showUserButton" type="primary" @click="showParticipant"
          >显示与会者</el-button
        >
		<el-button type="warning" @click="changeSelMode">{{ howToShowUsers }}</el-button>
      </div>
      <div class="file-gallery"></div>
      <el-dialog title="与会者" :visible.sync="userDialogVisible">
        <div v-if="howToShowUsers === 'list'">
          <div v-for="(item, idx) in items" :key="idx" @click="handleItemSelected(idx)">
            <el-button>{{ item.text }}</el-button>
          </div>
        </div>
        <thumbnail
          id="thumbnail"
          v-show="howToShowUsers === 'thumbnail'"
          ref="thumbnail"
          @item-selected="handleItemSelected"
        />
      </el-dialog>
      <div class="ppt">
        <el-carousel indicator-position="outside" trigger="click" @change="onImageSelect" :autoplay="false">
          <el-carousel-item v-for="item in imgs" :key="item" align="center">
            <img :src="item" class="img-responsive" />
          </el-carousel-item>
        </el-carousel>
      </div>
    </div>
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
  components: {
    Thumbnail
  },
  data() {
    return {
      deviceType: DeviceType.Computer,
      socket: io.io(backendUrl),
      users: [],
      isMeeting: true,
      showUserButton: true,
      userDialogVisible: false,
      howToShowUsers: 'thumbnail',
      items: items,
      selId: null,
      status: 'None',
      title: '',
      content: '',
      receiving: false,
      selectFlag: false,
      imgs: [
        require('../assets/asuka5.jpg'),
        require('../assets/asuka1.jpg'),
        require('../assets/asuka2.jpg'),
        require('../assets/asuka3.jpg'),
        require('../assets/asuka4.jpg')
      ],
	  startTime: 0
    };
  },
  mounted() {
    this.socket.emit('init', this.deviceType);
    this.socket.emit('message', `From ${DeviceType[this.deviceType]}`);
    // this.socket.emit('scenario', MsgType.SingleScenario);
    this.socket.on('message', (message: any) => {
      console.log(message);
    });
    this.socket.on('scenario', (message: any) => {
	  const nextMode = message == MsgType.SingleScenario ? "single scenario" : "meeting scenario";
	  const tip = `A change request to ${nextMode} received, accept ?`;
	  if (confirm(tip)) {
        this.status = message;
        if (this.status == MsgType.SingleScenario) this.isMeeting = false;
        else this.isMeeting = true;
	  }
    });
    // receive sync message from phone
    this.socket.on(MsgType.PhoneToPC, (message: string) => {
      const data = JSON.parse(message);
      this.receiving = true;
      this.title = data.title;
      this.content = data.content;
    });

    this.socket.on(MsgType.TableSelection, (message: string) => {
      console.log(message);
      if (message === 'OnSelectStart') {
        this.userDialogVisible = true;
        this.selectFlag = true;
      } else if (message === 'OnSelectEnd') {
        this.selectFlag = false;
        this.handleItemSelected(this.selId);
      } else {
        this.selId = Number.parseInt(message);
      }
    });
  },
  methods: {
    onTextChange(value: string | number) {
      if (this.receiving) {
        this.receiving = false;
        return;
      }
      this.socket.emit(MsgType.PCToPhone, JSON.stringify({ title: this.title, content: this.content }));
    },
    handleItemSelected(idx: number) {
      if (!this.selectFlag) {
		// elapsed time of selecting participants
		// thumbnail method is recorded on ipad
		if (this.howToShowUsers == "list") {
		  const elapsedTime = (new Date()) - this.startTime;
		  const tag = `Elapsed time(ms) of selecting ${this.items[idx].text} with ${this.howToShowUsers}`
		  this.socket.emit(MsgType.Log, JSON.stringify({ time: elapsedTime, tag: tag}));
		}
		// alert
        this.userDialogVisible = false;
        this.$refs.thumbnail.selectItem(-1);
        window.alert(`Greetings towards ${this.items[idx].text} sent!`);
      }
    },
    onImageSelect(idx: any) {
      this.socket.emit(MsgType.ScreenCast, this.imgs[idx]);
    },
	changeSelMode() {
	  if (this.howToShowUsers == "list") this.howToShowUsers = "thumbnail";
	  else this.howToShowUsers = "list";
	},
	showParticipant() {
	  this.startTime = new Date();
	  this.userDialogVisible = !(this.userDialogVisible);
	}
  },
  watch: {
    selId(newId: number) {
      this.$refs.thumbnail.selectItem(newId);
    }
  }
});
</script>

<style scoped>
.menu-wrapper {
  display: flex;
  justify-content: flex-end;
}

.computer {
  margin-top: 20vh;
}

#thumbnail {
  margin: 0 auto;
}

.single-wrapper {
  width: 80%;
  margin: 0 auto;
}

.el-input {
  padding: 10px 0;
}

.img-responsive {
  display: inline-block;
  height: auto;
  max-width: 100%;
}

.ppt {
  height: auto;
  max-width: 50%;
  text-align: center;
}
</style>
