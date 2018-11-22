<template>
<v-container grid-list-md >
  <v-layout row wrap>
    <v-flex xs1>
      <v-text-field label="Fecha" readonly box :value= 'moment(tarea.date).format("DD-MM-YYYY")'></v-text-field>
    </v-flex>
    <v-flex xs6>
        <v-text-field label="Tarea" readonly box :value= 'tarea.name'></v-text-field>
    </v-flex>
    <v-flex xs2>
      <v-text-field label="Responsable" readonly box :value= 'tarea.worker.first_name'></v-text-field>
    </v-flex>
   <v-flex xs2 v-if="tarea.completa">
    <v-switch  label="Aprobar" v-model="tarea.approved" @change="changeStatus(tarea)" >
      </v-switch>
    </v-flex>
    <v-flex xs1 >
      <v-chip v-bind:color="estado(tarea,'color')"  text-color="white">
        {{estado(tarea,'texto')}}
      </v-chip>
    </v-flex>
    <v-flex xs12>
      <v-toolbar color="blue lighten-1" dark>
          <v-toolbar-side-icon></v-toolbar-side-icon>
          <v-toolbar-title>Listado de Subtareas </v-toolbar-title>
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
                      <v-text-field v-model="editedItem.name" label="Nombre"></v-text-field>
                    </v-flex>
                    <v-flex xs12>
                      <v-textarea v-model="editedItem.description" label="Descripción"></v-textarea>
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
      <v-data-table
        :headers="headers"
        :items="subtareas"
        :search="search"
        rows-per-page-text= "Número de Filas"
        :pagination.sync="pagination"
        class="elevation-1"
      >
        <template slot="items" slot-scope="props">
          <td>{{ moment(props.item.date).format('DD-MM-YYYY') }} </td>
          <td>{{ props.item.name }}</td>
          <td>
            <v-chip v-bind:color="estadoSub(props.item,'color')" small text-color="white">
                <v-avatar>
                  <v-icon>{{estadoSub(props.item,'icono')}}</v-icon>
                </v-avatar>
                {{estadoSub(props.item,'texto')}}
            </v-chip>
          </td>
          <td v-if="props.item.date_end">{{ moment(props.item.date_end).format('DD-MM-YYYY') }}</td>
          <td v-else>-</td>
          <td class="justify-center px-0" :class="{actived:selected == props.item.id}">
            <v-tooltip bottom>
              <v-icon  slot="activator" color="green darken-2" class="mr-2" @click="editItem(props.item)">edit</v-icon>
              <span>Editar</span>
            </v-tooltip>
            <v-tooltip bottom>
              <v-icon  slot="activator" color="blue darken-2" class="mr-2" @click="getComentarios(props.item)">comment</v-icon>
              <span>Comentarios</span>
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
    <v-dialog v-model="ventanaComentarios" fullscreen hide-overlay transition="dialog-bottom-transition">
      <v-card>
        <v-layout justify-end>
            <v-btn flat @click.native="ventanaComentarios = false">Cerrar</v-btn>
        </v-layout >
        <bz-comentarios v-if= "comentarios" v-bind:subtarea="comentarios"> </bz-comentarios>
      </v-card>
    </v-dialog>
  </v-layout>
</v-container>
</template>


<script>
  import BzComentarios from "./comentarios.vue"
  import axios from '../axios.js'
  var moment = require ('moment')
  moment.locale('es')
  export default {
    components: {BzComentarios},
    props: ['tarea'],
    data: () => ({
      moment: moment,
      fab: true,
      search: '',
      usuarios: [],
      ventanaComentarios: false,
      pagination: {descending: true},
      dialog: false,
      selected: 0,
      comentarios: false,
      headers: [
        {
          text: 'Fecha',
          align: 'left',
          sortable: true,
          isDescending: true,
          value: 'date'
        },
        {
          text: 'Subtareas',
          align: 'left',
          sortable: false,
          value: 'name'
        },
         {
          text: 'Estado',
          align: 'left',
          sortable: false,
          value: 'name'
        },
        {
          text: 'Finalizada',
          align: 'left',
          sortable: false,
          value: 'name'
        },
        { text: 'Acciones', 
        value: 'name', 
        sortable: false, 
        align: 'left', 
        width: '180'}
      ],
      subtareas: [],
      editedIndex: -1,
      editedItem: {
        name: '',
        description: ''
      },
      defaultItem: {
        name: '',
        description: ''
      }
    }),

    computed: {
      formTitle () {
        return this.editedIndex === -1 ? 'Nueva subtarea' : 'Modificar subtarea'
      },
    },

    watch: {
      dialog (val) {
        val || this.close()
      },
      tarea: function(newVal, oldVal) { 
        this.initialize()
      }
    },

    created () {
      this.initialize()
    },

    methods: {
      initialize () {
        this.$axios.get('/tasks/condos/self')
        .then(resp => {
          if(resp.status === 200){
            resp.data.forEach(tarea => {
              if (tarea.id === this.tarea.id){
                if (tarea.goals === undefined)
                  this.subtareas = []
                else
                  this.subtareas = tarea.goals
              }
            });
          }
        })
        .catch(e => {
          console.log(e)
        })          
      },
    

    editItem (item) {
        this.selected = item.id
        this.editedIndex = this.subtareas.indexOf(item)
        this.editedItem = Object.assign({}, item)
        this.dialog = true
      },

      changeStatus (item){
        let status = item.approved
       this.$axios.put('/tasks/'+item.id+'/status/'+status)
        .then(resp => {
          if(resp.status === 200){
            alert('Cambio realizado')
          }
        })
        .catch(e => {
          console.log(e)
        })
      },

      estado(tarea,tipo){
        if (tarea.completa){
          let estado = {color:'orange', icono: 'done', texto:'Completa' }
          return estado[tipo]
        }
        if (tarea.approved){
          let estado = {color:'green', icono: 'done_all', texto:'Aprobada' }
          return estado[tipo]
        }
        else {
          let estado = {color:'red', icono: 'hourglass_empty', texto:'Pendiente' }
          return estado[tipo]
        }
      },

      estadoSub(subtarea,tipo){
        if (subtarea.completed){
          let estado = {color:'orange', icono: 'done', texto:'Completa' }
          return estado[tipo]
        }
          
        else {
          let estado = {color:'red', icono: 'hourglass_empty', texto:'Pendiente' }
          return estado[tipo]
        }
        
      },

      getComentarios(item){
        this.comentarios = item
        this.selected = item.id
        this.ventanaComentarios = true
      },

      deleteItem (item) {
        this.$axios.delete('/goals/'+item.id+'?trash=true')
          .then(resp => {
            if(resp.status === 200){
              const index = this.subtareas.indexOf(item)
              this.subtareas.splice(index, 1)
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
        }, 1000)
      },

      save () {
        if (this.editedIndex > -1) {
          this.$axios.put('/goals/'+this.editedItem.id, {
            name : this.editedItem.name,
            description : this.editedItem.description,
            task: {
              id: this.tarea.id
            }
          })
          .then(resp => {
            if(resp.status === 200){
              Object.assign(this.subtareas[this.editedIndex], this.editedItem)
            }
          })
          .catch(e => {
            console.log(e)
          })
        } else {
            axios.post('/goals/', {
                name : this.editedItem.name,
                description : this.editedItem.description,
                task: {
                id: this.tarea.id
                }
            })
            .then(resp => {
                if(resp.status === 201){
                this.subtareas.push(resp.data)
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
