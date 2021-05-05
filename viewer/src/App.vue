<template>
  <div
    style="display: grid; grid-template-columns: 0.75fr 2.5fr 5fr; height: 100%"
  >
    <PartList :parts="parts" />
    <PartInfoPanel :part-info="parts[selectedIndex]" />
    <RenderPanel :part="parts[selectedIndex]" />
  </div>
</template>

<script lang="ts">
import { ref } from "vue";

import PartInfoPanel from "./components/PartInfoPanel.vue";
import PartList from "./components/PartList.vue";
import RenderPanel from "./components/RenderPanel.vue";

import availableParts from "./assets/json/available_parts.json";

export default {
	name: "App",
	components: {
		PartInfoPanel,
		PartList,
		RenderPanel,
	},
	setup() {
		const parts = ref(availableParts.parts);
		const selectedIndex = ref(0); //PartList.selectedIndex;

		return { parts, selectedIndex };
	},
	created() {
		this.emitter.on("update_selected_model", (index) => {
			this.selectedIndex = index;
		});
	},
};
</script>
