<template>
<v-container grid-list-md >
  <v-layout row wrap>
    <v-flex xs1>
      <v-text-field label="Fecha" readonly box :value= 'moment(lista.date).format("DD-MM-YYYY")'></v-text-field>
    </v-flex>
    <v-flex xs1>
      <v-text-field label="Hora" readonly box :value= 'moment(lista.date).format("HH:mm")'></v-text-field>
    </v-flex>
    <v-flex xs6>
        <v-text-field label="Nombre de lista" readonly box :value= 'lista.name'></v-text-field>
    </v-flex>
    <v-flex xs2>
      <v-text-field label="Responsable" readonly box :value= 'lista.worker.first_name'></v-text-field>
    </v-flex>
    <v-flex xs12>
      <v-toolbar color="grey" dark>
          <v-toolbar-side-icon></v-toolbar-side-icon>
          <v-toolbar-title>Listado de Entregas </v-toolbar-title>
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
                      <v-text-field v-model="editedItem.address" label="Direccion"></v-text-field>
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
        :items="itemsLista"
        :search="search"
        rows-per-page-text= "Número de Filas"
        :pagination.sync="pagination"
        class="elevation-1"
      >
        <template slot="items" slot-scope="props">
          <td>{{ props.item.address }} </td>
          <td>{{ props.item.description }}</td>
          <td>
            <v-chip v-bind:color="estadoEntrega(props.item,'color')" small text-color="white">
                <v-avatar>
                  <v-icon>{{estadoEntrega(props.item,'icono')}}</v-icon>
                </v-avatar>
                {{estadoEntrega(props.item,'texto')}}
            </v-chip>
          </td>
          <td v-if="props.item.date_end">{{ moment(props.item.date_end).format('DD-MM-YYYY') }}</td>
          <td v-else>-</td>
          <td v-if="props.item.date_end">{{ moment(props.item.date_end).format('HH:mm') }}</td>
          <td v-else>-</td>
          <td class="justify-center px-0" :class="{actived:selected == props.item.id}">
            <!-- <v-tooltip bottom>
              <v-icon  slot="activator" color="green darken-2" class="mr-2" @click="editItem(props.item)">edit</v-icon>
              <span>Editar</span>
            </v-tooltip> -->
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
     <v-dialog v-model="dialogComment" width="500">
      <v-card>
        <v-card-title class="headline grey lighten-2" primary-title>
         Comentario
        </v-card-title>
        <v-card-text>
          {{comentario.comment}}
        </v-card-text>
        <img v-if="comentario.image_uuid" :src = getImage(comentario.image_uuid) class="img-comment" >  
        <v-divider></v-divider>

        <v-card-actions><v-spacer></v-spacer>
          <v-btn color="primary" flat  @click="dialogComment = false">
            Cerrar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-layout>
</v-container>
</template>


<script>
  import axios from '../axios.js'
  var moment = require ('moment')
  moment.locale('es')
  export default {
    props: ['lista'],
    data: () => ({
      moment: moment,
      fab: true,
      search: '',
      pagination: {descending: true},
      dialog: false,
      selected: 0,
      comentario: '',
      dialogComment : false,
      headers: [
        {
          text: 'Direccion',
          align: 'left',
          sortable: false,
          value: 'date'
        },
        {
          text: 'Descripción',
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
          text: 'Fecha de Entregada',
          align: 'left',
          sortable: true,
          value: 'date_end'
        },
        {
          text: 'Hora de Entregada',
          align: 'left',
          sortable: true,
          value: 'date_end'
        },
        { text: 'Acciones', 
        value: 'name', 
        sortable: false, 
        align: 'left', 
        width: '180'}
      ],
      itemsLista: [],
      editedIndex: -1,
      editedItem: {
        address: '',
        description: ''
      },
      defaultItem: {
        address: '',
        description: ''
      }
    }),

    computed: {
      formTitle () {
        return this.editedIndex === -1 ? 'Nueva Entrega' : 'Modificar Entrega'
      },
    },

    watch: {
      dialog (val) {
        val || this.close()
      },
      lista: function(newVal, oldVal) { 
        this.initialize()
      }
    },

    created () {
      this.initialize()
    },

    methods: {
      initialize () {
        if (this.lista.items )
          this.itemsLista = this.lista.items
        else
          this.itemsLista = []
      },
    

    editItem (item) {
        this.selected = item.id
        this.editedIndex = this.itemsLista.indexOf(item)
        this.editedItem = Object.assign({}, item)
        this.dialog = true
      },

      estadoEntrega(item,tipo){
        if (item.delivered){
          let estado = {color:'orange', icono: 'done', texto:'Entregada' }
          return estado[tipo]
        }
          
        else {
          let estado = {color:'red', icono: 'hourglass_empty', texto:'Pendiente' }
          return estado[tipo]
        }
        
      },

      getComentarios(item){
        this.comentario = item
        this.selected = item.id
        this.dialogComment = true
      },

       getImage (uid) { return this.$store.state.conf.api+'/items/image/'+uid },

      deleteItem (item) {
        this.$axios.delete('/items/'+item.id+'?trash=true')
          .then(resp => {
            if(resp.status === 200){
              const index = this.itemsLista.indexOf(item)
              this.itemsLista.splice(index, 1)
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
          this.$axios.put('/items/'+this.editedItem.id, {
            address : this.editedItem.address,
            description : this.editedItem.description,
            delivery: {
              id: this.lista.id
            }
          })
          .then(resp => {
            if(resp.status === 200){
              Object.assign(this.itemsLista[this.editedIndex], this.editedItem)
            }
          })
          .catch(e => {
            console.log(e)
          })
        } else {
            axios.post('/items/', {
                address : this.editedItem.address,
                description : this.editedItem.description,
                delivery: {
                id: this.lista.id
                 }
            })
            .then(resp => {
                if(resp.status === 201){
                  resp.data.address = this.editedItem.address
                  resp.data.description = this.editedItem.description
                  this.itemsLista.push(resp.data)
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

.img-comment{
      max-width: 420px;
    padding-left: 10%;
}
</style>
