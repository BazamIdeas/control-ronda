<!-- eventos de modulo de rondas no confundir con eventos de entrega de turnos  -->
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
    <v-flex xs12  mt-3>
      <v-toolbar color="grey " dark >
        <v-toolbar-title> Eventos</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-flex xs3 mt-3>
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
            v-model="mes"
            label="Mes"
            readonly
          ></v-text-field>
          <v-date-picker v-model="date" locale="es-419" @input="$refs.menu.save(date)" type="month"></v-date-picker>
            </v-menu>
            </v-flex>
            <v-btn icon @click="initialize ()">
            <v-icon>autorenew</v-icon>
          </v-btn>
      </v-toolbar>
     <!-- <v-toolbar flat color="white">
        <v-text-field
        v-model="search"
        append-icon="search"
        label="Buscar por zona, punto de control o nombre"
        single-line
        hide-details
      ></v-text-field>
      </v-toolbar>  -->
      <v-data-table
        :headers="headers"
        :items="eventos"
        :search="search"
        :loading="isLoading"
        rows-per-page-text= "Número de Filas"
        class="elevation-1"
        hide-actions
      >
          <v-progress-linear v-slot:progress color="blue" indeterminate></v-progress-linear>

        <template slot="items" slot-scope="props">
          <td >{{ moment(props.item.date).format('DD/MM/YYYY') }} </td>
          <td >{{ moment(props.item.date).format('HH:mm') }} </td>
          <td  >{{ props.item.point.zones.name }}</td>
          <td  >{{ props.item.point.name }}</td>
          <td  >{{ props.item.watchers.worker.first_name }}</td>
          <td >
            <v-chip color="red" small text-color="white" v-if= "props.item.watcher_comment" @click="props.expanded = !props.expanded">!</v-chip>
            </td>
        </template>
        <template slot="expand" slot-scope="props">
            <v-card flat>
              <v-card-text>{{props.item.watcher_comment}}</v-card-text>
              <v-btn small color="primary" @click="getComentarios(props.item)" >Revisar evento</v-btn>
            </v-card>
          </template>
        <template slot="no-data">
          <p>Sin datos para mostrar</p>
          <v-btn color="primary" @click="initialize">Recargar</v-btn>
        </template>
      </v-data-table>
      <div class="text-xs-center pt-2">
      </div>
    </v-flex>
    <v-dialog v-if="ventanaComentarios" v-model="ventanaComentarios" fullscreen hide-overlay transition="dialog-bottom-transition">
      <v-card>
        <v-layout justify-end>
            <v-btn flat @click.native="ventanaComentarios = false">Cerrar</v-btn>
        </v-layout >
        <bz-comentarios-veri v-if= "comentarios" v-bind:verificacion="comentarios"> </bz-comentarios-veri>
      </v-card>
    </v-dialog>
  </v-layout>
</v-container>
</template>


<script>
  import axios from '../axios.js'
  import BzComentariosVeri from "./comentarios_verificacion.vue"
  let meses= new Array ("Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre");
  let d= new Date()
  let m= d.getMonth()
  var moment = require ('moment')
  moment.locale('es')
  export default {
    components: { BzComentariosVeri },
    data: () => ({
      search: '',
      menu: false,
      date: null,
      moment: moment,
      comentarios: '',
      ventanaComentarios: false,
      mesN: moment(d).format('MM'),
      anio: moment(d).format('YYYY'),
      isLoading:false,
      eventos: [],
      headers: [
        {
          text: 'Fecha',
          sortable: true,
          value: 'date'
        },
        { text: 'Hora', 
        },
        { text: 'Zona', 
        },
        { text: 'Punto de control', 
        },
        { text: 'Nombre', 
        },
        { text: 'Detalles', 
        },
      ],
    }),



    created () {
      this.initialize(this.mesN,this.anio)
    },

    computed: {
      mes: function (){
        if (!this.date){
          return meses[m]
        }
        else{
          let dateNew = this.date.split("-")
          this.initialize(dateNew[1],dateNew[0])
          return meses[parseInt(dateNew[1])-1]
        }
      }
    },

    methods: {
      initialize (m,y) {
        this.isLoading = true
        axios.get('/condos/verifications/'+y+'/'+m+'?watcher-comment=true')
        .then(resp => {
          if(resp.status === 200){
            this.eventos = resp.data
            console.log("data" + resp.data)
                    this.isLoading = false
          }
        })
        .catch(e => {
          this.eventos = []
                              this.isLoading = false
          console.log(e)
        })
      },
      getComentarios(item){
        this.comentarios = item
        this.ventanaComentarios = true
      },
    }
  }
</script>

<style>
.actived{
  background: #f7f0b2;
}
</style>
