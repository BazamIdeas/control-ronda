<template>
<v-container grid-list-md >
  <v-layout row wrap >
    <v-flex xs4>
        <v-text-field label="Zona" readonly box :value= 'verificacion.point.zones.name'></v-text-field>
    </v-flex>
    <v-flex xs4>
        <v-text-field label="Punto de control" readonly box :value= 'verificacion.point.name'></v-text-field>
     </v-flex>
    <v-flex xs4>
        <v-text-field label="Hora de escaneo" readonly box :value= "moment(verificacion.date).format('HH:mm')"></v-text-field>
    </v-flex>
    <v-flex xs6>
      <v-flex xs12>
        <v-textarea
        readonly
          box
          label="Comentario"
          :value="verificacion.watcher_comment"
        ></v-textarea>
      </v-flex>
       <v-flex xs12>
        <img v-if="verificacion.image_uuid" :src = getImage(verificacion.image_uuid) class="img-comment" >
       </v-flex>
    </v-flex>
    <v-flex xs6>
      <v-flex xs12>
        <v-textarea
           readonly
            box
            label="Nota del supervisor"
            v-model="nota"
          ></v-textarea>
      </v-flex>
      <v-flex xs10>
          <v-text-field
            v-model="mensaje"
            label="Mensaje"
            type="text"
          ></v-text-field>
        </v-flex>
        <v-flex xs1 v-if="mensaje">
          <v-btn  dark @click="setNota()">Guardar</v-btn>
        </v-flex>
    </v-flex>

  </v-layout>
</v-container>
</template>

<script>
  var moment = require ('moment')
    moment.locale('es')
export default {
    props: ['verificacion'],
    data: () => ({
      moment: moment,
      comentarios: [],
      nota: '',
      mensaje: ''
    }),

    computed: {
      idSupervisor (){
        return this.$store.state.admin.id
      },
    },

    watch: {
      verificacion: function(newVal, oldVal) { 
        this.initialize()
      }

    },
    created () {
      this.initialize()
    },

    methods: {
      initialize () {    
        if(this.verificacion.supervisor_comment)    
          this.nota = this.verificacion.supervisor_comment
      },

      setNota(){
        this.$axios.put('/verifications/'+this.verificacion.id+'/comment/', {
            supervisor_comment : this.mensaje,
          })
          .then(resp => {
            if(resp.status === 200){
              this.nota = this.mensaje
              this.mensaje = ''
            }
          })
          .catch(e => {
            console.log(e)
          })
      },

      isSupervisor(id) {
        if (id === this.idSupervisor)
          return true
        else
          return false
      },
    
    getImage (uid) { return this.$store.state.conf.api+'/verifications/image/'+uid },
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

