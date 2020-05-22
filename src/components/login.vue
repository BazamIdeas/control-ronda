<template>
      <v-container fluid fill-height>
      <v-layout align-center justify-center>
          <v-flex xs12 sm8 md4 >
            <v-card class="elevation-12">
              <v-toolbar dark color="primary">
                <v-toolbar-title>INGRESO DE SUPERVISORES</v-toolbar-title>
                <v-spacer></v-spacer>
              </v-toolbar>
              <v-card-text>
                <v-form>
                  <v-text-field prepend-icon="person" name="username" label="Email" type="text" v-model="username"></v-text-field>
                  <v-text-field id="password" prepend-icon="lock" name="password" label="Contraseña" type="password" v-model="pass"></v-text-field>
                </v-form>
              </v-card-text>
              <v-card-actions>
                <v-btn color="secundary" small to="/comite">Soy miembro de un comité</v-btn>
                <v-spacer></v-spacer>
                <v-btn color="primary" @click="login()">ENTRAR</v-btn>
              </v-card-actions>
            </v-card>
          <v-btn color="error" fab small dark absolute bottom left to="/administracion">
              <v-icon>scatter_plot</v-icon>
        </v-btn>
          </v-flex>

        </v-layout>

<!--

<div class="powers">
  <div class="power-header">
</div>

  <v-row class="power-actions">

    <div class="col">
      <v-switch

              v-model="ex11"
              label="red"
              color="red"
              value="red"
              hide-details
            ></v-switch>

    </div>

  <div class="col">
   <v-btn round>Rounded Button</v-btn>

  </div>

  </v-row>

</div>


-->
        </v-container>

</template>
<style scoped>
.power-header {
  height: 400px;
  width:400px;
  background:url('../assets/draw-bg.svg');
  border-bottom: solid red;
}
.power-actions{
  display: flex;
  justify-content: space-around;
}
</style>
<script>
  import axios from '../axios.js'
  export default {
    data: () => ({
      username: null,
      pass: null,
      drawer: null
    }),
    props: {
      source: String
    },
    methods: {
      login(){
        axios.post('/supervisors/login', {
          username : this.username,
          password : this.pass
        })
        .then(resp => {
          if(resp.status === 200){
            this.$store.commit('SET_SESION',resp.data.worker)
            localStorage.setItem('bazam-token-control', resp.data.token)
            localStorage.setItem('bazam-condo-id',JSON.stringify(resp.data.worker.condos.id))
            this.$router.push('cuenta')
          }
          else{
            alert("Usuario o contraseña invalida")
          }
        })
        .catch(e => {
          alert("Usuario o contraseña invalida")
          console.log(e)
        })
      }
    }
  }
</script>
