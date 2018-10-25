<template>
<v-container grid-list-md >
  <v-layout row wrap>
    <v-speed-dial v-model="fab" left  absolute direction='bottom' transition='slide-y-reverse-transition'>
      <v-btn slot="activator" v-model="fab" color="pink" dark fab >
        <v-icon>toggle_off</v-icon>
        <v-icon>toggle_on</v-icon>
      </v-btn>
      <v-btn to="/zonas" fab dark small color="green" >
        <v-icon>location_on</v-icon>
      </v-btn>
      <v-btn to="/ronda" fab dark small color="indigo">
        <v-icon>sync</v-icon>
      </v-btn>
    </v-speed-dial>
    <v-flex xs4>
      <v-toolbar color="blue lighten-1" dark>
          <v-toolbar-side-icon></v-toolbar-side-icon>
          <v-toolbar-title>Usuarios</v-toolbar-title>
          <v-spacer></v-spacer>
          <v-dialog v-model="dialog" max-width="500px">
           <!--  <v-btn icon slot="activator">
            <v-icon >plus_one</v-icon>
          </v-btn> -->
          
          <v-card>
            <v-card-title>
              <span class="headline">{{ formTitle }}</span>
            </v-card-title>

            <v-card-text>
              <v-container grid-list-md>
                <v-layout wrap>
                  <v-flex xs6>
                    <v-text-field v-model="editedItem.worker.first_name" label="Nombre"></v-text-field>
                  </v-flex>
                  <v-flex xs6>
                    <v-text-field v-model="editedItem.worker.last_name" label="Apellido"></v-text-field>
                  </v-flex>
                  <v-flex xs6>
                    <v-text-field v-model="editedItem.email" label="Email"></v-text-field>
                  </v-flex>
                  <v-flex xs6>
                    <v-text-field v-model="editedItem.phone" label="Telefono"></v-text-field>
                  </v-flex>
                  <v-flex xs12>
                    <v-text-field v-model="editedItem.password" label="Contraseña"></v-text-field>
                  </v-flex>
                </v-layout>
              </v-container>
            </v-card-text>

            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn color="blue darken-1" flat @click.native="close">Cancelar</v-btn>
              <v-btn color="blue darken-1" flat @click.native="save">Guardar</v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
        </v-toolbar>
      <v-toolbar flat color="white">
        <v-text-field
        v-model="search"
        append-icon="search"
        label="Buscar"
        single-line
        hide-details
      ></v-text-field>
      </v-toolbar>
      <v-data-table
        :headers="headers"
        :items="users"
        :search="search"
        :pagination.sync="pagination"
        hide-actions
        class="elevation-1"
      >
        <template slot="items" slot-scope="props">
          <td :class="{actived:selected == props.item.id}" >{{ props.item.worker.first_name }} {{ props.item.worker.last_name }}</td>
          <td :class="{actived:selected == props.item.id}" >{{ props.item.phone }}</td>
          <td class="justify-center" :class="{actived:selected == props.item.id}">
            <v-tooltip bottom>
              <v-icon  slot="activator" color="blue darken-2" class="mr-2" @click="getRoute(props.item)">add_location</v-icon>
              <span>Recorridos</span>
            </v-tooltip>
          </td>
        </template>
        <template slot="no-data">
          <v-btn color="primary" @click="initialize">Recargar</v-btn>
        </template>
      </v-data-table>
    </v-flex>
    <bz-routes v-if= "UserRoutes" v-bind:user="UserRoutes"> </bz-routes>
  </v-layout>
</v-container>
</template>


<script>
  import BzRoutes from "./routes.vue"


  export default {
    components: {BzRoutes },
    data: () => ({
      fab: false,
      search: '',
      UserRoutes: 0,
      pagination: {rowsPerPage: 10},
      dialog: false,
      selected: 0,
      headers: [
        {
          text: 'Nombre y Apellido',
          sortable: false,
          value: 'first_name',
          width: 100
        },
        {
          text: 'Telefono',
          sortable: false,
          value: 'phone',
          width: 80
        },
        { text: 'Reporte', 
        value: 'name', 
        sortable: false, 
        width:20}
      ],
      users: [],
      editedIndex: -1,
      editedItem: {
        email: '',
        password: '',
        phone: '',
        worker: {
          first_name: '',
          last_name: ''
        }
      },
      defaultItem: {
        email: '',
        password: '',
        phone: '',
        worker: {
          first_name: '',
          last_name: ''
        }
      }
    }),

    computed: {
      formTitle () {
        return this.editedIndex === -1 ? 'Nuevo Usuario' : 'Modificar usuario'
      },
      pages () {
        if (this.pagination.rowsPerPage == null ||
          this.pagination.totalItems == null
        ) return 0

        return Math.ceil(this.pagination.totalItems / this.pagination.rowsPerPage)
      }
    },

    watch: {
      dialog (val) {
        val || this.close()
      }
    },

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

      editItem (item) {
        this.selected = item.id
        this.editedIndex = this.users.indexOf(item)
        this.editedItem = Object.assign({}, item)
        this.editedItem.password = 'xxxxxxxx'
        this.dialog = true
      },

      getRoute(item){
        this.selected = item.id
        this.UserRoutes = item
      },

      deleteItem (item) {
        this.$axios.delete('/watchers/'+item.id)
          .then(resp => {
            if(resp.status === 200){
              const index = this.users.indexOf(item)
              this.users.splice(index, 1)
            }
          })
          .catch(e => {
            console.log(e)
          })
      },

      close () {
        this.selected = 0
        this.dialog = false
        setTimeout(() => {
          this.editedItem = Object.assign({}, this.defaultItem)
          this.editedIndex = -1
        }, 500)
      },

      save () {
        if (this.editedIndex > -1) {
          if (this.editedItem.password === 'xxxxxxxx'){
            delete this.editedItem.password
          }
          this.$axios.put('/watchers/'+this.editedItem.id, this.editedItem)
          .then(resp => {
            if(resp.status === 200){
              Object.assign(this.users[this.editedIndex], this.editedItem)
            }
          })
          .catch(e => {
            console.log(e)
          })
        } else {
            if (this.users.length < this.$store.state.sesion.user_limit ){
              this.$axios.post('/watchers/', this.editedItem)
              .then(resp => {
                if(resp.status === 201){
                  this.users.push(resp.data)
                }
              })
              .catch(e => {
                console.log(e)
              })
          }
          else{
            alert('Haz excedido el limite de usuarios de tu plan')
          }
        }
        this.close()
      }
    }
  }
</script>

<style>
.actived{
  background: #f7f0b2;
}
</style>
