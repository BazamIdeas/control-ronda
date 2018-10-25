<template>
  <v-app >
    <v-toolbar>
      <v-spacer></v-spacer>
      <v-toolbar-items v-if="sesion">
        <v-btn flat v-for="m in menu" :key="m.id" :to="m.route">{{m.name}}</v-btn>
        
      </v-toolbar-items>
      <v-btn v-if="status" flat @click="salir()">SALIR</v-btn>
  </v-toolbar>
  <v-container >
    <router-view/>
  </v-container>
  </v-app>
</template>

<script>
export default {
  data () {
    return {
      menu : [
        {name: 'ASISTENCIA', route: 'asistencia', id : 1},
        {name: 'RONDA',  route: 'ronda', id : 2},
        {name: 'USUARIOS',  route: 'usuarios', id : 3},
        {name: 'MI CUENTA',  route: 'cuenta', id : 4},
        {name: 'SALIR',  route: 'logout', id : 5}
      ]
      
    }
  },
  computed: {
    sesion(){
      return this.$store.state.sesion
    },
    status(){
      return this.$store.state.status
    }
  },
  methods: {
    salir (){
      this.$store.commit('FINISH_SESION')
    localStorage.removeItem('bazam-token-control')
    this.$router.push('/')
    }
  },
  name: 'App'
}
</script>
