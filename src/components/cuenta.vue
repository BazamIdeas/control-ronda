<template>
<v-container grid-list-md >
   <v-layout row wrap>
    <v-flex xs6 >
      <v-card>
        <v-container >
          <h2>{{nombre}}</h2>
          <v-layout row wrap>
            <v-flex xs8 >
              <v-text-field
                label="Cambiar contraseña"
                v-model="pass"
              ></v-text-field>
            </v-flex>
            <v-flex xs4>
            <v-btn color="success" @click="changePass()">Guardar</v-btn>
            </v-flex>
          </v-layout>
        </v-container>
      </v-card>
    </v-flex> 
  </v-layout>
  <v-layout row wrap>
    <v-flex xs3>
      <v-card>
        <v-container grid-list-md >
          <v-layout justify-space-around>
              <v-icon>calendar_today</v-icon><h3>Control de Asistencia</h3>
          </v-layout>
          <v-layout justify-space-around>
            <h4 class="estado">Estado: <span v-html=asistencia></span></h4>
          </v-layout>
          <v-layout justify-space-around>
           <h5 class="estado">Limites de trabajadores: {{usuarios}}</h5>
          </v-layout>
        </v-container>
      </v-card>
    </v-flex>
    <v-flex xs3>
      <v-card>
        <v-container grid-list-md >
          <v-layout justify-space-around>
              <v-icon>restore</v-icon><h3>Control de Rondas</h3>
          </v-layout>
          <v-layout justify-space-around>
           <h4 class="estado">Estado: <span v-html=ronda></span></h4>
          </v-layout>
          <v-layout justify-space-around>
           <h5 class="estado">Limite de zonas: {{zonas}}</h5>
          </v-layout>
        </v-container>
      </v-card>
    </v-flex>
    <v-flex xs3>
      <v-card>
        <v-container grid-list-md >
          <v-layout justify-space-around>
              <v-icon>list</v-icon><h3>Gestion de tareas</h3>
          </v-layout>
          <v-layout justify-space-around>
            <h4 class="estado">Estado: <span v-html=gestion></span></h4>
          </v-layout>
        </v-container>
      </v-card>
    </v-flex>
    <v-flex xs3>
      <v-card>
        <v-container grid-list-md >
          <v-layout justify-space-around>
              <v-icon>check_box</v-icon><h3>Control de entregas</h3>
          </v-layout>
          <v-layout justify-space-around>
            <h4 class="estado">Estado: <span v-html=entrega></span></h4>
          </v-layout>
        </v-container>
      </v-card>
    </v-flex>
  </v-layout>
</v-container>
</template>


<script>

  export default {

    data: () => ({
      pass: null,
    }),

    computed: {
      asistencia (){ 
        return this.estado(this.$store.state.sesion.assistances_mod)
      },
      ronda (){ 
        return this.estado(this.$store.state.sesion.routes_mod)
      },
      gestion (){
        return this.estado(this.$store.state.sesion.tasks_mod)
      },
      entrega (){
        return this.estado(this.$store.state.sesion.delivery_mod)
      },
      usuarios (){
        return this.$store.state.sesion.user_limit
      }, 
      zonas (){
        return this.$store.state.sesion.zone_limit
      },
      nombre (){
        return this.$store.state.admin.first_name
      } 
    },


    created () {
      this.initialize()
    },

    methods: {
      initialize () {
        
        
      },

      estado(item){
        if (item){
          return '<span class="habilitado">Habilitado</span>'
        }
        else{
          return '<span class="desabilitado">Desabilitado</span>'
        }
      },

      changePass () {
        this.$axios.put('/supervisors/change-password/self/', {
            password : this.pass,
          })
          .then(resp => {
            this.pass = null
            if(resp.status === 200){
              alert("Contraseña modificada")
            }
          })
          .catch(e => {
            this.pass = null
            console.log(e)
          })
      }

    }
  }
</script>

<style>
.desabilitado{
  color: crimson
}
.proximamente{
  color: darkgray
}

.habilitado{
  color:chartreuse
}

.estado{
  margin-top: 20px
}
</style>
