<template>
  <div
    ref="container"
    style="background: red; width: 100%, height: 100%"
  />
</template>

<script lang="ts">
import { watch, ref, defineComponent } from "vue";
import { Viewer } from "../modules/Viewer";

export default defineComponent({
	name: "RenderPanel",
	props: {
		part: {
			type: Object,
			required: true,
		},
	},
	setup(props, context) {
		const container = ref();
		const viewer = ref<Viewer>();

		return {
			container,
			viewer,
		};
	},
	mounted() {
		watch(
			() => this.part,
			(newValue, oldValue) => {
				console.log("PART CHANGE parts/" + newValue.id + "/" + newValue.modelFile);
				this.viewer.LoadModel("parts/" + newValue.id + "/" + newValue.modelFile);
			}
		);

		this.viewer = new Viewer(this.container, this.emitter);
		this.viewer.LoadModel("parts/" + this.part.id + "/" + this.part.modelFile);

		window.addEventListener("resize", () => {this.onResize();});
	},
	methods: {
		onResize() {
			console.log(this.container);
			if(this.container.clientWidth && this.container.clientHeight) {
				this.viewer.Resize(this.container.clientWidth, this.container.clientHeight);
			}
		}
	},
});
</script>
