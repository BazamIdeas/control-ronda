<template>
  <v-container grid-list-md >
    <v-layout row wrap>
        <v-flex xs4 text-xs-center>
          <img  height= "300" v-if="usuario.worker.image_uuid" :src = getImage(usuario.worker.image_uuid) >  <br>
          <v-chip @click="pdf()" >
            <v-avatar>
              <v-icon>arrow_downward</v-icon>
            </v-avatar>
            Descargar en PDF
          </v-chip>
        </v-flex>
        <v-flex xs8>
        <v-card>
          <v-container grid-list-md>
          <v-layout row wrap>
            <v-flex xs12 mt-3>
              <div class="display-1 font-weight-black">{{usuario.worker.first_name}}</div>
              <v-divider></v-divider>
              <v-layout row wrap>
                <v-flex xs6 mt-1>
                  <v-text-field label="Usuario" box readonly :value= usuario.username></v-text-field>
                </v-flex>
                <v-flex xs6 mt-1>
                  <v-text-field label="Email" box readonly :value= usuario.worker.email></v-text-field>
                </v-flex>
                <v-flex xs6 >
                  <v-text-field label="Teléfono" box readonly :value= usuario.phone></v-text-field>
                </v-flex>
                <v-flex xs6 >
                  <v-text-field label="RUT" box readonly :value= usuario.worker.rut></v-text-field>
                </v-flex>
                <v-flex xs6 >
                  <v-text-field label="Dirección" box readonly :value= usuario.worker.address></v-text-field>
                </v-flex>
                <v-flex xs6 >
                  <v-text-field label="Comuna" box readonly :value= usuario.worker.community></v-text-field>
                </v-flex>
                <v-flex xs6 >
                  <v-text-field label="Ciudad" box readonly :value= usuario.worker.city></v-text-field>
                </v-flex>
                <v-flex xs6 >
                  <v-text-field label="Pais" box readonly :value= usuario.worker.country></v-text-field>
                </v-flex>
              </v-layout>
            </v-flex>
          </v-layout>
          </v-container>
        </v-card>
        </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
const jsPDF = require ('jspdf')
const image2base64 = require('image-to-base64')

export default {
  props: ['usuario'],
  data: () => ({
    api: 'http://api.cs100.cl/v1'
  }),

  methods: {
    getImage (uid) { return this.$store.state.conf.api+'/workers/face/'+uid },

    async pdf (){
        var doc = new jsPDF()
        doc.text('Sistema de control de ronda', 15, 20)
        doc.setFontSize(12)
        doc.text("Empresa: "+this.$store.state.admin.condos.name, 15, 25)
        doc.text("Empleado: "+ this.usuario.worker.first_name, 15, 30)
        //console.log(this.getImage(this.usuario.worker.image_uuid))
        let imagen = await image2base64(this.$store.state.conf.api+'/workers/face/'+this.usuario.worker.image_uuid)
        //console.log(imagen)
        var img = 'data:image/png;base64,'+imagen;
        doc.line(15, 40, 120, 40)
        doc.addImage(img, 'PNG', 130, 20)
        doc.text("Usuario: "+ this.usuario.username, 15, 50)
        doc.text("Email: "+ this.usuario.worker.email, 15, 55)
        doc.text("Teléfono: "+ this.usuario.worker.phone, 15, 60)
        doc.text("RUT: "+ this.usuario.worker.rut, 15, 65)
        doc.text("Dirección: "+ this.usuario.worker.address, 15, 70)
        doc.text("Comuna: "+ this.usuario.worker.community, 15, 75)
        doc.text("Ciudad: "+ this.usuario.worker.city, 15, 80)
        doc.text("Pais: "+ this.usuario.worker.country, 15, 85)

        const file = 'Ficha de usuario -'+this.usuario.worker.first_name +'.pdf'
        doc.save(file)
      },

  }
}
</script>
