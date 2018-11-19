<template>
  <v-container grid-list-md >
  <v-layout row wrap>
    <v-flex xs8 class="white" offset-xs2>
      <v-card>
        <v-toolbar color="blue lighten-1" dark>
          <v-toolbar-side-icon></v-toolbar-side-icon>
          <v-toolbar-title>Reporte anual - {{ empleado.first_name }} {{ empleado.last_name }}</v-toolbar-title>
          <v-spacer></v-spacer>
          <v-btn icon>
          <v-icon @click="pdf()">play_for_work</v-icon>
        </v-btn>
        </v-toolbar>        
        <v-data-table
          :headers="headers"
          :items="assistances"
          rows-per-page-text= "Número de Filas"
          class="elevation-1"
        >
          <template slot="items" slot-scope="props">
            <td >{{ props.item.mes }} </td>
            <td >{{ props.item.dias}} </td>
            <td >{{ props.item.horas_extras }} </td>
            <td >{{ priceHour }} </td>
            <td >{{ props.item.total }} </td>
            <td >{{ props.item.holidays }} </td>
            <td >{{ props.item.total_dias }} </td>
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
  var moment = require ('moment')
  var jsPDF = require ('jspdf')
  require('jspdf-autotable');
  moment.locale('es')
  export default {
    props: ['empleado'],
    data: () => ({
      moment: moment,
      anio: d.getFullYear(),

      headers: [
        {
          text: 'Mes',
          value: 'mes',
          sortable: false,

        },
        {
          text: 'Asistencia',
          value: 'asistencia',
          sortable: false,

        },
        {
          text: 'Horas adicionales',
          value: 'horas',
          sortable: false,

        },
        { 
          text: 'Valor hora Extra', 
          value: 'status', 
          sortable: false,

        },
        { 
          text: 'Pago adicional', 
          value: 'name', 
          sortable: false,

        },
        { 
          text: 'Festivos', 
          value: 'name', 
          sortable: false,

        },
        { 
          text: 'Total dias', 
          value: 'name', 
          sortable: false,

        }
      ],
      assistances: [],
      columns : [
        {title: 'MES', dataKey: 'mes'}, 
        {title: 'DIAS', dataKey: 'dias'}, 
        {title: 'HORAS EXTRAS', dataKey: 'horas_extras'}, 
        {title:'VALOR HORA EXTRA', dataKey: 'precio_hora'},
        {title: 'PAGO ADICIONAL', dataKey: 'total'}, 
        {title: 'FERIADOS', dataKey:'feriados'}, 
        {title:'TOTAL DIAS', dataKey: 'total_dias'}
        ],
    }),

    watch: { 
      empleado: function(newVal, oldVal) { 
        this.initialize(this.anio)
      }
    },

    computed: {
      priceHour: function () {
        let vh= parseFloat(this.$store.state.sesion.hour_value)
        let percent= parseFloat(this.$store.state.sesion.extra_hour_increase)
        return parseFloat(( vh * (percent / 100)) + vh)
      }
    },

    created () {
      this.initialize(this.anio)
    },

    methods: {
      initialize (y) {
        this.$axios.get('/workers/'+this.empleado.id+'/data/'+y)
        .then(resp => {
          if(resp.status === 200){
            let mesesA = []           
            // Obteniendo todas las claves del JSON
             for (var mes in resp.data.year_data){
              let  m = resp.data.year_data[mes]
               m.mes = meses[mes - 1]
               m.dias = this.dias(m) 
               m.horas_extras = m.extra_worked_hours.toFixed(2)
               m.precio_hora = this.priceHour
               m.total = this.total(m)
               m.feriados= m.holidays
               m.total_dias = this.totalDias(m)
              mesesA.push(m)
            }
             this.assistances = mesesA
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
        this.download(this.anio)
      },

      total(item) {
        return (this.priceHour * item.extra_worked_hours).toFixed(2)
      },

      dias(item) {
        return Object.keys(item.days).length - item.holidays
      },

      totalDias(item) {
        return Object.keys(item.days).length
      },


      download(anio){
        this.$axios.get('/workers/'+this.empleado.id+'/data/'+anio+'/download')
        .then(resp => {
          if(resp.status === 200){
            let csvContent = "data:text/csv;charset=utf-8,"+resp.data
            const data = encodeURI(csvContent)
            const link = document.createElement("a")
            link.setAttribute("href", data)
            const file = 'Reporte Anual: '+this.empleado.first_name+' '+this.empleado.last_name+"-"+anio+'.csv'
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

      pdf(){
        var doc = new jsPDF('landscape')
        doc.text('Reporte Anual: '+this.empleado.first_name +"-"+this.anio, 15, 30)
        const file = 'Reporte Anual: '+this.empleado.first_name +"-"+this.anio+'.pdf'
        doc.autoTable(this.columns, this.assistances, {margin: {top: 40}})
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
