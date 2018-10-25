import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    sesion: null,
    admin: null,
    status: null
  },
  mutations: {
    SET_SESION: function (state, payload) {
      state.sesion = payload.condos
      state.admin = payload
    },
    FINISH_SESION: function (state) {
      state.sesion = null
      state.admin = null
      state.status = null
    },
    SET_SESION_ADMIN: function (state) {
      state.status = true
    }
  }
})
