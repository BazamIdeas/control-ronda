<template>
  <v-container grid-list-md >
  <v-layout row wrap>
    <v-flex xs8 class="white" offset-xs2>
      <v-card>
        <v-toolbar color="grey" dark>
          <v-toolbar-side-icon></v-toolbar-side-icon>
          <v-toolbar-title>Reporte anual de asistencia - {{ empleado.first_name }} {{ empleado.last_name }}</v-toolbar-title>
          <v-spacer></v-spacer>
          <v-chip @click="excel()" small>
            <v-avatar>
              <v-icon>arrow_downward</v-icon>
            </v-avatar>
            Excel
          </v-chip>
          <v-chip @click="pdf()" small>
            <v-avatar>
              <v-icon>arrow_downward</v-icon>
            </v-avatar>
            Pdf
          </v-chip>
        </v-toolbar>        
        <v-data-table
          :headers="headers"
          :items="assistances"
          hide-actions
          class="elevation-1"
        >
          <template slot="items" slot-scope="props">
            <td ><v-chip @click="getReport(props.item)" small>{{ props.item.mes }} </v-chip></td>
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
    <v-dialog v-model="ventana" fullscreen hide-overlay transition="dialog-bottom-transition">
      <v-card>
        <v-toolbar >
          <v-spacer></v-spacer>
          <v-toolbar-items>
            <v-btn  flat @click.native="ventana = false">Cerrar</v-btn>
          </v-toolbar-items>
        </v-toolbar>
        <bz-report v-if= "employeesReport" v-bind:empleado="employeesReport" v-bind:mes_numero="mes_numero"> </bz-report>
      </v-card>
    </v-dialog>
  </v-layout>
  </v-container>
</template>


<script>
import BzReport from "./report.vue"
  let meses= new Array ("Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre");
  let d= new Date()
  var moment = require ('moment')
  var jsPDF = require ('jspdf')
  var fileSaver = require ('file-saver')
  var xlsx = require ('xlsx')
  require('jspdf-autotable');
  moment.locale('es')
  export default {
    components: {BzReport},
    props: ['empleado'],
    data: () => ({
      moment: moment,
      anio: d.getFullYear(),
      ventana: false,
      mes_numero : 0,
      employeesReport: 0,
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
               m.mes_numero = mes
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

      getReport(item){
        this.mes_numero = item.mes_numero
        this.employeesReport = this.empleado
        this.ventana = true
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
        doc.text('Reporte Anual', 15, 20)
        doc.setFontSize(12)
        doc.text('Año: '+this.anio+" | Empleado: "+this.empleado.first_name, 15, 25)
        const file = 'Reporte Anual: '+this.empleado.first_name +"-"+this.anio+'.pdf'
        doc.autoTable(this.columns, this.assistances, {margin: {top: 35}})
        doc.save(file)
      },

      excel(){
        var wb = xlsx.utils.book_new()
        wb.Props = {
          Title: "Reporte anual",
        }
        wb.SheetNames.push("Informe")
        var ws_data = [['Reporte Anual'],['Año: '+this.anio,"Empleado: "+this.empleado.first_name],['MES','ASISTENCIA','HORAS ADICIONALES','VALOR HORA EXTRA','PAGO ADCIONAL','FESTIVOS','TOTAL DIAS']]
        this.assistances.forEach(fila => {
          ws_data.push([fila.mes,fila.dias,fila.horas_extras,fila.precio_hora,fila.total,fila.feriados,fila.total_dias])
        })
        var ws = xlsx.utils.aoa_to_sheet(ws_data)
        wb.Sheets["Informe"] = ws
        var wbout = xlsx.write(wb, {bookType:'xlsx',  type: 'binary'})
        function s2ab(s) {
          var buf = new ArrayBuffer(s.length)
          var view = new Uint8Array(buf)
          for (var i=0; i<s.length; i++) view[i] = s.charCodeAt(i) & 0xFF
          return buf
        }
        const file = 'Reporte Anual: '+this.empleado.first_name +"-"+this.anio+'.xlsx'
        saveAs(new Blob([s2ab(wbout)],{type:"application/octet-stream"}), file);
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
