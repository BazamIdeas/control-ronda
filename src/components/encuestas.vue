<template>
<v-container grid-list-md >
   <v-toolbar absolute>
      <v-spacer></v-spacer>
      <v-toolbar-items>
        <v-btn flat to='/residentes'>RESIDENTES</v-btn>
        <v-btn flat to='/encuestas'>ENCUESTAS</v-btn>
      </v-toolbar-items>
    </v-toolbar>
  <v-layout row wrap mt-5>
    <v-flex xs12 >
      <v-toolbar color="grey" dark>
          <v-toolbar-side-icon></v-toolbar-side-icon>
          <v-toolbar-title>Encuestas</v-toolbar-title>
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
                    <v-text-field v-model="editedItem.label" label="Pregunta" :rules="[rules.required]"></v-text-field>
                  </v-flex>
                  <v-flex xs6>
                    <v-menu
                    ref="menu"
                    :close-on-content-click="false"
                    v-model="menu"
                    :nudge-right="40"
                    lazy
                    transition="scale-transition"
                    offset-y
                    full-width
                    min-width="290px"
                  >
                    <v-text-field
                    slot="activator"
                    v-model="fecha"
                    label="Fecha de expiración"
                    readonly
                    ></v-text-field>
                    <v-date-picker v-model= date  locale="es-419" @input="$refs.menu.save(date)" ></v-date-picker>
                    </v-menu>
                  </v-flex>
                  <v-flex xs6>
                    <v-text-field v-model.number="editedItem.price" label="Monto" ></v-text-field>
                  </v-flex>
                  <v-flex xs12>
                    <v-textarea  v-model="editedItem.description" label="Descripción"></v-textarea>
                  </v-flex>
                  <v-flex xs6>
                    <v-switch label="Solo para el comité" v-model="editedItem.committee_only" >
                    </v-switch>
                  </v-flex>
                </v-layout>
              </v-container>
            </v-card-text>

            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn color="blue darken-1" flat @click.native="close">Cancelar</v-btn>
              <v-btn color="blue darken-1" flat @click.native="save" v-if="editedItem.label">Guardar</v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
        </v-toolbar>
      <v-toolbar flat color="white">
        <v-text-field
        v-model="search"
        append-icon="search"
        label="Buscar por fecha o pregunta"
        single-line
        hide-details
      ></v-text-field>
      </v-toolbar>
      <v-data-table
        :headers="headers"
        :items="encuestas"
        :search="search"
        rows-per-page-text= "Número de Filas"
        :pagination.sync="pagination"
        class="elevation-1"
      >
        <template slot="items" slot-scope="props">
          <td  >{{ moment(props.item.date).format('DD-MM-YYYY') }}</td>
          <td  >{{ moment(props.item.date_end).format('DD-MM-YYYY') }}</td>
          <td  ><v-icon v-if="props.item.committee_only" >people</v-icon> {{ props.item.label }}</td>
          <td class="justify-center px-0" >
           <v-switch  v-model="props.item.approved" @change="aprobar(props.item)" ></v-switch>
           <!-- <v-chip color="green" small text-color="white" v-if="props.item.approved" v-model="props.item.approved">visible</v-chip> -->
          </td>
          <td ><v-chip color="blue" small text-color="white">{{ numeroVotos(props.item) }}</v-chip> </td>
          <td >{{ props.item.price }}</td>
          <td class="justify-center px-0" >
            <v-tooltip bottom>
              <v-icon  slot="activator" color="blue darken-2" class="mr-2" @click="getDetalles(props.item)">visibility</v-icon>
              <span>Detalles</span>
            </v-tooltip>
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
    <v-dialog v-model="verDetalles" fullscreen hide-overlay transition="dialog-bottom-transition">
      <v-card>
        <v-layout justify-end>
            <v-btn flat @click.native="verDetalles = false">Cerrar</v-btn>
        </v-layout >
        <bz-detalle v-if= "detalleEncuesta" v-bind:detalleEncuesta="detalleEncuesta"> </bz-detalle>
      </v-card>
    </v-dialog>
  </v-layout>
</v-container>
</template>


<script>

