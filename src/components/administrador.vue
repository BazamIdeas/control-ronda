<template>
      <v-container fluid fill-height>
        <v-layout align-center justify-center>
          <v-flex xs12 sm8 md4>
            <v-card class="elevation-12">
              <v-toolbar dark color="primary">
                <v-toolbar-title>Area del administrador</v-toolbar-title>
                <v-spacer></v-spacer>
              </v-toolbar>
              <v-card-text>
                <v-form>
                  <v-text-field prepend-icon="person" name="email" label="Usuario" type="text" v-model="email"></v-text-field>
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
        axios.post('/admin/login', {
          email : this.email,
          password : this.pass
        })
        .then(resp => {
          if(resp.status === 200){
            this.$store.commit('SET_SESION_ADMIN')
            localStorage.setItem('bazam-token-control', resp.data.token)
            this.$router.push('/administracion/panel')
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