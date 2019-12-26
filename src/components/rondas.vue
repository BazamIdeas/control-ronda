<template>
<v-container grid-list-md >
  <v-toolbar absolute>
    <v-layout>
    <v-flex xs3 offset-xs3 mt-3>
      <v-select
          :items="users"
          label="Empleados de ronda"
          item-text="worker.first_name"
          v-model= "UserRoutes"
          return-object
        ></v-select>
    </v-flex>
      <v-spacer></v-spacer>
      <v-toolbar-items>
        <v-btn flat to='/zonas'>PUNTOS DE CONTROL</v-btn>
        <v-btn flat to='/ronda'>REPORTE DE RONDAS</v-btn>
        <v-btn flat to='/eventos'>EVENTOS</v-btn>
      </v-toolbar-items>
      </v-layout>
  </v-toolbar>
  <v-layout row wrap mt-5>
    <bz-routes v-if= "UserRoutes" v-bind:user="UserRoutes"> </bz-routes>
  </v-layout>
</v-container>
</template>


<script>
  import BzRoutes from "./routes.vue"

  export default {
    components: {BzRoutes },
    data: () => ({
      search: '',
      UserRoutes: 0,
      selected: 0,
      users: []
    }),

    created () {
      this.initialize()
    },

    methods: {
      initialize () {
        this.$axios.get('/watchers/self')
        .then(resp => {
          if(resp.status === 200){
            this.users = resp.data
          }
        })
        .catch(e => {
          console.log(e)
        })
      },

      getRoute(item){
        this.selected = item.id
        this.UserRoutes = item
      }

    }
  }
</script>

<style>
.actived{
  background: #f7f0b2;
}
</style>
