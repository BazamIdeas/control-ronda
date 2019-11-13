import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    sesion: null,
    admin: null,
    status: null,
    comite: null,
    conf: {
      api: 'http://api.cs100.cl/v1',
      socket: 'ws://api.cs100.cl/v1',
      api2: 'http://api2.bazamdev.com/v3'
    }
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
      state.comite = null
    },
    SET_SESION_ADMIN: function (state) {
      state.status = true
    },
    SET_SESION_COMITE: function (state) {
      state.comite = true
    }
  }
})
