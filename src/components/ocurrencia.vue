<template>
<v-container grid-list-md >
  <v-layout row wrap >
    <v-flex xs6>
      <v-layout row wrap >
        <v-flex xs5>
          <v-text-field label="Fecha" readonly box :value= 'moment(ocurrencia.checks.date).format("DD/MM/YYYY")'></v-text-field>
        </v-flex>
        <v-flex xs5>
          <v-text-field label="Hora" readonly box :value= 'moment(ocurrencia.checks.date).format("HH:mm")'></v-text-field>
        </v-flex>
        <v-flex xs2>
          <v-chip @click="pdf()" >
            <v-avatar>
              <v-icon>arrow_downward</v-icon>
            </v-avatar>
              Pdf
          </v-chip>
        </v-flex>
        <v-flex xs12>
          <v-text-field label="Trabajador" readonly box :value= 'ocurrencia.checks.workers.first_name'></v-text-field>
        </v-flex>
        <v-flex xs12>
          <v-text-field label="Items" readonly box :value= 'ocurrencia.objects.name'></v-text-field>
        </v-flex>
        <v-flex xs12>
          <v-textarea label="Comentario" readonly box :value= 'ocurrencia.comment'></v-textarea>
        </v-flex>
      </v-layout>
    </v-flex>
    <v-flex xs6 tex-align-center>
      <img v-if="ocurrencia.image_uuid" :src = getImage(ocurrencia.image_uuid) class="img-comment" >
    </v-flex>
  </v-layout>
</v-container>
</template>

<script>
  const moment = require ('moment')
  const image2base64 = require('image-to-base64')
  const jsPDF = require ('jspdf')
  moment.locale('es')
export default {
    props: ['ocurrencia'],
    data: () => ({
      moment: moment,
      comentarios: [],
    }),

    computed: {
      idSupervisor (){
        return this.$store.state.admin.id
      },
    },

    watch: {
      ocurrencia: function(newVal, oldVal) { 
        this.initialize()
      }

    },
    created () {
      this.initialize()
    },

    methods: {
      initialize () {    
        if(this.ocurrencia.supervisor_comment)    
          this.nota = this.ocurrencia.supervisor_comment
      },
    
    getImage (uid) { return this.$store.state.conf.api+'/occurrences/attachment/'+uid },

    async pdf(){

      let fechaReporte = moment(this.ocurrencia.checks.date).format("DD/MM/YYYY")
      var doc = new jsPDF()
      doc.text('Sistema de control de ronda - Reporte de incidencia', 15, 20)
      doc.setFontSize(12)
      doc.text("Empresa: "+this.$store.state.admin.condos.name, 15, 25)
      doc.text("Empleado: "+ this.ocurrencia.checks.workers.first_name, 15, 30)
      
      doc.text("Fecha: "+  moment(this.ocurrencia.checks.date).format("DD/MM/YYYY"), 15, 50)
      doc.text("Hora: "+ moment(this.ocurrencia.checks.date).format("HH:mm"), 15, 55)
      doc.text("Item: "+ this.ocurrencia.objects.name, 15, 60)
      doc.text("Comentario: "+ this.ocurrencia.comment, 15, 65)
      
      let imagen = await image2base64(this.$store.state.conf.api+'/occurrences/attachment/'+this.ocurrencia.image_uuid)
      if (imagen){
        let img = 'data:image/png;base64,'+imagen
        doc.line(15, 40, 120, 40)
        doc.addImage(img, 'PNG', 15, 90)
      }

      const file = 'Reporte de incidencia -'+ fechaReporte +'.pdf'

      doc.save(file)
    },
  }
}
</script>
<style>

li {
  list-style: none;
  max-width: 90%;
  display: flex;
  
}
.commentRight{
flex-direction: row-reverse;
}

.commentRight div {
 background: #90cbfa;
}

.nombre {
  font-size: 7pt;
}

.comentario {
  background: #d6d6d6;
  border-radius: 17px;
  padding: 10px;
  MARGIN-BOTTOM: 15px;
}

.caja{
  max-height: 400px;
    OVERFLOW-Y: auto;
}

ul {
  width: 100%
}

.img-comment{
  max-width: 400px;
}
</style>

