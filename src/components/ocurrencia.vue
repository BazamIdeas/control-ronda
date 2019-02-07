<template>
<v-container grid-list-md >
  <v-layout row wrap >
    <v-flex xs4>
        <v-text-field label="Items" readonly box :value= 'ocurrencia.objects.name'></v-text-field>
    </v-flex>
    <v-flex xs8>
        <v-text-field label="Comentario" readonly box :value= 'ocurrencia.comment'></v-text-field>
     </v-flex>
    <v-flex xs6>
        <img v-if="ocurrencia.image_uuid" :src = getImage(ocurrencia.image_uuid) class="img-comment" >
    </v-flex>

  </v-layout>
</v-container>
</template>

<script>
  var moment = require ('moment')
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

