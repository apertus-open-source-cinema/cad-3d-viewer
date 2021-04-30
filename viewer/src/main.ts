import { createApp } from "vue";
import App from "./App.vue";
import "./index.css";

import mitt from "mitt";
import {Emitter} from "mitt";

const emitter = mitt();

declare module "@vue/runtime-core" {
    export interface ComponentCustomProperties {
        emitter: Emitter //typeof emitter
    }
}

const app = createApp(App);
//app.provide("emitter", emitter);
app.config.globalProperties.emitter = emitter;
app.mount("#app");
