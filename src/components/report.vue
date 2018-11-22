<template>
  <v-container grid-list-md >
  <v-layout row wrap>
    <v-flex xs8 class="white" offset-xs2>
      <v-card>
        <v-toolbar color="blue lighten-1" dark>
          <v-toolbar-side-icon></v-toolbar-side-icon>
          <v-toolbar-title>Reporte mensual - {{ empleado.first_name }} {{ empleado.last_name }}</v-toolbar-title>
          <v-spacer></v-spacer>
          <v-btn icon>
          <v-icon @click="pdf()">play_for_work</v-icon>
        </v-btn>
        </v-toolbar>
        <v-container grid-list-md >
        <v-layout row wrap>
          <v-flex xs12 sm6 md2>
            <v-text-field label="Horas Jornada" v-model= jornada readonly> </v-text-field>
          </v-flex>
          <v-flex xs12 sm6 md2>
            <v-text-field label="Valor Hora" v-model= valor_hora prefix="$"> </v-text-field>
          </v-flex>
          <v-flex xs12 sm6 md2>
            <v-text-field label="%  Hora extra" v-model= porcentaje prefix="%"> </v-text-field>
          </v-flex>
          <v-flex xs12 sm6 md2>
            <v-text-field label="Tiempo extra" v-model= priceHour prefix="$" readonly></v-text-field>
          </v-flex>
          <v-flex xs12 sm6 md2>
            <v-text-field label="Pagar adicional" v-model= mountHour readonly prefix="$" color="success" ></v-text-field>
          </v-flex>
          <v-flex xs12 sm6 md2>
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
        </v-layout>
        </v-container>
        <v-data-table
          :headers="headers"
          :items="assistances"
          hide-actions
          class="elevation-1"
        >
          <template slot="items" slot-scope="props">
            <td >{{ props.item.day }} </td>
            <td >{{ moment(props.item.entry.date).format('HH:mm') }} </td>
            <td >{{ inicio_colacion(props.item) }} </td>
             <td >{{ final_colacion(props.item) }} </td>
            <td >{{ moment(props.item.exit.date).format('HH:mm') }} </td>
            <td >{{ parseFloat(props.item.total_worked_hours).toFixed(2) }} </td>
            <td >{{ diferencial(props.item.total_worked_hours) }} </td>
            <td ><v-icon v-if= props.item.is_holiday large color="green darken-2">done</v-icon> </td>
          </template>
          <template slot="no-data">
            <v-btn color="primary" @click="initialize">Recargar</v-btn>
          </template>
        </v-data-table>
      </v-card>
    </v-flex>
  </v-layout>
  </v-container>
</template>


