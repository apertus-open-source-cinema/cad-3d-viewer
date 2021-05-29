<template>
  <div id="part_info_panel">
    <div
      style="
        position: absolute;
        right: 1em;
        display: flex;
        align-items: center;
        color: #777777;
      "
    >
      Light<label class="switch">
        <input
          ref="theme_switch"
          type="checkbox"
          style="position: absolute; right: 2em"
          @change="switchTheme"
        >
        <div />
      </label>
      Dark
    </div>
    <img
      id="axiom_logo"
      src="../assets/images/axiom_logo_light.png"
    >
    <div id="part_info">
      <img
        id="part_location"
        :src="'assets/models/parts/' + partInfo.id + '/location.png'"
      >
      <div style="font-size: 0.8em">
        AXIOM Beta Compact Enclosure
      </div>
      <div id="part_name">
        {{ partInfo.name }}
      </div>
      <div id="part_revision">
        {{ partInfo.revision }}
      </div>
      <!-- <div id="part_info" style="grid-column: 2">
        <span id="part_header">PART</span><span>REVISION</span>
      </div>
      <div
        style="
          grid-column: 2/2;
          font-size: 1.4vw;
          text-overflow: ellipsis;
          overflow: hidden;
          white-space: nowrap;
        "
      >
        <span style="font-weight: bold; margin-right: 0.5em">{{
          partInfo.name
        }}</span>
        <span>{{ partInfo.revision }}</span>
      </div> -->
    </div>
    <div style="display: flex">
      <div id="thick_line" />
      <div id="part_data">
        <div>length:</div>
        <div>width:</div>
        <div>height:</div>
        <div>material:</div>
        <div>surface:</div>

        <div class="bold_text">
          {{ createDataString(partInfo.length) }}
        </div>
        <div class="bold_text">
          {{ createDataString(partInfo.width) }}
        </div>
        <div class="bold_text">
          {{ createDataString(partInfo.height) }}
        </div>
        <!-- :class="{ empty_data_entry: !partInfo.material }" -->
        <div class="bold_text">
          {{ partInfo.material || "-" }}
        </div>
        <div class="bold_text">
          {{ partInfo.surface || "-" }}
        </div>
      </div>
    </div>
	<div style="display: flex">
	<div id="part_links">
		<h3>Links:</h3><br />
			<a
				class="source_link"
				:href="partInfo.source || '#'"
				target="_blank" 
			>{{ partInfo.sourceLabel }}</a>
			<a
			id="apertus_link"
			href="http://www.apertus.org"
			target="_blank"
		>www.apertus.org</a>
		</div>
	</div>
  </div>
</template>

<script lang="ts">
import { toRefs, watch, defineComponent } from "vue";

export default defineComponent({
	name: "PartInfoPanel",
	props: {
		// default: "N/A",
		partInfo: {
			type: Object,
			required: true,
		},
		material: { type: String, default: "-" },
	},
	setup(props, context) {
		return {
			count: 0,
		};
	},
	mounted() {
		if (localStorage.getItem("theme") == "light") {
			this.$refs.theme_switch.checked = false;
		} else {
			this.$refs.theme_switch.checked = true;
		}
	},
	methods: {
		switchTheme(event) {
			this.emitter.emit("switch_theme", event.srcElement.checked);
		},
		updateModel() {
			console.log("MODEL UPDATED");
		},
		createDataString(data: string) {
			let result = "N/A";

			if (data) {
				result = data + " " + this.partInfo.unit;
			}

			return result;
		},
	},
});
</script>

<style lang="sass">
@import "styles/PartInfoPanel.scss"
</style>
