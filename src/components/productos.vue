<template>
<v-container grid-list-md >
  <v-toolbar absolute>
      <v-spacer></v-spacer>
      <v-toolbar-items>
        <v-btn flat to='/productos'>ITEMS</v-btn>
        <v-btn flat to='/inventario'>INVENTARIO</v-btn>
      </v-toolbar-items>
  </v-toolbar>
  <v-layout row wrap mt-5>
    <v-flex xs12  mt-3>
      <v-toolbar color="grey " dark>
        <v-toolbar-title> ITEMS</v-toolbar-title>
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
                      <v-text-field v-model="editedItem.code" label="Codigo" :rules="[rules.required]"></v-text-field>
                    </v-flex>
                    <v-flex xs12>
                      <v-text-field v-model="editedItem.name" label="Nombre" :rules="[rules.required]"></v-text-field>
                    </v-flex>
                    <v-flex xs12>
                      <v-text-field v-model="editedItem.quantity" mask="######" label="Cantidad" :rules="[rules.required]"></v-text-field>
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
        :items="objects"
        :search="search"
        rows-per-page-text= "Número de Filas"
        class="elevation-1"
        
      >
        <template slot="items" slot-scope="props">
          <td :class="{actived:selected == props.item.id}" >{{ props.item.code }}</td>
          <td :class="{actived:selected == props.item.id}" >{{ props.item.name }}</td>
          <td :class="{actived:selected == props.item.id}" >{{ props.item.quantity }}</td>
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
      <div class="text-xs-center pt-2">
      </div>
    </v-flex>
  </v-layout>
</v-container>
</template>


<script>
  import axios from '../axios.js'

  export default {
    data: () => ({
      info: null,
      search: '',
      dialog: false,
      selected: 0,
      headers: [
        {
          text: 'Codigo',
          sortable: true,
          value: 'code'
        },
        {
          text: 'Nombre',
          sortable: true,
          value: 'name'
        },
         {
          text: 'Cantidad',
          sortable: true,
          value: 'cant'
        },
        { text: 'Acciones', 
        sortable: false, 
        align: 'left', 
        width: '180'}
      ],
      objects: [{code: '001', name: 'Producto xxx', quantity: 3}],
      editedIndex: -1,
      editedItem: {
        name: '',
        code: '',
        quantity: ''
      },
      defaultItem: {
        name: '',
        code: '',
        quantity: ''
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
        return this.editedIndex === -1 ? 'Nuevo Item' : 'Modificar item'
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
        axios.get('/objects/self')
        .then(resp => {
          if(resp.status === 200){
            this.objects = resp.data
          }
        })
        .catch(e => {
          console.log(e)
        })
      },

      editItem (item) {
        this.selected = item.id
        this.editedIndex = this.objects.indexOf(item)
        this.editedItem = Object.assign({}, item)
        this.dialog = true
      },

      deleteItem (item) {
        this.$axios.delete('/objects/'+item.id+'?trash=true')
          .then(resp => {
            if(resp.status === 200){
              const index = this.objects.indexOf(item)
              this.objects.splice(index, 1)
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
          this.$axios.put('/objects/'+this.editedItem.id, {
            name : this.editedItem.name,
            code : this.editedItem.code,
            quantity : parseInt(this.editedItem.quantity),
            condos: {
              id: this.$store.state.sesion.id
            }
          })
          .then(resp => {
            if(resp.status === 200){
              Object.assign(this.objects[this.editedIndex], this.editedItem)
            }
          })
          .catch(e => {
            console.log(e)
          })
        } else {
          axios.post('/objects/', {
          name : this.editedItem.name,
            code : this.editedItem.code,
            quantity : parseInt(this.editedItem.quantity),
            condos: {
              id: this.$store.state.sesion.id
            }
        })
        .then(resp => {
          if(resp.status === 201){
            this.objects.push(resp.data)
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
