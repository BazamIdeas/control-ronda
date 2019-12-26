<template>
<v-container grid-list-md >
  <v-layout row wrap>
    <v-flex xs4>
      <v-flex xs12>
            <v-text-field label="Tarea" readonly box v-model= 'nombreTarea'></v-text-field>
        </v-flex>
        <v-flex xs12>
            <v-text-field label="Fecha de asignación de la tarea" readonly box :value= 'moment(fechaTarea).format("DD-MM-YYYY")'></v-text-field>
        </v-flex>
        <v-flex xs12>
            <v-text-field label="Subtarea" readonly box v-model= 'subtarea.name'></v-text-field>
        </v-flex>
        <v-flex xs12>
            <v-text-field label="Fecha de asignación de la subtarea" readonly box :value= 'moment(subtarea.date).format("DD-MM-YYYY")'></v-text-field>
        </v-flex>
        <v-textarea box label="Descripción" v-model= subtarea.description readonly></v-textarea>
    </v-flex>
    <v-flex xs8>
      <v-toolbar color="indigo" dark>
        <v-toolbar-side-icon></v-toolbar-side-icon>
        <v-toolbar-title>Comentarios</v-toolbar-title>
        <v-spacer></v-spacer>
      </v-toolbar>

      <v-card>
        <v-container fluid grid-list-md class="caja">
          <v-layout row wrap>
            <ul>
              <li v-for="(comentario, index) in comentarios" :key="index" v-bind:class="{commentRight: isSupervisor(comentario.worker.id) }"> 
                <div class="comentario">
                  <img v-if="comentario.attachment" :src = getImage(comentario.attachment) class="img-comment" >  
                  <div>{{ comentario.description }}</div>
                  <div class="nombre">
                    {{comentario.worker.first_name}}
                  </div>
                </div>  
              </li>
            </ul>
          </v-layout>
        </v-container>
      </v-card>
      <v-layout row wrap>
       <v-flex xs10>
          <v-text-field
            v-model="mensaje"
            label="Mensaje"
            type="text"
          ></v-text-field>
        </v-flex>
        <v-flex xs1 v-if="mensaje">
          <v-btn  dark @click="enviar()">Enviar</v-btn>
        </v-flex>
      </v-layout>
    </v-flex>
  </v-layout>
</v-container>
</template>

<script>
var moment = require ('moment')
  moment.locale('es')
export default {
    props: ['subtarea'],
    data: () => ({
      moment: moment,
      comentarios: [],
      mensaje: '',
      nombreTarea: '',
      fechaTarea: ''
    }),

    computed: {
      idSupervisor (){
        return this.$store.state.admin.id
      },
    },

    watch: {

      subtarea: function(newVal, oldVal) { 
        this.initialize()
      },
      /* comentarios: function(newVal, oldVal) { 
        this.initialize()
      }, */
    },
    created () {
      this.initialize()
    },

    methods: {
      initialize () {
        this.$axios.get('/goals/'+this.subtarea.id)
        .then(resp => {
          if(resp.status === 200){
            this.nombreTarea = resp.data.task.name
            this.fechaTarea = resp.data.task.date
            this.comentarios = []
            if (resp.data.comments){
              this.comentarios = resp.data.comments
            }
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
    
    getImage (uid) { return this.$store.state.conf.api+'/goals-comments/attachment/'+uid },

    enviar(){
      let mensaje = {
        goal_id: this.subtarea.id,
        description: this.mensaje,
      }
      let formData = new FormData()
      formData.append('goal_id', this.subtarea.id)
      formData.append('description', this.mensaje)

      fetch(this.$store.state.conf.api+'/goals-comments/', {
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
        this.comentarios.push(resp)
        this.mensaje = ''
      })
      .catch(e => {
          console.log(e)
        })    
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

