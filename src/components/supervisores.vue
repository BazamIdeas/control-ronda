<template>
<v-container grid-list-md >
  <v-layout row wrap>
    <v-flex xs6 offset-xs3>
      <v-toolbar color="blue lighten-1" dark>
          <v-toolbar-title>Supervisores - {{condominio.name}}</v-toolbar-title>
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
                  <v-flex xs6>
                    <v-text-field v-model="editedItem.worker.first_name" label="Nombre completo"></v-text-field>
                  </v-flex>
                  <v-flex xs6>
                    <v-text-field v-model="editedItem.username" label="Usuario"></v-text-field>
                  </v-flex>
                  <v-flex xs6>
                    <v-text-field v-model="editedItem.phone" label="Telefono"></v-text-field>
                  </v-flex>
                  <v-flex xs6>
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
    props: ['condominio'],
    data: () => ({
      fab: false,
      search: '',
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
      users: [],
      editedIndex: -1,
      editedItem: {
        username: '',
        password: '',
        phone: '',
        worker: {
          first_name: '',
          condos: {
              id: ''
          }
        }
      },
      defaultItem: {
        username: '',
        password: '',
        phone: '',
        worker: {
          first_name: '',
          condos: {
              id: ''
          }
        }
      }
    }),

    computed: {
      formTitle () {
        return this.editedIndex === -1 ? 'Nuevo Supervisor' : 'Modificar supervisor'
      },
    },

    watch: {
      dialog (val) {
        val || this.close()
      },
    },

    created () {
      this.initialize()
    },

    watch: { 
      condominio: function(newVal, oldVal) { 
        this.initialize()
      }
    },

    methods: {
      initialize () {
        this.$axios.get('/condos/'+this.condominio.id+'/supervisors')
        .then(resp => {
          if(resp.status === 200){
            this.users = resp.data
          }
        })
        .catch(e => {
             this.users = []
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

      deleteItem (item) {
        this.$axios.delete('/supervisors/'+item.id)
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
          this.$axios.put('/supervisors/'+this.editedItem.id, this.editedItem)
          .then(resp => {
            if(resp.status === 200){
              Object.assign(this.users[this.editedIndex], this.editedItem)
            }
          })
          .catch(e => {
            console.log(e)
          })
        } else {
            if (this.users.length < this.condominio.user_limit ){
                this.editedItem.worker.condos.id = this.condominio.id
              this.$axios.post('/supervisors/', this.editedItem)
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
            alert('Ha excedido el limite de usuarios permitidos para el condominio')
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