<script>
  let meses= new Array ("Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre");
  let d= new Date()
  let m= d.getMonth()
  var moment = require ('moment')
  moment.locale('es')
    var jsPDF = require ('jspdf')
  require('jspdf-autotable');
  export default {
    props: ['empleado'],
    data: () => ({
      moment: moment,
      menu: false,
      date: null,
      dialog: false,
      dateNew: null,
      jornada: null,
      valor_hora: null,
      porcentaje: null,
      total_horas_extras: 0,
      mesN: moment(d).format('MM'),
      anio: moment(d).format('YYYY'),

      headers: [
        {
          text: 'Dia',
          value: 'first_name',

        },
        {
          text: 'Entrada',
          value: 'last_name',

        },
        { 
          text: 'Inicio Colación', 
          value: 'status', 

        },
        { 
          text: 'Termino Colación', 
          value: 'name', 

        },
        { 
          text: 'Salida', 
          value: 'name', 

        },
        { 
          text: 'Hrs Trabajadas', 
          value: 'name', 

        },
        { 
          text: 'Diferencial', 
          value: 'name', 

        },
        { 
          text: 'Festivo', 
          value: 'name', 
        }
      ],
      columns : [
        {title: 'DIA', dataKey: 'dia'}, 
        {title: 'ENTRADA', dataKey: 'entrada'}, 
        {title: 'INICIO COLACION', dataKey: 'inicio_colacion'}, 
        {title:'TERMINO COLACION', dataKey: 'final_colacion'},
        {title: 'SALIDA', dataKey: 'salida'}, 
        {title: 'HORAS', dataKey:'horas'}, 
        {title:'DIFERENCIAL', dataKey: 'diferencial'},
        {title:'FESTIVO', dataKey: 'festivo'}
        ],
      assistances: [],
    }),

    watch: { 
      empleado: function(newVal, oldVal) { 
        this.date = null
        this.initialize(this.mesN,this.anio)
      }
    },

    computed: {

      priceHour: function () {
        let vh= parseFloat(this.valor_hora)
        let percent= parseFloat(this.porcentaje)
        return parseFloat(( vh * (percent / 100)) + vh)
      },

      mountHour: function () {
        let priceHour= parseFloat(this.priceHour)
        return (parseFloat(this.total_horas_extras) * parseFloat(priceHour)).toFixed(2) 
      },
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

    created () {
      this.initialize(this.mesN,this.anio)
    },

    methods: {
      initialize (m,y) {
        console.log(m)
        this.$axios.get('/workers/'+this.empleado.id+'/data/'+y+'/'+m)
        .then(resp => {
          if(resp.status === 200){
            let dias = []
            this.total_horas_extras = 0
            
            // Obteniendo todas las claves del JSON
            for (var dia in resp.data.month_data.days){
              dias.push(resp.data.month_data.days[dia])
              this.total_horas_extras += resp.data.month_data.days[dia].extra_worked_hours
            }
            this.assistances = dias
            this.jornada =  parseFloat(this.$store.state.sesion.working_hours)
            this.valor_hora =  parseFloat(this.$store.state.sesion.hour_value)
            this.porcentaje =  parseFloat(this.$store.state.sesion.extra_hour_increase)
          }
          else{
              alert('No hay reportes para esta fecha')
          }
        })
        .catch(e => {
          this.assistances = []
          alert('No hay reportes para esta fecha')
          console.log(e)
        }) 
      },

      printElem() {
        if (!this.date){
          let mes = this.mesN
          let anio = this.anio
          this.download(anio, mes)
        }
        else{
          let dateNew = this.date.split("-")
          let mes = dateNew[1]
          let anio = dateNew[0]
          this.download(anio, mes)
        }
      },

      download(anio, mes){
        this.$axios.get('/workers/'+this.empleado.id+'/data/'+anio+'/'+mes+'/download')
        .then(resp => {
          if(resp.status === 200){
            let csvContent = "data:text/csv;charset=utf-8,"+resp.data
            const data = encodeURI(csvContent)
            const link = document.createElement("a")
            link.setAttribute("href", data)
            const file = 'Reporte Mensual: '+this.empleado.first_name+' '+this.empleado.last_name+"-"+meses[parseInt(mes)-1]+'/'+anio+'.csv'
            link.setAttribute("download", file)
            link.click()
          }
          else{
              alert('No hay reportes para esta fecha')
          }
        })
        .catch(e => {
          alert('No hay reportes para esta fecha')
          console.log(e)
        }) 
      },

      inicio_colacion(item){
        if (item.hasOwnProperty('break')){ 
          return moment(item.break.date).format('HH:mm')
        }else{
          return '-'
        }
      },
      final_colacion(item){
        if (item.hasOwnProperty('finish_break')){ 
          return moment(item.finish_break.date).format('HH:mm')
        }else{
          return '-'
        }
      },
      diferencial(horas){
        return (parseFloat(horas) - parseFloat(this.$store.state.sesion.working_hours)).toFixed(2) 
      },

      pdf(){
        var doc = new jsPDF('landscape')
        doc.text('Reporte Mensual: '+this.empleado.first_name +"-"+this.mes+"-"+this.anio, 15, 30)
        const file = 'Reporte Mensual: '+this.empleado.first_name +"-"+this.mes+"-"+this.anio+'.pdf'
        let tabla = []
        let festivo = 'NO'
        this.assistances.forEach(asistencia => {
          if (asistencia.is_holiday)
            festivo = 'SI'
          tabla.push({
            'dia': asistencia.day,
            'entrada' : moment(asistencia.entry.date).format('HH:mm'),
            'inicio_colacion' : moment(asistencia.break.date).format('HH:mm'),
            'final_colacion' : moment(asistencia.finish_break.date).format('HH:mm'),
            'salida' : moment(asistencia.exit.date).format('HH:mm'),
            'horas': parseFloat(asistencia.total_worked_hours).toFixed(2) ,
            'diferencial': parseFloat(asistencia.extra_worked_hours).toFixed(2) ,
            'festivo' : festivo
          })
        });
        doc.autoTable(this.columns, tabla, {margin: {top: 40}})
        doc.save(file)
      }
    }
  }
</script>

<style>
.actived{
  background: #f7f0b2;
}
.img{
  width: 100%;
}

table.v-table tbody td:first-child, table.v-table tbody td:not(:first-child), table.v-table tbody th:first-child, table.v-table tbody th:not(:first-child), table.v-table thead td:first-child, table.v-table thead td:not(:first-child), table.v-table thead th:first-child, table.v-table thead th:not(:first-child) {
    padding: 0 8px !important;
}

</style>
