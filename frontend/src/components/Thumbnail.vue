<template>
  <div class="thumbnail">
    <div
      class="thumbnail-item"
      v-for="item in items"
      :key="item.id"
      :style="{ left: item.position.left + 'px', top: item.position.top + 'px' }"
      ref="thumbnail-items"
    >
      {{ item.text }}
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';

export class ItemInfo {
  position: {
    left: number;
    top: number;
  };
  text: string;
  public constructor(left: number, top: number, text?: string) {
    this.position = { left: left, top: top };
    this.text = text;
  }
}

export default Vue.extend({
  data() {
    return {
      items: [
        new ItemInfo(100, 100),
        new ItemInfo(300, 100),
        new ItemInfo(500, 100),
        new ItemInfo(100, 300),
        // new ItemInfo(300, 300),
        new ItemInfo(500, 300)
      ]
    };
  },
  methods: {
    selectItem(id: number) {
      this.$refs['thumbnail-items'][id]?.classList.add('selected');
    },
    unselectItem(id: number) {
      this.$refs['thumbnail-items'][id]?.classList.remove('selected');
    }
  }
});
</script>

<style scoped>
.thumbnail {
  width: 600px;
  height: 400px;
  background-color: bisque;

  position: relative;
}

.thumbnail-item {
  --item-size: 50px;
  width: var(--item-size);
  height: var(--item-size);
  background-color: chocolate;
  margin-left: calc(var(--item-size) * -0.5);
  margin-top: calc(var(--item-size) * -0.5);
}

.thumbnail-item.selected {
  background-color: beige;
}

.thumbnail .thumbnail-item {
  position: absolute;
}
</style>