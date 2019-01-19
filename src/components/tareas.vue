<template>
<v-container grid-list-md >
  <v-toolbar absolute>
      <v-spacer></v-spacer>
      <v-toolbar-items>
        <v-btn flat to='/notificaciones'>
         <v-badge left>
          <span slot="badge">{{numeroNotificaciones}}</span>
          NOTIFICACIONES 
        </v-badge>
        </v-btn>
        
        <v-btn flat to='/gestion'>TAREAS</v-btn>
      </v-toolbar-items>
  </v-toolbar>
  <v-layout row wrap mt-5>
    <v-flex xs12>
      <v-toolbar color="grey" dark>
          <v-toolbar-side-icon></v-toolbar-side-icon>
          <v-toolbar-title>Listado de Tareas </v-toolbar-title>
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
                      <v-text-field v-model="editedItem.address" label="Dirección"></v-text-field>
                    </v-flex>
                    <v-flex xs12>
                      <v-text-field v-model="editedItem.phone" label="Teléfono de contacto"></v-text-field>
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
        label="Buscar por fecha, tarea o responsable"
        single-line
      
      ></v-text-field>
        
      </v-toolbar>
      <v-data-table
        :headers="headers"
        :items="tareas"
        :search="search"
        rows-per-page-text= "Número de Filas"
        :pagination.sync="pagination"
        class="elevation-1"
      >
        <template slot="items" slot-scope="props">
          <td>{{ moment(props.item.date).format('DD-MM-YYYY') }} </td>
          <td>{{ props.item.name }}</td>
          <td>{{ props.item.worker.first_name }}</td>
          <td>
            <v-chip v-bind:color="estado(props.item,'color')" small text-color="white">
              <v-avatar>
                <v-icon>{{estado(props.item,'icono')}}</v-icon>
              </v-avatar>
               {{estado(props.item,'texto')}}
            </v-chip>
          </td>
          <td class="justify-center px-0" :class="{actived:selected == props.item.id}">
            <v-tooltip bottom>
              <v-icon  slot="activator" color="green darken-2" class="mr-2" @click="editItem(props.item)">edit</v-icon>
              <span>Editar</span>
            </v-tooltip>
            <v-tooltip bottom>
              <v-icon  slot="activator" color="blue darken-2" class="mr-2" @click="props.expanded = !props.expanded">visibility</v-icon>
              <span>Detalles</span>
            </v-tooltip>
            <v-tooltip bottom>
              <v-icon  slot="activator" color="red darken-2" @click="deleteItem(props.item)">delete</v-icon>
              <span>Eliminar</span>
            </v-tooltip>
          </td>
        </template>
        <template slot="expand" slot-scope="props">
            <v-card flat>
              <v-card-text>Dirección: {{props.item.address}}</v-card-text>
              <v-card-text>Teléfono de contacto: {{props.item.phone}}</v-card-text>
              <v-btn small color="primary" @click="getSubtareas(props.item)" >Subtareas</v-btn>
            </v-card>
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
        <bz-subtareas v-if= "subtareas" v-bind:tarea="subtareas"> </bz-subtareas>
      </v-card>
    </v-dialog>
  </v-layout>
</v-container>
</template>


