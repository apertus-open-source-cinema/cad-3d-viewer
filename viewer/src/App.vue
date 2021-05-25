<template>
  <div
    style="display: grid; grid-template-columns: 7em 25em auto; height: 100%"
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

		this.emitter.on("switch_theme", (themeIndex) => {
			// console.log("THEME SWITCH");
			if (themeIndex) {
				console.log("DARK THEME");
				document.documentElement.setAttribute("data-theme", "dark");
			} else {
				console.log("LIGHT THEME");
				document.documentElement.setAttribute("data-theme", "light");
			}
			//   this.selectedIndex = index;
		});
	},
	//   methods: {
	//     // _addDarkTheme() {
	//     //   let darkThemeLinkEl = document.createElement("link");
	//     //   darkThemeLinkEl.setAttribute("rel", "stylesheet");
	//     //   darkThemeLinkEl.setAttribute("href", "/css/darktheme.css");
	//     //   darkThemeLinkEl.setAttribute("id", "dark-theme-style");
	//     //   let docHead = document.querySelector("head");
	//     //   docHead.append(darkThemeLinkEl);
	//     // },
	//     // _removeDarkTheme() {
	//     //   let darkThemeLinkEl = document.querySelector("#dark-theme-style");
	//     //   let parentNode = darkThemeLinkEl.parentNode;
	//     //   parentNode.removeChild(darkThemeLinkEl);
	//     // },
	//     // darkThemeSwitch() {
	//     //   let darkThemeLinkEl = document.querySelector("#dark-theme-style");
	//     //   if (!darkThemeLinkEl) {
	//     //     this._addDarkTheme()
	//     //   } else {
	//     //     this._removeDarkTheme()
	//     //   }
	//}
};
</script>
