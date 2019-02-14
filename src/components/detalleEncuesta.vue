<template>
<v-container grid-list-md >
  <v-layout row wrap>
    <v-flex xs4 >
      <h3>DATOS</h3>
      <v-divider></v-divider>
      <v-layout row wrap mt-2>
      <v-flex xs4>
        <v-text-field label="Fecha" readonly box :value= 'moment(detalleEncuesta.date).format("DD-MM-YYYY")'></v-text-field>
      </v-flex>
      <v-flex xs4>
        <v-text-field label="Expiracion" readonly box :value= 'moment(detalleEncuesta.date_end).format("DD-MM-YYYY")'></v-text-field>
      </v-flex>
      <v-flex xs4>
        <v-text-field label="Precio" readonly box :value= 'detalleEncuesta.price'></v-text-field>
      </v-flex>
      <v-flex xs12>
        <v-textarea
          box
          label="Descripción"
          :value= detalleEncuesta.description
          readonly
        ></v-textarea>
      </v-flex>
      </v-layout>
      <h3>ADJUNTOS</h3>
      <v-divider></v-divider>
    </v-flex >
    <v-flex xs8>
      <v-flex xs12>
        <v-layout>
          <v-flex xs9 text-xs-center>
            <h2 style="margin-bottom: 10px;">{{detalleEncuesta.label}}</h2>
          </v-flex>
          <v-flex xs3 text-xs-right>
            <v-icon v-if="detalleEncuesta.committee_only" >people</v-icon>
            <v-chip color="green" small text-color="white" v-if="detalleEncuesta.approved" >visible</v-chip>
          </v-flex>
        </v-layout>       
      </v-flex>
      <v-layout row wrap v-if="!detalleEncuesta.committee_only">
      
        <v-flex xs6 text-xs-center pl-1 pr-1 mt-3>
          <v-card>
          <h3 mb-2>Gráfico según alicuota (%)</h3>
          <ve-pie :data="chartData" :settings="chartSettings"></ve-pie>
          </v-card>
        </v-flex>
        
        <v-flex xs6 text-xs-center pl-1 pr-1 mt-3>
          <v-card>
          <h3 mb-2>Gráfico según número de residentes</h3>
          <ve-pie :data="chartData" :settings="chartSettingsN"></ve-pie>
           </v-card>
        </v-flex>
      
      <!-- <v-flex xs4>
        <table class="tabla">
          <tr class="encabezado">
           <td></td><td>n°</td><td>%</td>
          </tr>
          <tr>
            <td><v-chip color="deep-orange lighten-2" small ></v-chip>
               SI</td>
            <td text-xs-center>{{si}}</td>
            <td text-xs-center>{{alicuotaSi}}%</td>
          </tr>
          <tr>
            <td> <v-chip color="gray" small ></v-chip> NO</td>
            <td text-xs-center>{{no}}</td>
            <td text-xs-center>{{alicuotaNo}}%</td>
          </tr>
          <tr>
            <td>TOTAL</td>
            <td text-xs-center>{{no + si }}</td>
            <td text-xs-center>{{alicuotaNo + alicuotaSi}}%</td>
          </tr>
        </table>
      </v-flex> -->

        <v-flex xs12 mt-4>
          <h3 style="margin-bottom: 20px;">VOTANTES</h3>
          <v-divider></v-divider>
          <v-data-table
          :headers="headers"
          :items="votos"
          :search="search"
          rows-per-page-text= "Número de Filas"
          :pagination.sync="pagination"
          class="elevation-1"
        >
          <template slot="items" slot-scope="props">
            <td >{{ props.item.residents.name }}</td>
            <td >{{ props.item.residents.rut }}</td>
            <td >{{ props.item.residents.percentage }}</td>
            <td >{{ props.item.residents.departament }}</td>
            <td v-if="props.item.accepted"><v-chip color="green" small text-color="white">SI</v-chip></td>
             <td v-if="!props.item.accepted"><v-chip color="red" small text-color="white">NO</v-chip></td>
            <td >{{ props.item.comment }}</td>
          </template>
          <template slot="no-data">
            <h3>Aún no hay votantes</h3>
            <v-btn color="primary" @click="initialize">Recargar</v-btn>
          </template>
        </v-data-table>
        </v-flex>
      </v-layout>
      <v-layout row wrap v-if="detalleEncuesta.committee_only">
      <v-flex xs12 text-xs-center  mt-3>
        <v-card>
          <ve-pie :data="chartData" :settings="chartSettingsN"></ve-pie>
        </v-card>
        
      </v-flex>
        <v-flex xs12 mt-4>
          <h3 style="margin-bottom: 20px;">VOTANTES DEL COMITÉ</h3>
          <v-divider></v-divider>
          <v-data-table
          :headers="headersC"
          :items="votos"
          :search="search"
          rows-per-page-text= "Número de Filas"
          :pagination.sync="pagination"
          class="elevation-1"
        >
          <template slot="items" slot-scope="props">
            <td >{{ props.item.residents.name }}</td>
            <td v-if="props.item.accepted"><v-chip color="green" small text-color="white">SI</v-chip></td>
             <td v-if="!props.item.accepted"><v-chip color="red" small text-color="white">NO</v-chip></td>
            <td >{{ props.item.comment }}</td>
          </template>
          <template slot="no-data">
            <h3>Aún no hay votantes</h3>
            <v-btn color="primary" @click="initialize">Recargar</v-btn>
          </template>
        </v-data-table>
        </v-flex>
      </v-layout>
    </v-flex>
  </v-layout>