<script>
import BzComentarios from "./comentarios.vue"
  import BzSubtareas from "./subtareas.vue"
  import axios from '../axios.js'
  var moment = require ('moment')
  moment.locale('es')
  export default {
    components: {BzSubtareas},
    data: () => ({
      moment: moment,
      fab: true,
      info: null,
      search: '',
      selectUsuarios: { id: '', first_name: '' },
      usuarios: [],
      subtareas: 0,
      pagination: {descending: true},
      ventana: false,
      dialog: false,
      selected: 0,
      numeroNotificaciones: 0,
      headers: [
        {
          text: 'Fecha',
          align: 'left',
          sortable: true,
          isDescending: true,
          value: 'date'
        },
        {
          text: 'Tarea',
          align: 'left',
          sortable: false,
          value: 'name'
        },
        {
          text: 'Responsable',
          align: 'left',
          sortable: false,
          value: 'worker.first_name'
        },
         {
          text: 'Estado',
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
      tareas: [],
      editedIndex: -1,
      editedItem: {
        name: '',
        phone:'',
        address: ''
      },
      defaultItem: {
        name: '',
        phone:'',
        address: ''
      }
    }),

    computed: {
      formTitle () {
        return this.editedIndex === -1 ? 'Nueva tarea' : 'Modificar tarea'
      }
    },

    watch: {
      dialog (val) {
        val || this.close()
      }
    },

    created () {
      this.initialize()
      this.getUsuarios()
      this.notificacionesSinVer()
    },

    methods: {
      initialize () {
        axios.get('/tasks/condos/self')
        .then(resp => {
          if(resp.status === 200){
            this.tareas = resp.data
            for (let x = 0; x < this.tareas.length; x++) {
              let i = 0
              if (this.tareas[x].goals) {
               for (let y = 0; y < Object.keys(this.tareas[x].goals).length; y++) {
                if (this.tareas[x].goals[y].completed)
                  i += 1
              }
              if (Object.keys(this.tareas[x].goals).length == i)
                this.tareas[x].completa = true
              else
                this.tareas[x].completa = false       
              }
              else
                this.tareas[x].completa = false  
            }        
          }
        })
        .catch(e => {
          console.log(e)
        })
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

      notificacionesSinVer () {
			axios.get('/notifications/condos/self')
			.then(resp => {
				if(resp.status === 200){
          if (resp.data.length > 0)
					  resp.data.forEach(element => {
							if (!element.view)
								this.numeroNotificaciones += 1
						})    
				}
			})
			.catch(e => {
				console.log(e)
			})
		},

      

    editItem (item) {
        this.selected = item.id
        this.editedIndex = this.tareas.indexOf(item)
        this.editedItem = Object.assign({}, item)
        this.selectUsuarios = {id: item.worker.id, first_name: item.worker.first_name}
        this.dialog = true
      },

      getSubtareas(item){
        this.subtareas = item
        this.ventana = true
      },

      estado(tarea,tipo){
        if (tarea.approved){
          let estado = {color:'green', icono: 'done_all', texto:'Aprobada' }
          return estado[tipo]
        }
        else if (tarea.completa){
          let estado = {color:'orange', icono: 'done', texto:'Completa' }
          return estado[tipo]
        }
        else {
          let estado = {color:'red', icono: 'hourglass_empty', texto:'Pendiente' }
          return estado[tipo]
        }
      },

      deleteItem (item) {
        this.$axios.delete('/tasks/'+item.id+'?trash=true')
          .then(resp => {
            if(resp.status === 200){
              const index = this.tareas.indexOf(item)
              this.tareas.splice(index, 1)
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
          this.selectUsuarios = {id:'',first_name: ''}
        }, 1000)
      },

      save () {
        if (this.editedIndex > -1) {
          this.$axios.put('/tasks/'+this.editedItem.id, {
            name : this.editedItem.name,
            phone : this.editedItem.phone,
            address : this.editedItem.address,
            worker: {
              id: this.selectUsuarios.id
            }
          })
          .then(resp => {
            if(resp.status === 200){
              Object.assign(this.tareas[this.editedIndex], this.editedItem)
            }
          })
          .catch(e => {
            console.log(e)
          })
        } else {
            axios.post('/tasks/', {
                name : this.editedItem.name,
                phone : this.editedItem.phone,
                address : this.editedItem.address,
                worker: {
                id: this.selectUsuarios.id
                }
            })
            .then(resp => {
                if(resp.status === 201){
                   resp.data.worker.first_name = this.selectUsuarios.first_name
                this.tareas.push(resp.data)
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
