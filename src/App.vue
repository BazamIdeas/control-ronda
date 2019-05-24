<template>
  <v-app >
    <!-- <v-toolbar>
      <img style="width: 45px;" src="./assets/logo.jpeg">
      <v-spacer></v-spacer>
      <v-toolbar-items v-if="sesion">
        <v-btn flat v-for="m in menu" :key="m.id" :to="m.route">{{m.name}}</v-btn>
        
      </v-toolbar-items>
      <v-btn v-if="status" flat @click="salir()">SALIR</v-btn>
  </v-toolbar> -->
    <v-layout row wrap >
      <v-flex xs2  v-if="sesion">

      <v-navigation-drawer
        dark
        absolute
        width = 200
      >
      <v-flex mt-2 mb-2 pl-4>
      <v-avatar
          :size="120"
          color="grey lighten-4"
        >
          <img src="./assets/logo.jpeg" alt="avatar">
        </v-avatar>
        </v-flex>
        <v-divider></v-divider>
        <v-list>
          <v-list-tile
            v-for="item in menu"
            :key="item.title"
            :to="item.route"
          >
            <v-list-tile-action>
              <v-icon>{{ item.icon }}</v-icon>
            </v-list-tile-action>

            <v-list-tile-content>
              <v-list-tile-title >{{ item.name }}</v-list-tile-title>
            </v-list-tile-content>
          </v-list-tile>
        </v-list>
      </v-navigation-drawer>
      </v-flex>
      <v-flex xs10 v-if="sesion">
        <router-view/>
      </v-flex>
      <v-flex xs12 v-if="!sesion">
        <router-view/>
      </v-flex>
    </v-layout>
  </v-app>
</template>

<script>
export default {
  data () {
    return {
      menu : [
        {name: 'DASHBOARD', route: 'cuenta', id : 6, icon: 'dashboard'},
        {name: 'ASISTENCIA', route: 'asistencias', id : 1, icon: 'assignment'},
        {name: 'RONDA',  route: 'ronda', id : 2, icon: 'autorenew'},
        {name: 'GESTION',  route: 'gestion', id : 3, icon: 'event'},
        {name: 'ENTREGA',  route: 'entrega', id : 4, icon: 'airport_shuttle'},
        {name: 'ENT. TURNO',  route: 'inventario', id : 8, icon: 'view_list'},
        {name: 'ENCUESTAS',  route: 'encuestas', id : 9, icon: 'assessment'}, 
        {name: 'USUARIOS',  route: 'usuarios', id :5, icon: 'group'},
        {name: 'SALIR',  route: 'logout', id : 7, icon: 'exit_to_app'}
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
