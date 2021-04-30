<template>
  <div id="part_info_panel">
    <img id="axiom_logo" src="../assets/images/axiom_logo.png" />

    <div id="part_name">
      <div id="camera_name">AXIOM BETA</div>
      <div id="part_info" style="grid-column: 2">
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
      </div>
    </div>
    <div id="part_data">
      <div>length:</div>
      <div>width:</div>
      <div>height:</div>

      <div class="bold_text">
        {{ createDataString(partInfo.length) }}
      </div>
      <div class="bold_text">
        {{ createDataString(partInfo.width) }}
      </div>
      <div class="bold_text">
        {{ createDataString(partInfo.height) }}
      </div>

      <div>material:</div>
      <div
        class="bold_text"
        style="grid-column: 4"
        :class="{ empty_data_entry: !partInfo.material }"
      >
        {{ partInfo.material || "-" }}
      </div>
    </div>
    <a id="apertus_link" href="http://www.apertus.org" target="_blank"
      >www.apertus.org</a
    >
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
  methods: {
    updateModel() {
      console.log("MODEL UPDATED");
    },
    createDataString(data: string) {
      let result = "N/A";

      if (data) {
        result = data + this.partInfo.unit;
      }

      return result;
    },
  },
});
</script>

<style scoped>
@import "styles/PartInfoPanel.css";
</style>
