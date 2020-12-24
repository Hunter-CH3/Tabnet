<template>
  <h1>Computer</h1>
</template>

<script lang="ts">
import Vue from 'vue';
import io from 'socket.io-client';

export default Vue.extend({
  name: 'Home',
  data() {
    return {
      socket: io.io('http://localhost:3000'),
      users: []
    };
  },
  mounted() {
    this.socket.emit('computer', 'From Computer');
  }
});
</script>
