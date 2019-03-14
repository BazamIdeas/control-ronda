<template>
<v-container grid-list-md >
  <v-layout row wrap>
    <v-flex xs12 >
      <v-toolbar color="grey" dark>
          <v-toolbar-side-icon></v-toolbar-side-icon>
          <v-toolbar-title>Listas de entrega </v-toolbar-title>
          <v-spacer></v-spacer>
          <v-btn icon @click="initialize ()">
            <v-icon>autorenew</v-icon>
          </v-btn>
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
                      <v-text-field v-model="editedItem.name" label="Nombre"></v-text-field>
                    </v-flex>
                    <v-flex xs12>
                    <v-select
                        :items="usuarios"
                        v-model="selectUsuarios"
                        item-text="first_name"
                        item-value="id"
                        label="Usuario responsable"
                        return-object
                        single-line
                        ></v-select>
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
        label="Buscar por fecha, nombre de lista o responsable"
        single-line
        hide-details
      ></v-text-field>
        
      </v-toolbar>
      <v-data-table
        :headers="headers"
        :items="listas"
        :search="search"
        :pagination.sync="pagination"
        rows-per-page-text= "Número de Filas"
        class="elevation-1"
      >
        <template slot="items" slot-scope="props">
          <td :class="{actived:selected == props.item.id}" >{{ moment(props.item.date).format('DD-MM-YYYY') }}</td>
          <td :class="{actived:selected == props.item.id}" >{{ moment(props.item.date).format('HH:mm') }}</td>
          <td :class="{actived:selected == props.item.id}" >{{ props.item.name }}</td>
           <td :class="{actived:selected == props.item.id}" >{{ props.item.worker.first_name }}</td>
          <td class="justify-center px-0" :class="{actived:selected == props.item.id}">
            <v-tooltip bottom>
              <v-icon  slot="activator" color="green darken-2" class="mr-2" @click="editItem(props.item)">edit</v-icon>
              <span>Editar</span>
            </v-tooltip> 
             <v-tooltip bottom>
              <v-icon  slot="activator" color="blue darken-2" class="mr-2" @click="getItems(props.item)">assignment_turned_in</v-icon>
              <span>Items</span>|
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
      <div class="text-xs-center pt-2">
      </div>
    </v-flex>
    <v-dialog v-model="ventana" fullscreen hide-overlay transition="dialog-bottom-transition">
      <v-card>
        <v-layout justify-end>
            <v-btn flat @click.native="ventana = false">Cerrar</v-btn>
        </v-layout >
        <bz-items v-if= "itemsLista" v-bind:lista="itemsLista"> </bz-items>
      </v-card>
    </v-dialog>
  </v-layout>
</v-container>
</template>


<script>
var moment = require ('moment')
  moment.locale('es')
  import BzItems from "./items.vue"
  import axios from '../axios.js'

  export default {
    components: {BzItems},
    data: () => ({
      moment: moment,
      fab: true,
      info: null,
      ventana: false,
      pagination: {descending: true},
      search: '',
      itemsLista: 0,
      usuarios: [],
      selectUsuarios: { id: '', first_name: '' },
      dialog: false,
      selected: 0,
      headers: [
        {
          text: 'Fecha',
          align: 'left',
          sortable: true,
          value: 'date',
          isDescending: true
        },
         {
          text: 'Hora',
          align: 'left',
          sortable: true,
          value: 'date',
          isDescending: true
        },
        {
          text: 'Lista',
          align: 'left',
          sortable: true,
          value: 'name'
        },
        {
          text: 'Responsable',
          align: 'left',
          sortable: true,
          value: 'worker.first_name'
        },
        { text: 'Acciones', 
        value: 'name', 
        sortable: false, 
        align: 'left', 
        width: '180'}
      ],
      listas: [],
      editedIndex: -1,
      editedItem: {
        name: '',
      },
      defaultItem: {
        name: '',
      }
    }),

    computed: {
      formTitle () {
        return this.editedIndex === -1 ? 'Nueva Lista de entrega' : 'Modificar Lista'
      },
    },

    watch: {
      dialog (val) {
        val || this.close()
      }
    },

    created () {
      this.initialize()
      this.getUsuarios()
    },

    methods: {
      initialize () {
        axios.get('/deliveries/condos/self')
        .then(resp => {
          if(resp.status === 200){
            this.listas = resp.data
          }
        })
        .catch(e => {
          console.log(e)
        })
      },

      editItem (item) {
        this.selected = item.id
        this.editedIndex = this.listas.indexOf(item)
        this.editedItem = Object.assign({}, item)
        this.dialog = true
      },

      getItems(item){
        this.selected = item.id
        this.itemsLista = item
        this.ventana = true
      },

       getUsuarios () {
        this.$axios.get('/watchers/self')
        .then(resp => {
          if(resp.status === 200){
            if (resp.data !== null){
                let workers = []
                resp.data.forEach(element => {
                    workers.push(element.worker)
                })
              this.usuarios = workers
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

      deleteItem (item) {
        this.$axios.delete('/deliveries/'+item.id+'?trash=true')
          .then(resp => {
            if(resp.status === 200){
              const index = this.listas.indexOf(item)
              this.listas.splice(index, 1)
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
          this.$axios.put('/deliveries/'+this.editedItem.id, {
            name : this.editedItem.name,
              worker: {
                id: this.selectUsuarios.id
              }
          })
          .then(resp => {
            if(resp.status === 200){
              Object.assign(this.listas[this.editedIndex], this.editedItem)
            }
          })
          .catch(e => {
            console.log(e)
          })
        } else {
            axios.post('/deliveries/', {
            name : this.editedItem.name,
              worker: {
                id: this.selectUsuarios.id
                }
          })
          .then(resp => {
            if(resp.status === 201){
               resp.data.worker.first_name = this.selectUsuarios.first_name
                this.listas.push(resp.data)
            }
          })
          .catch(e => {
            console.log(e)
          })
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
