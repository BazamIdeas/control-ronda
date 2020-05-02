<template>
<v-container grid-list-md >
  <v-toolbar absolute>
      <v-spacer></v-spacer>
      <v-toolbar-items>
        <v-btn flat to='/zonas'>PUNTOS DE CONTROL</v-btn>
        <v-btn flat to='/ronda'>REPORTE DE RONDAS</v-btn>
        <v-btn flat to='/eventos'>EVENTOS</v-btn>
      </v-toolbar-items>
  </v-toolbar>
  <v-layout row wrap mt-5>
    <v-flex xs6  mt-3>
      <v-toolbar color="grey " dark>
        <v-toolbar-title> Zonas</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-dialog v-model="dialog" max-width="500px">
            <v-btn icon slot="activator" >
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
      <!-- <v-toolbar flat color="white">
        <v-text-field
        v-model="search"
        append-icon="search"
        label="Buscar"
        single-line
        hide-details
      ></v-text-field>
      </v-toolbar> -->
      <v-data-table
        :headers="headers"
        :items="zones"
        :search="search"
        rows-per-page-text= "Número de Filas"
        class="elevation-1"
        hide-actions
      >
        <template slot="items" slot-scope="props">
          <td :class="{actived:selected == props.item.id}" >{{ props.item.name }}</td>
          <td class="justify-center px-0" :class="{actived:selected == props.item.id}">
            <v-tooltip bottom>
              <v-icon  slot="activator" color="green darken-2" class="mr-2" @click="editItem(props.item)">edit</v-icon>
              <span>Editar</span>
            </v-tooltip>
            <v-tooltip bottom>
              <v-icon  slot="activator" color="blue darken-2" class="mr-2" @click="getCheckpoints(props.item)">add_location</v-icon>
              <span>Puntos de control</span>
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
    <bz-checkpoints v-if= "checkpoints" v-bind:zone="checkpoints"> </bz-checkpoints>
  </v-layout>
</v-container>
</template>


<script>
  import BzCheckpoints from "./checkpoints.vue"
  import axios from '../axios.js'

  export default {
    components: {BzCheckpoints},
    data: () => ({
      fab: true,
      info: null,
      search: '',
      checkpoints: 0,
      dialog: false,
      selected: 0,
      headers: [
        {
          text: 'Nombre',
          align: 'left',
          sortable: true,
          value: 'name'
        },
        { text: 'Acciones', 
        value: 'name', 
        sortable: false, 
        align: 'left', 
        width: '180'}
      ],
      zones: [],
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
        return this.editedIndex === -1 ? 'Nueva zona' : 'Modificar zona'
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
        this.getZones()
      },
      getZones(){
        axios.get('/zones/self')
        .then(resp => {
          if(resp.status === 200){
            this.zones = resp.data
          }
        })
        .catch(e => {
          console.log(e)
        })
      },
      editItem (item) {
        this.selected = item.id
        this.editedIndex = this.zones.indexOf(item)
        this.editedItem = Object.assign({}, item)
        this.dialog = true
      },

      getCheckpoints(item){
        this.selected = item.id
        this.checkpoints = item
      },

      deleteItem (item) {
        this.$axios.delete('/zones/'+item.id+'?trash=true')
          .then(resp => {
            if(resp.status === 200){
              const index = this.zones.indexOf(item)
              this.zones.splice(index, 1)
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
          this.$axios.put('/zones/'+this.editedItem.id, {
            name : this.editedItem.name,
            condos: {
              id: this.$store.state.sesion.id
            }
          })
          .then(resp => {
            if(resp.status === 200){
              Object.assign(this.zones[this.editedIndex], this.editedItem)
                                 this.getZones()
            }
          })
          .catch(e => {
            console.log(e)
          })
        } else {
            if (this.zones.length < this.$store.state.sesion.zone_limit ){
              axios.post('/zones/', {
              name : this.editedItem.name
            })
            .then(resp => {
              if(resp.status === 201){
                this.zones.push(resp.data)
                
              }
            })
            .catch(e => {
              console.log(e)
            })
          }
          else{
            alert('Haz excedido el limite de zonas de tu plan')
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
