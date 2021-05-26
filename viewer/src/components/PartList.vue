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
        <img
          class="part_thumbnail"
          :src="'assets/models/parts/' + item.id + '/icon.png'"
          onerror="this.src='assets/icons/dummy_icon.png';"
        >
        <div>{{ item.name }}</div>
      </div>
    </div>
    <div
      style="
        color: var(--text_color);
        background: var(--background_part_list)
        width: 100%;
        height: 100%;
        justify-content: center;
        font-size: 0.75em;
        display: flex;
      "
    >
      <div>{{ selectedIndex + 1 }} of {{ parts.length }}</div>
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
		selectedIndex: {
			type: Number,
			default: 0
		}
	},
	setup(props) {
		const selectedIndex = ref(props.selectedIndex);

		return { selectedIndex };
	},
	methods: {
		nextModel() {
			this.emitter.emit("nextModel");
		},
		updateSelected(item, index) {
			this.selectedIndex = index;
			this.emitter.emit("update_selected_model", index);
		},
		GetIcon(part_id: string): string {
			console.log("GET ICON");
			console.log(part_id);

			let result = "assets/models/" + part_id + "/icon.png";
			if (part_id === undefined) {
				console.log("ICON NOT FOUND");
				result = "assets/icons/dummy_icon.png";
			}

			return result;
		},
	},
});
</script>

<style lang="sass">
@import "styles/PartList.scss"
</style>
