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
      <v-flex xs12>
        <h3>ADJUNTOS</h3>
      </v-flex>
      <v-flex xs12>
        <v-layout>
          <div v-for='item in detalleEncuesta.attachments' :key="item.id" style="cursor:pointer; margin-right:10px; list-style: none;">
            <v-avatar color="indigo" tile @click="download(item)">
            <v-icon dark>play_for_work</v-icon>
            </v-avatar> 
          </div>
        </v-layout>
      <v-divider></v-divider>
      </v-flex>
      <v-flex xs12 text-xs-center>
        <input type="file" id="file" ref="file" v-on:change="handleFileUpload()"/>
        <v-btn color="primary" small v-on:click="enviar()" >Cargar</v-btn>
      </v-flex>
      </v-layout>
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
      
        <v-flex xs12 text-xs-center pl-1 pr-1 mt-3>
          <v-card>
          <h3 mb-2>Gráfico según alicuota (%)</h3>
          <ve-pie :data="chartData" :settings="chartSettings"></ve-pie>
          </v-card>
        </v-flex>
        
      

        <v-flex xs12 mt-4 v-if="!comite">
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
          <h3 mb-2>Gráfico según número de votantes del comité</h3>
          <ve-pie :data="chartData" :settings="chartSettingsN"></ve-pie>
        </v-card>
        
      </v-flex>
        <v-flex xs12 mt-4 v-if="!comite">
          <h3 style="margin-bottom: 20px;">VOTANTES</h3>
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
  var fileSaver = require ('file-saver')
  var moment = require ('moment')
  moment.locale('es')
  export default {
    components: {VePie},
    props: ['detalleEncuesta'],
    data: () => ({
      moment: moment,
      search: '',
      file: '',
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
         this.file = ''
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
        let ruta = '/residents/self'
        this.$axios.get(ruta)
        .then(resp => {
          if(resp.status === 200){
            //TODO ------- verificar aprobados
            this.residentes = resp.data.length
            if (this.detalleEncuesta.committee_only){
              let residents = resp.data.filter(residente => residente.committee)
              console.log(residents)
              this.residentes = residents.length
            }
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

      handleFileUpload(){
        this.file = this.$refs.file.files[0];
      },

    download (item) { 
      let data = this.$store.state.conf.api+'/questions-attachments/attachment/'+item.attachment_uuid 
      const link = document.createElement("a")
      link.setAttribute("href", data)
      link.setAttribute("target", '_blank')
      const file = 'Adjunto'
      link.setAttribute("download", file)
      link.click()
    },
    
      enviar(){
        let formData = new FormData()
        formData.append('question_id', this.detalleEncuesta.id)
        formData.append('files', this.file)

        fetch(this.$store.state.conf.api+'/questions-attachments/', {
          method: 'POST',
          body: formData,
          headers: { "Authorization": "Bearer " + localStorage.getItem('bazam-token-control')}
        })
        .then(function(resp) {
            if(resp.status === 201){
              return resp.json();
            }
          })
        .then(resp => {
          this.detalleEncuesta.attachments.push(resp)
          this.file = ''
        })
        .catch(e => {
          console.log(e)
        })    
      },
    },

    computed: {
      porcentaje (){
        return (this.si * 100)/this.total
      },
      comite () {
        return this.$store.state.comite
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