</v-container>
</template>


<script>
  import axios from '../axios.js'
  import VePie from 'v-charts/lib/pie.common'
  var moment = require ('moment')
  moment.locale('es')
  export default {
    components: {VePie},
    props: ['detalleEncuesta'],
    data: () => ({
      moment: moment,
      search: '',
      si: 0,
      no: 0,
      alicuotaSi: 0,
      alicuotaNo: 0,
      residentes: 0,
      total: 0,
      pagination: {descending: true},
      headers: [
        {
          text: 'Nombre',
          isDescending: true,
          value: 'residents.name'
        },
        {
          text: 'RUT',
          value: 'residents.rut'
        },
         {
          text: 'Alicuota',
          value: 'residents.percentage'
        },
        {
          text: 'Departamento',
          value: 'residents.departament'
        },
        {
          text: 'Voto',
          sortable: false,
          value: 'residents.acceptep'
        },
        {
          text: 'Comentario',
          sortable: false,
          value: 'comment'
        }],

        headersC: [
          {
            text: 'Nombre',
            isDescending: true,
            value: 'residents.name'
          },
          {
            text: 'Voto',
            sortable: false,
            value: 'residents.acceptep'
          },
          {
            text: 'Comentario',
            sortable: false,
            value: 'comment'
          }],
          
      votos: [],
      chartData: {
          columns: ['respuesta', 'numero', 'porcentaje'],
          rows: []
        },
      chartSettings : {
        metrics: 'porcentaje'
      },
      chartSettingsN : {
        metrics: 'numero'
      }
    }),


    watch: {
      dialog (val) {
        val || this.close()
      },
       detalleEncuesta: function(newVal, oldVal) { 
         this.no = 0
         this.si = 0
         this.alicuotaSi = 0
         this.alicuotaNo = 0
         this.votos = []
        this.initialize()
      }
    },

    created () {
      this.initialize()
    }, 

    methods: {
      initialize () {
        this.$axios.get('/residents/self')
        .then(resp => {
          if(resp.status === 200){
            //TODO ------- verificar aprobados
            this.residentes = resp.data.length
            if (this.detalleEncuesta.votes){
              this.votos = this.detalleEncuesta.votes
              this.votos.forEach(voto => {
                if (voto.accepted){
                  this.si += 1
                  this.alicuotaSi += voto.residents.percentage
                }
                else{
                  this.no += 1
                  this.alicuotaNo += voto.residents.percentage
                }
              })
              this.total = this.votos.length
              
              let calculo = [{'respuesta': 'SI', 'numero': this.si, 'porcentaje': this.alicuotaSi },
                {'respuesta': 'NO', 'numero': this.no, 'porcentaje': this.alicuotaNo },
                {'respuesta': 'SIN VOTAR', 'numero': this.residentes - this.no - this.si, 'porcentaje': 100 - this.alicuotaNo - this.alicuotaSi }]
                
              this.chartData.rows = calculo
            }
            else{
              let calculo = [
                {'respuesta': 'SI', 'numero': 0, 'porcentaje': 0 },
                {'respuesta': 'NO', 'numero': 0, 'porcentaje': 0 },
                {'respuesta': 'SIN VOTAR', 'numero': this.residentes, 'porcentaje': 100 }
              ]
              this.chartData.rows = calculo
            }
          }
        })
        .catch(e => {
          console.log(e)
        })  
      },
    },

    computed: {
      porcentaje (){
        return (this.si * 100)/this.total
      }
    }
  }
</script>

<style scope>
.tabla {
  width: 100%;
  border: solid 2px #d3c9c9;
  font-size: 16px;
}

.encabezado{
  background: #a9d0e2;
    text-align: center;
    font-weight: 900;
}

</style>

