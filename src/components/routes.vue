<template>
  <v-flex xs9>
    <v-layout row wrap>
      <v-flex xs6>
        <v-toolbar color="blue lighten-1" dark>
          <v-toolbar-title>Rondas</v-toolbar-title>
          <v-spacer></v-spacer>
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
          readonly
          ></v-text-field>
          <v-date-picker v-model="date" locale="es-419" @input="$refs.menu.save(date)" @change="initialize"></v-date-picker>
          </v-menu>
          <v-btn icon>
          <v-icon @click="pdf()">play_for_work</v-icon>
        </v-btn>
        </v-toolbar>
        <v-data-table
          :headers="headers"
          :items="verificaciones"
          :search="search"
          rows-per-page-text= "Número de Filas"
          class="elevation-1"
        >
          <template slot="items" slot-scope="props">
            <td :class="{actived:selected == props.item.id}" >{{ props.item.point.zones.name }}</td>
            <td :class="{actived:selected == props.item.id}" >{{ props.item.point.name }}</td>
            <td :class="{actived:selected == props.item.id}" >
             {{ moment(props.item.date).format('HH:mm') }}
             <v-chip color="red" small text-color="white" v-if= "props.item.watcher_comment" @click="getComentarios(props.item)">!</v-chip>
            </td>
          </template>
          <template slot="no-data">
            <v-btn color="primary" @click="initialize">Recargar</v-btn>
          </template>
        </v-data-table>
        <div class="text-xs-center pt-2">
        </div>
      </v-flex>
      <bz-maps v-if= "veri" v-bind:verificaciones="verificaciones"> </bz-maps>
      <v-dialog v-model="ventanaComentarios" fullscreen hide-overlay transition="dialog-bottom-transition">
      <v-card>
        <v-layout justify-end>
            <v-btn flat @click.native="ventanaComentarios = false">Cerrar</v-btn>
        </v-layout >
        <bz-comentarios-veri v-if= "comentarios" v-bind:verificacion="comentarios"> </bz-comentarios-veri>
      </v-card>
    </v-dialog>
    </v-layout >
  </v-flex>
</template>


<script>
  import BzMaps from "./maps.vue"
  import BzComentariosVeri from "./comentarios_verificacion.vue"
  var moment = require ('moment')
  var jsPDF = require ('jspdf')
  moment.locale('es')
  export default {
   components: { BzMaps, BzComentariosVeri },
    props: ["user"],
    data: () => ({
      moment: moment,
      fechaActual: moment().format('DD-MM-YYYY'),
      search: '',
      menu: false,
      date: null,
      veri: false,
      comentarios: '',
      ventanaComentarios: false,
      dialog: false,
      selected: 0,
      columns : [
        {title: 'ZONA', dataKey: 'zona'}, 
        {title: 'PUNTO', dataKey: 'punto'}, 
        {title: 'HORA', dataKey: 'hora'}, 
        {title:'LATITUD', dataKey: 'latitud'},
        {title: 'LONGITUD', dataKey: 'longitud'}, 
        ],

      headers: [
        {
          text: 'Zona',
          align: 'left',
          sortable: false,
          value: 'name'
        },
        { text: 'Punto', 
        value: 'name', 
        sortable: false, 
        align: 'left', 
        }
        ,
        { text: 'Hora', 
        value: 'hora', 
        sortable: true, 
        align: 'left', 
        }
      ],
      verificaciones: [],
      editedIndex: -1
    }),

    computed: {
      fecha: function (){
        if (!this.date){
          return this.fechaActual
        }
        else{
          return moment(this.date).format('DD-MM-YYYY')
        }
      }
    },

    created () {
      this.initialize()
    },

    watch: { 
      user: function(newVal, oldVal) { 
        this.initialize()
      }
    },

    methods: {
      initialize () {
        this.$axios.get('/watchers/'+this.user.id+'/verifications/'+moment(this.fecha,'DD-MM-YYYY').format('YYYY-MM-DD'))
        .then(resp => {
          if(resp.status === 200){
            this.verificaciones = resp.data.verifications
            this.veri = true
          }
          else{
              alert('No hay recorridos en esta fecha')
          }
        })
        .catch(e => {
          this.verificaciones = []
          this.veri = false
          alert('No hay recorridos en esta fecha')
          console.log(e)
        }) 
      },
      pdf(){
        var doc = new jsPDF()
        doc.text(this.user.worker.first_name +" - "+moment().format('DD/MM/YYYY'), 15, 30)
        const file = 'Ronda-'+this.user.worker.first_name +"-"+moment().format('DD/MM/YYYY')+'.pdf'
        let tabla = []
        this.verificaciones.forEach(verificacion => {
          tabla.push({'zona':verificacion.point.zones.name, 
          'punto': verificacion.point.name, 
          'hora': moment(verificacion.date).format('HH:mm'), 
          'latitud': verificacion.latitude,
          'longitud': verificacion.longitude})
        });
        doc.autoTable(this.columns, tabla, {margin: {top: 40}})
        doc.save(file)
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
