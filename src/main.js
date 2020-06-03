// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from "vue";
import App from "./App";
import router from "./router";
import instance from "./axios.js";
import Vuetify from "vuetify";
import store from "./store";
import "vuetify/dist/vuetify.min.css";
import config from "../config/dev.env";
import env from "../config/env";
import * as VueGoogleMaps from "vue2-google-maps";
import Loading from 'vue-loading-overlay';
// Import stylesheet
import 'vue-loading-overlay/dist/vue-loading.css';
// Init plugin
Vue.use(Loading);
//console.log(config.GOOGLE_API)
const load = {
  key: env.GOOGLE_API,
  libraries: "places"
}
//console.log(load)
Vue.use(VueGoogleMaps, {
  load: load,
  installComponents: true
});
Vue.use(Vuetify, {
  theme: {
    primary: "#646466"
  }
});

// Add a request interceptor
instance.interceptors.request.use(
  function(config) {
    const token = localStorage.getItem("bazam-token-control");
    if (token !== null && token !== undefined && token !== "") {
      config.headers["Authorization"] = "Bearer " + token;
    }
    return config;
  },
  function(error) {
    // Do something with request error
    return Promise.reject(error);
  }
);

router.beforeEach((to, from, next) => {
  let sesion = store.state.sesion;
  if (to.matched.some(record => record.meta.requiresAuth)) {
    if (sesion !== null && sesion !== undefined && sesion !== "") {
      next();
    } else {
      next({ name: "login" });
    }
  } else if (to.matched.some(record => record.meta.requiresVisitor)) {
    if (sesion !== null && sesion !== undefined && sesion !== "") {
      next({
        name: "cuenta"
      });
    } else {
      next();
    }
  } else if (to.matched.some(record => record.meta.admin)) {
    if (store.state.status) {
      next();
    } else {
      next({
        name: "login"
      });
    }
  } else if (to.matched.some(record => record.meta.comite)) {
    if (store.state.comite) {
      next();
    } else {
      next({
        name: "login"
      });
    }
  } else {
    next();
  }
});

Vue.config.productionTip = false;
Vue.prototype.$axios = instance;

/* eslint-disable no-new */
new Vue({
  el: "#app",
  router,
  store,
  components: { App },
  template: "<App/>"
});
