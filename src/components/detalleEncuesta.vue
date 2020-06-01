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
        <v-text-field  readonly box :value= 'formatPrice(detalleEncuesta.price)' valor_hora prefix="$"></v-text-field>
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
        <span @click="deleteItem(item)">x</span>
            <v-avatar color="indigo" tile @click="download(item)">
            <v-icon dark>play_for_work</v-icon>
            </v-avatar>
          </div>

        </v-layout>
      <v-divider></v-divider>
      </v-flex>
      <v-flex xs12 text-xs-center>
        <input type="file" id="file" ref="file" v-on:change="handleFileUpload()"/>
        <v-btn color="primary" small v-on:click="enviar()" v-if="file">Cargar</v-btn>
        <v-progress-circular v-if = "cargando"
      indeterminate
      color="primary"
    ></v-progress-circular>
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
            <v-chip v-if="!detalleEncuesta.committee_only" @click="pdf()" small>
            <v-avatar>
              <v-icon>arrow_downward</v-icon>
            </v-avatar>
            Pdf
          </v-chip>
          </v-flex>
        </v-layout>
      </v-flex>
      <v-layout row wrap v-if="!detalleEncuesta.committee_only">

        <v-flex xs12 text-xs-center pl-1 pr-1 mt-3>
          <v-card>
          <h3 mb-2>Gráfico según alícuota (%)</h3>
          <ve-pie :data="chartData" :settings="chartSettings"></ve-pie>
          </v-card>
        </v-flex>



        <v-flex xs12 mt-4 v-if="!comite">
          <h3 >Tabla resumen</h3>

          <table class="tabla">
            <thead>
              <tr class="encabezado">
                <th></th>
                <th>SI</th>
                <th>NO</th>
                <th>Total</th>
              </tr>
            </thead>
          <tbody>
            <tr><td>Total votos</td>
              <td>{{si}}</td>
              <td>{{no}}</td>
              <td>{{si + no}}</td>
            </tr>
            <tr><td>Total alícuota</td>
            <td>{{ parseFloat(alicuotaSi).toFixed(2)}}%</td>
            <td>{{parseFloat(alicuotaNo).toFixed(2)}}%</td>
            <td>{{totalAlicuota}}%</td>
            </tr>
          </tbody>
        </table>
          <h3 style="margin-top: 20px;">Votantes</h3>
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
            <td >{{ props.item.residents.percentage }}%</td>
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

            <td >{{ moment(props.item.created_at).format("DD-MM-YYYY") }}</td>
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
  var jsPDF = require ('jspdf')
  var moment = require ('moment')
  moment.locale('es')
  export default {
    components: {VePie},
    props: ['detalleEncuesta'],
    data: () => ({
      moment: moment,
      search: '',
      file: '',
      cargando: false,
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
          text: 'Alícuota',
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
            text: 'Fecha',
            isDescending: true,
            value: 'created_at'
          },
          {
            text: 'Nombre',
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

      columns : [
        {title: 'NOMBRE', dataKey: 'nombre'},
        {title: 'RUT', dataKey: 'rut'},
        {title: 'ALÍCUOTA', dataKey: 'alicuota'},
        {title:'DEPARTAMENTO', dataKey: 'departamento'},
        {title: 'VOTO', dataKey: 'voto'},
        {title: 'COMENTARIO', dataKey:'comentario'}
        ],

      resumen : [
        {title: 'TABLA RESUMEN', dataKey: 'titulo'},
        {title: 'SI', dataKey: 'si'},
        {title: 'NO', dataKey: 'no'},
        {title: 'TOTAL', dataKey: 'total'},
      ],

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
              //console.log(residents)
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

      formatPrice(value) {
        let val = (value/1).toFixed(2).replace('.', ',')
        return val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")
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

    pdf(){
        var doc = new jsPDF()
        doc.text(this.$store.state.admin.condos.name, 15, 20)
        doc.setFontSize(12)
        doc.text('Informe de encuesta', 15, 25)
        doc.text('Pregunta: '+this.detalleEncuesta.label, 15, 30)
        const file = 'Detalle de encuesta: '+this.$store.state.admin.condos.name +'.pdf'
        let votos = this.votos.map( voto => {
          let votacion = voto.accepted ? 'SI' : 'NO'
          let v = {
            'nombre': voto.residents.name,
            'rut' : voto.residents.rut,
            'alicuota' : voto.residents.percentage+"%",
            'departamento' : voto.residents.departament,
            'voto' : votacion,
            'comentario' : voto.comment
          }
          return v
        })



        let resumen = [
          { titulo: 'Total votos', si : this.si, no : this.no, total : this.si + this.no},
          { titulo: 'Total alícuota', si : parseFloat(this.alicuotaSi).toFixed(2)+ "%" , no : parseFloat(this.alicuotaNo).toFixed(2)+ "%" , total : parseFloat( this.alicuotaSi + this.alicuotaNo).toFixed(2)+ "%"}
        ]
        doc.autoTable(this.resumen, resumen, {margin: {top: 40}})
        doc.text('Votantes', 15, 70)
        doc.autoTable(this.columns, votos, {margin: {top: 75}})
        doc.save(file)
      },

      deleteItem (item) {
        this.$axios.delete('/questions-attachments/'+item.id+'?trash=true')
          .then(resp => {
            if(resp.status === 200){
              const index = this.detalleEncuesta.attachments.indexOf(item)
              this.detalleEncuesta.attachments.splice(index, 1)
            }
          })
          .catch(e => {
            console.log(e)
          })
      },

      enviar(){
        this.cargando = true
        let formData = new FormData()
        formData.append('question_id', this.detalleEncuesta.id)
        formData.append('files', this.file)
        fetch(this.$store.state.conf.api+'/questions-attachments/', {
          method: 'POST',
          body: formData,
          headers: { "Authorization": "Bearer " + localStorage.getItem('bazam-token-control')}
        })
        .then(resp => {

            if(resp.status === 201){
              return resp.json();
            }
          })
        .then(resp => {
          if (!this.detalleEncuesta.attachments){
            this.detalleEncuesta.attachments = []
          }
          this.cargando = false
          this.detalleEncuesta.attachments.push(resp)
          this.file = null
          this.$refs.file.value = '';
          alert("Archivo cargado")
        })
        .catch(e => {
          console.log(e)
        })
      },
    },

    computed: {
      totalAlicuota(){
        return parseFloat(this.alicuotaNo + this.alicuotaSi).toFixed(2)
      },
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
  width: 50%;
  border: solid 2px #d3c9c9;
  font-size: 16px;
}

.encabezado{
  background: #a9d0e2;
    text-align: center;
    font-weight: 900;
}

.tabla tr td {
  text-align: center;
}

</style>

