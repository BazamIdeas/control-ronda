<template>
<v-container grid-list-md >
  <v-layout row wrap>
    <v-flex xs12 >
      <v-toolbar color="blue lighten-1" dark>
          <v-toolbar-side-icon></v-toolbar-side-icon>
          <v-toolbar-title>Usuarios de la app</v-toolbar-title>
          <v-spacer></v-spacer>
          <v-dialog v-model="dialog" max-width="500px">
            <v-btn icon slot="activator">
            <v-icon >plus_one</v-icon>
          </v-btn>
          
          <v-card>
            <v-card-title>
              <span class="headline">{{ formTitle }}</span>
            </v-card-title>

            <v-card-text>
              <v-container grid-list-md>
                <v-layout wrap>
                  <v-flex xs12>
                    <v-text-field v-model="editedItem.worker.first_name" label="Nombre completo"></v-text-field>
                  </v-flex>
                  <v-flex xs6>
                    <v-text-field v-model="editedItem.username" label="Usuario"></v-text-field>
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
        rows-per-page-text= "Número de Filas"
        class="elevation-1"
      >
        <template slot="items" slot-scope="props">
          <td :class="{actived:selected == props.item.id}" >{{ props.item.worker.first_name }}</td>
          <td :class="{actived:selected == props.item.id}" >{{ props.item.username }}</td>
          <td class="justify-center px-0" :class="{actived:selected == props.item.id}">
           <v-switch v-if="!props.item.worker.approved" v-model="props.item.approved" @change="aprobar(props.item.worker)" >
           </v-switch>
           <v-icon v-if="props.item.worker.approved" v-model="props.item.approved">done</v-icon>
          </td>
          <td class="justify-center px-0" :class="{actived:selected == props.item.id}">
           <v-switch v-if="props.item.worker.condos.assistances_mod"  v-model="props.item.assistances_mod" @change="changeStatus(props.item)" >
           </v-switch>
           <span v-if="!props.item.worker.condos.assistances_mod">No habilitado</span>
          </td>
          <td class="justify-center px-0" :class="{actived:selected == props.item.id}">
           <v-switch v-if="props.item.worker.condos.routes_mod"  v-model="props.item.routes_mod" @change="changeStatus(props.item)" >
           </v-switch>
           <span v-if="!props.item.worker.condos.routes_mod">No habilitado</span>
          </td>
          <td class="justify-center px-0" :class="{actived:selected == props.item.id}">
           <v-switch v-if="props.item.worker.condos.delivery_mod"  v-model="props.item.delivery_mod" @change="changeStatus(props.item)" >
           </v-switch>
           <span v-if="!props.item.worker.condos.delivery_mod">No habilitado</span>
          </td>
          <td class="justify-center px-0" :class="{actived:selected == props.item.id}">
           <v-switch v-if="props.item.worker.condos.tasks_mod" v-model="props.item.tasks_mod" @change="changeStatus(props.item)" >
           </v-switch>
           <span v-if="!props.item.worker.condos.tasks_mod">No habilitado</span>
          </td>
          <td :class="{actived:selected == props.item.id}" >{{ props.item.phone }}</td>
          <td class="justify-center px-0" :class="{actived:selected == props.item.id}">
            <v-tooltip bottom>
              
              <v-icon  slot="activator" color="green darken-2" class="mr-2" @click="editItem(props.item)">edit</v-icon>
              <span>Editar</span>
            </v-tooltip>
            <v-tooltip bottom>
              <v-icon  slot="activator" color="red darken-2" @click="deleteItem(props.item)">delete</v-icon>
              <span>Eliminar</span>
            </v-tooltip>
          </td>
        </template>
        <template slot="no-data">
          <v-btn color="primary" @click="initialize">Recargar</v-btn>
        </template>
      </v-data-table>
    </v-flex>
  </v-layout>
</v-container>
</template>


<script>


  export default {
    data: () => ({
      fab: true,
      search: '',
      UserRoutes: 0,
      dialog: false,
      selected: 0,
      headers: [
        {
          text: 'Nombre completo',
          align: 'center',
          sortable: false,
          value: 'first_name',
          width: '50'
        },
        {
          text: 'Usuario',
          align: 'center',
          sortable: false,
          value: 'username',
          width: '50'
        },
        {
          text: 'Aprobado',
          align: 'center',
          sortable: false,
          width: '50'
        },
        {
          text: 'Asistencia',
          align: 'center',
          sortable: false,
          width: '50'
        },
        {
          text: 'Rondas',
          align: 'center',
          sortable: false,
          width: '50'
        },
        {
          text: 'Entrega',
          align: 'center',
          sortable: false,
          width: '50'
        },
        {
          text: 'Gestión',
          align: 'center',
          sortable: false,
          width: '50'
        },
        {
          text: 'Telefono',
          align: 'center',
          sortable: false,
          value: 'phone',
          width: '80'
        },
        { text: 'Acciones', 
        value: 'name', 
        sortable: false, 
        align: 'center', 
        width: '100'}
      ],
      users: ['',''],
      editedIndex: -1,
      editedItem: {
        username: '',
        password: '',
        phone: '',
        worker: {
          first_name: ''
        }
      },
      defaultItem: {
        username: '',
        password: '',
        phone: '',
        worker: {
          first_name: ''
        }
      }
    }),

    computed: {
      formTitle () {
        return this.editedIndex === -1 ? 'Nuevo Usuario' : 'Modificar usuario'
      },
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
            if (resp.data !== null){
              this.users = resp.data
            }
            else{
              this.users = []
            }
            
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
        this.$axios.delete('/watchers/'+item.id+'?trash=true')
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
                if(e.code === 409){
                  alert("Ha excedido el limite de usuarios de su cuenta")
                }
                console.log(e)
              })
          }
          else{
            alert('Haz excedido el limite de usuarios de tu plan')
          }
        }
        this.close()
      },

      changeStatus(item){
        delete item.password
        this.$axios.put('/watchers/'+item.id, item)
        .then(resp => {
          if(resp.status === 200){
           alert("Haz cambiado el permiso al usuario satisfactoriamente")
          }
        })
        .catch(e => {
          console.log(e)
        })
      },
       aprobar (item) {
        this.$axios.patch('/workers/'+item.id+'/approve')
        .then(resp => {
          if(resp.status === 200){
            alert('Usuario aprobado')
          }
        })
        .catch(e => {
          console.log(e)
        })
      },
    }
  }
</script>

<style>
.actived{
  background: #f7f0b2;
}
</style>
