<template>
  <v-flex xs6>
    <v-toolbar color="blue lighten-1" dark>
      <v-toolbar-title>Puntos de control - {{zone.name}}</v-toolbar-title>
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
      :items="points"
      :search="search"
      :pagination.sync="pagination"
      hide-actions
      class="elevation-1"
    >
      <template slot="items" slot-scope="props">
        <td :class="{actived:selected == props.item.id}" >{{ props.item.name }}</td>
        <td class="justify-center px-0" :class="{actived:selected == props.item.id}">
          <v-tooltip bottom>
            <v-icon  slot="activator" color="green darken-2" class="mr-2" @click="editItem(props.item)">edit</v-icon>
            <span>Editar</span>
          </v-tooltip>
          <a :href="'https://api.qrserver.com/v1/create-qr-code/?size=250x250&data='+props.item.id" target="_blank">
          <v-tooltip bottom>
            <v-icon  slot="activator" color="yellow darken-2" class="mr-2" >cloud_download</v-icon>
            <span>Descargar qr</span>
          </v-tooltip></a>
          <v-tooltip bottom>
            <v-icon  slot="activator" color="red darken-2" @click="deleteItem(props.item)">delete</v-icon>
            <span>Eliminar</span>
          </v-tooltip>
        </td>
      </template>
      <template slot="no-data">
        <v-btn color="primary" @click="initialize">Reset</v-btn>
      </template>
    </v-data-table>
    <div class="text-xs-center pt-2">
      <v-pagination v-model="pagination.page" :length="pages"></v-pagination>
    </div>
  </v-flex>
</template>


<script>
  export default {
    props: ["zone"],
    data: () => ({
      search: '',
      pagination: {rowsPerPage: 10},
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
      points: [],
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
        return this.editedIndex === -1 ? 'Nuevo punto de control' : 'Modificar punto de control'
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
        this.points = this.zone.points
      },

      editItem (item) {
        this.selected = item.id
        this.editedIndex = this.points.indexOf(item)
        this.editedItem = Object.assign({}, item)
        this.dialog = true
      },

      deleteItem (item) {
        this.$axios.delete('/points/'+item.id+'?trash=true')
          .then(resp => {
            if(resp.status === 200){
              const index = this.points.indexOf(item)
              this.points.splice(index, 1)
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
          this.$axios.put('/points/'+this.editedItem.id, {
            name : this.editedItem.name,
            zones: {
              id: this.zone.id
            }
          })
          .then(resp => {
            if(resp.status === 200){
              Object.assign(this.zone.points[this.editedIndex], this.editedItem)
            }
          })
          .catch(e => {
            console.log(e)
          })
          
        } else {
          this.$axios.post('/points/', {
            name : this.editedItem.name,
            zones : {id : this.zone.id}
          })
          .then(resp => {
            if(resp.status === 201){
              this.points.push(resp.data)
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
