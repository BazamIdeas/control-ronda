<template>
  <v-flex xs6  mt-3>
    <v-toolbar color="grey" dark>
      <v-toolbar-title> Puntos de control - {{zone.name}}</v-toolbar-title>
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
      rows-per-page-text= "Número de Filas"
      class="elevation-1"
    >
      <template slot="items" slot-scope="props">
        <td :class="{actived:selected == props.item.id}" >{{ props.item.name }}</td>
        <td class="justify-center px-0" :class="{actived:selected == props.item.id}">
          <v-tooltip bottom>
            <v-icon  slot="activator" color="green darken-2" class="mr-2" @click="editItem(props.item)">edit</v-icon>
            <span>Editar</span>
          </v-tooltip>
          <v-tooltip bottom>
            <v-icon  slot="activator" color="yellow darken-2" class="mr-2" @click="qr(props.item)" >cloud_download</v-icon>
            <span>Descargar qr</span>
          </v-tooltip>
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
  </v-flex>
</template>


<script>
  var jsPDF = require ('jspdf')
  require('jspdf-autotable');
  export default {
    
    props: ["zone"],
    data: () => ({
      search: '',
      dialog: false,
      selected: 0,
      points: [],
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
      },
      zone: function(newVal, oldVal) { 
        this.initialize()
      }
    },

    created () {
      this.initialize()
    },

    methods: {
      initialize () {
        this.$axios.get('/zones/self')
        .then(resp => {
          if(resp.status === 200){
            resp.data.forEach(zona => {
              if (zona.id === this.zone.id){
                if (zona.points === undefined)
                  this.points = []
                else
                  this.points = zona.points
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
        }, 3000)
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
              Object.assign(this.points[this.editedIndex], this.editedItem)
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
      },
      qr2(punto) {

          var img = new Image()
          img.addEventListener('load', function() {
            var doc = new jsPDF()
            doc.setFontSize(20)
            doc.text('Punto de control: '+punto.name, 50, 30)
            const file = 'QR Punto de control: '+punto.name+'.pdf'
            doc.addImage(img, 'png', 10, 50)
            doc.save(file)
            
        })
        img.src = 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data='+punto.id
      },

      qr(punto){
         var myWindow = window.open("", "MsgWindow", "width=500,height=700")
         let img = 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data='+punto.id
         let name= punto.name
         let zona = this.zone.name
         myWindow.document.write("<center><hr><img src="+img+"><hr><h3>Punto de control:</h3><h1>"+name+"</h1><h4>"+zona+"</h4></center>")
         setTimeout(function(){ myWindow.print() }, 2000);
         
      }
    }
  }
</script>

<style>
.actived{
  background: #f7f0b2;
}
</style>
