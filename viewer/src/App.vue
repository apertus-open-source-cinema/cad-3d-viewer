<template>
  <div
    style="display: grid; grid-template-columns: 7em 25em auto; height: 100%"
  >
    <PartList
      :parts="parts"
      :selected-index="selectedIndex"
    />
    <PartInfoPanel :part-info="parts[selectedIndex]" />
    <RenderPanel :part="parts[selectedIndex]" />
  </div>
</template>

<script lang="ts">
import { onMounted, ref } from "vue";

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

		let partIndex = 0;

		const urlParams = new URLSearchParams(window.location.search);
		const part = urlParams.get("part");
		if (part) {
			partIndex = availableParts.parts.findIndex((item, i) => {
				return item.id === part;
			});
		}

		const selectedIndex = ref(partIndex);

		if (localStorage.getItem("theme") == "light") {
			document.documentElement.setAttribute("data-theme", "light");
		} else {
			document.documentElement.setAttribute("data-theme", "dark");
		}

		return { parts, selectedIndex };
	},
	created(): void {
		this.emitter.on("update_selected_model", (index) => {
			this.selectedIndex = index;
		});

		this.emitter.on("switch_theme", (themeIndex) => {
			if (themeIndex) {
				document.documentElement.setAttribute("data-theme", "dark");
				localStorage.setItem("theme", "dark");
			} else {
				document.documentElement.setAttribute("data-theme", "light");
				localStorage.setItem("theme", "light");
			}
		});
	},
};
</script>
