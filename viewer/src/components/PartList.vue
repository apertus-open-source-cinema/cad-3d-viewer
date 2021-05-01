<template>
  <div style="overflow: hidden; height: 100%">
    <div class="part_list">
      <div
        v-for="(item, index) in parts"
        :key="item"
        class="part_entry"
        :class="{ active: index === selectedIndex }"
        @click="updateSelected(item, index)"
      >
        <div class="part_thumbnail" />
        <div>{{ item.name }}</div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { ref, defineComponent } from "vue";

export default defineComponent({
  name: "PartList",
  props: {
    parts: {
      type: Array,
      required: true,
    },
  },
  setup() {
    const selectedIndex = ref(0);

    return { selectedIndex };
  },
  methods: {
    nextModel() {
      //   console.log(this.emitter);
      //   console.log("MODEL");
      //   console.log(availableParts.models.length);
      //   if (this.currentModelIndex < availableParts.models.length) {
      //     this.currentModelIndex += 1;
      //     this.currentModel = availableParts.models[this.currentModelIndex];
      //   }
      this.emitter.emit("nextModel");
    },
    updateSelected(item, index) {
      this.selectedIndex = index;
      this.emitter.emit("update_selected_model", index);
      //   console.log(item);
      //   console.log(index);
    },
  },
});
</script>

<style>
@import "styles/PartList.css";
</style>
