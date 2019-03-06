<template>
      <v-container fluid fill-height>
        <v-layout align-center justify-center>
          <v-flex xs12 sm8 md4>
            <v-card class="elevation-12">
              <v-toolbar dark color="primary">
                <v-toolbar-title>Ingreso a miembro de un comité</v-toolbar-title>
                <v-spacer></v-spacer>
              </v-toolbar>
              <v-card-text>
                <v-form>
                  <v-text-field prepend-icon="person" name="email" label="Email" type="text" v-model="email"></v-text-field>
                  <v-text-field id="password" prepend-icon="lock" name="password" label="Contraseña" type="password" v-model="pass"></v-text-field>
                </v-form>
              </v-card-text>
              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="primary" @click="login()">ENTRAR</v-btn>
              </v-card-actions>
            </v-card>
          </v-flex>
        </v-layout>
      </v-container>
</template>

<script>
  import axios from '../axios.js'
  export default {
    data: () => ({
      email: null,
      pass: null,
      drawer: null
    }),
    props: {
      source: String
    }, 
    methods: {
      login(){
        axios.post('/residents/login', {
          email : this.email,
          password : this.pass
        })
        .then(resp => {
          if(resp.status === 200){
            if (resp.data.committee && resp.data.approved){
            this.$store.commit('SET_SESION_COMITE')
            localStorage.setItem('bazam-token-control', resp.data.token)
            this.$router.push('/comite/panel')
              console.log("si")
            }

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