import BzDetalle from "./detalleEncuesta.vue"
var moment = require ('moment')
  moment.locale('es')
  export default {
    components: {BzDetalle},
    data: () => ({
      fechaActual: moment().format('DD-MM-YYYY'),
      moment: moment,
      search: '',
      date: null,
      menu: false,
      dialog: false,
      pagination: {descending: true},
      detalleEncuesta: '',
      selected: 0,
      verDetalles: false,
      headers: [
        {
          text: 'Fecha',
          sortable: true,
          value: 'date'
        },
        {
          text: 'Expiración',
          sortable: true,
          value: 'date_end'
        },
        {
          text: 'Pregunta',
          sortable: true,
          value: 'label'
        },
        {
          text: 'Visible',
          sortable: false,
        },
        {
          text: 'Votos',
          sortable: true,
          value: 'votos',
        },
        {
          text: 'Precio',
          sortable: true,
          value: 'price',
        },
        { text: 'Acciones', 
        sortable: false, 
        }
      ],
      encuestas: [],
      editedIndex: -1,
      editedItem: {
        date_end: '',
        approved: true,
        price: 0,
        description: '',
        committee_only: false,
        label: '',
        condos: { condos_id: ''}
      },
      defaultItem: {
        date_end: '',
        approved: true,
        price: 0,
        description: '',
        committee_only: false,
        label: '',
        condos: { condos_id: ''}
      },
      rules: {
          required: value => !!value || 'El campo es requerido.',
          counter: value => value.length <= 20 || 'Max 20 characters',
          email: value => {
            const pattern = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
            return pattern.test(value) || 'Correo invalido'
          }
        }
    }),

    computed: {
      formTitle () {
        return this.editedIndex === -1 ? 'Nueva Encuesta' : 'Modificar encuesta'
      },

      fecha: function (){
        if (!this.date){
          return this.fechaActual
        }
        else{
          return moment(this.date).format('DD-MM-YYYY')
        }
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
        this.$axios.get('/questions/self')
        .then(resp => {
          if(resp.status === 200){
            if (resp.data !== null){
              this.encuestas = resp.data
            }
            else{
              this.encuestas = []
            }
            
          }
        })
        .catch(e => {
          console.log(e)
        })
      },

      editItem (item) {
        this.selected = item.id
        this.editedIndex = this.encuestas.indexOf(item)
        this.editedItem = Object.assign({}, item)
        this.dialog = true
      },

      save () {
        if (this.editedIndex > -1) {
          this.editedItem.date_end = this.date ? this.moment(this.date).format('YYYY-MM-DD') : this.moment().format('YYYY-MM-DD')

          this.$axios.put('/questions/'+this.editedItem.id, this.editedItem)
          .then(resp => {
            if(resp.status === 200){
              Object.assign(this.encuestas[this.editedIndex], this.editedItem)
            }
          })
          .catch(e => {
            console.log(e)
          })
        } else {
          this.editedItem.date_end = this.date ? this.moment(this.date).format('YYYY-MM-DD') : this.moment().format('YYYY-MM-DD')
          
          this.editedItem.condos.condos_id = this.$store.state.admin.condos.id
            this.$axios.post('/questions/', this.editedItem)
            .then(resp => {
                if(resp.status === 201){
                  this.encuestas.push(resp.data)
                }
            })
            .catch(e => {
                console.log(e)
            })
        }
        this.close()
      },

      deleteItem (item) {
        this.$axios.delete('/questions/'+item.id+'?trash=true')
          .then(resp => {
            if(resp.status === 200){
              const index = this.encuestas.indexOf(item)
              this.encuestas.splice(index, 1)
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
        }, 1500)
      },

 

       aprobar(item){
        this.$axios.put('/questions/'+item.id, item)
        .then(resp => {
          if(resp.status === 200){
           alert("Cambio satisfactorio")
          }
        })
        .catch(e => {
          console.log(e)
        })
      },

      getDetalles(item){
        this.detalleEncuesta = item
        this.selected = item.id
        this.verDetalles = true
      },

      numeroVotos (item) {
        if (!item.votes)
          return 0
        
        else
          return item.votes.length
      }
    }
  }
</script>

<style>
.actived{
  background: #f7f0b2;
}
</style>
