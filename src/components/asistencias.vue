<template>
<v-container grid-list-md >
  <v-toolbar absolute>
      <v-spacer></v-spacer>
      <v-toolbar-items>
        <v-btn flat to='/empleados'>REPORTES DE EMPLEADOS</v-btn>
        <v-btn flat to='/asistencias'>ASISTENCIAS</v-btn>
        <v-btn flat to='/configuracion-asistencia'>CONFIGURACIÓN</v-btn>
      </v-toolbar-items>
  </v-toolbar>
  <v-layout row wrap mt-5>
    <v-flex xs12>
      <v-toolbar color="grey" dark>
          <v-toolbar-title>ASISTENCIAS</v-toolbar-title>
          <v-spacer></v-spacer>
          <v-btn icon @click="initialize ()">
            <v-icon>autorenew</v-icon>
          </v-btn>
        </v-toolbar>

      <v-toolbar flat color="white">
        <v-text-field
        v-model="search"
        append-icon="search"
        label="Buscar por nombre o RUT"
        single-line
        hide-details
      ></v-text-field>
      </v-toolbar>
      <v-data-table
        :headers="headers"
        :items="asistencias"
        :estados="estados"
        :search="search"
        :pagination.sync="pagination"
        rows-per-page-text= "Número de Filas"
                :loading="isLoading"
        class="elevation-1"
      >                      <v-progress-linear v-slot:progress color="blue" indeterminate></v-progress-linear>

        <template slot="items" slot-scope="props">
          <td  >{{moment(props.item.date).format('DD/MM/YYYY') }}</td>
          <td >{{moment(props.item.date).format('HH:mm') }}</td>
          <td ><v-chip small :color= "tipo(props.item, 'color')" text-color="white">{{tipo(props.item, 'texto')}}</v-chip></td>
          <td >{{ props.item.workers.first_name }}</td>
          <td >{{ props.item.workers.rut }}</td>
          <td >{{ props.item.latitude }}</td>
          <td >{{ props.item.longitude }}</td>
        </template>
        <template slot="no-data">
          <v-btn color="primary" @click="initialize">Recargar</v-btn>
        </template>
      </v-data-table>
    </v-flex>
<!--     <v-flex xs4>
      <v-toolbar color="grey" dark>
        <v-toolbar-title>TIEMPO REAL</v-toolbar-title>
      </v-toolbar>
      <v-data-table
        :headers="headers2"
        :items="tiempoReal"
        hide-actions
        class="elevation-1"
      >
        <template slot="items" slot-scope="props">
          <td >{{ props.item.User }}</td>
          <td ><v-chip small :color= 'props.item.tipo.color' text-color="white">{{props.item.tipo.texto}}</v-chip></td>
        </template>
        <template slot="no-data">
          <p>Vista previa de las asistencias en tiempo real, este listado es temporal </p>
        </template>
      </v-data-table>
    </v-flex> -->
  </v-layout>
</v-container>
</template>


<script>

var moment = require ('moment')
  export default {

    data: () => ({
      fab: true,
      isConnected: false,
      search: '',
      selected: 0,
      isLoading:false,
      moment: moment,
      pagination: {descending: true},
      tiempoReal: [],
      asistencias: [],
      estados : {
            'entry': {color: 'green', texto: 'Entrada'},
            'break': {color: 'orange', texto: 'Inicio colación'},
            'finish_break': {color: 'blue', texto: 'Final colación'},
            'exit': {color: 'red', texto: 'Salida'}
          },
      headers2:[{text:'Nombre', value:'User', sortable: false}, {text:'Tipo', value: 'Content', sortable: false}],
      headers: [
        {
          text: 'Fecha',
          sortable: true,
          value: 'date',
          isDescending: true
        },
        {
          text: 'Hora'
        },
        {
        text: 'Tipo',
        value: 'type',
        },
        {
        text: 'Nombre',
        sortable: true,
        value: 'workers.first_name',
        },
        {
        text: 'RUT',
        sortable: true,
        value: 'workers.rut',
        },
        {
          text: 'Latitud',
          sortable: true,
          value: 'latitud',
        },
        {
          text: 'Longitud',
          sortable: true,
          value: 'longitud',
        }
      ]
    }),

    computed: {
      pages () {
        if (this.pagination.rowsPerPage == null ||
          this.pagination.totalItems == null
        ) return 0

        return Math.ceil(this.pagination.totalItems / this.pagination.rowsPerPage)
      }
    },


    created () {
      this.initialize()
      this.socket()
    },

    methods: {

      tipo (item, tipo){
        let t = item.type.replace("-", "_")

          let estados = {
            'entry': {color: 'green', texto: 'Entrada'},
            'break': {color: 'orange', texto: 'Inicio colación'},
            'finish_break': {color: 'blue', texto: 'Final colación'},
            'exit': {color: 'red', texto: 'Salida'}
          }
          return estados[t][tipo]
      },

      socket (){
        const socket = new WebSocket(this.$store.state.conf.socket + '/ws/join?token=' + localStorage.getItem('bazam-token-control'))
        socket.onmessage = event => {
          this.initialize()
          let data = event.data.replace("-", "_")
          let dataParser = JSON.parse(data)
          let estados = {
            'entry': {color: 'green', texto: 'Entrada'},
            'break': {color: 'orange', texto: 'Inicio colación'},
            'finish_break': {color: 'blue', texto: 'Final colación'},
            'exit': {color: 'red', texto: 'Salida'}
          }
          dataParser.tipo = estados[dataParser.Content]
          this.tiempoReal.push(dataParser)
        }
      },

      initialize () {
      this.Get()
      },
      Get(){
        this.isLoading=true
        this.$axios.get('/assistances?limit=1000000000000000')
        .then(resp => {
          if(resp.status === 200){
            this.asistencias = resp.data.filter(a =>{
              if (a.workers.condos.id === this.$store.state.admin.condos.id)
                return a
            })
          }
            this.isLoading=false
        })
        .catch(e => {
          console.log(e)
          this.isLoading=false
        })
      }
    }
  }
</script>

<style>
.actived{
  background: #f7f0b2;
}

</style>
