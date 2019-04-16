<template>
      <v-container fluid fill-height>
        <v-layout align-center justify-center>
          <v-flex xs12 sm8 md4 >
            <v-card class="elevation-12">
              <v-toolbar dark color="primary">
                <v-toolbar-title>CAMBIAR CONTRASEÑA</v-toolbar-title>
                <v-spacer></v-spacer>
              </v-toolbar>
              <v-card-text>
                <v-form>
                  <v-text-field id="password" prepend-icon="lock" name="password" label="Contraseña" type="password" v-model="pass"></v-text-field>
                  <v-text-field id="password2" prepend-icon="lock" name="password2" label="Repetir contraseña" type="password" v-model="pass2"></v-text-field>
                </v-form>
              </v-card-text>
              <v-card-actions>
                <v-btn color="primary" @click="cambio()">CAMBIAR</v-btn>
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
      pass: null,
      pass2: null,
      drawer: null
    }),
    props: {
      source: String
    }, 
    methods: {
      cambio () {
         if (this.pass === this.pass2){
          this.$axios.put('/admin/', {
            password : this.pass,
          })
          .then(resp => {
            this.pass2 = null
            this.pass = null
            if(resp.status === 200){
              alert("Contraseña modificada")
            }
          })
          .catch(e => {
            this.pass = null
            this.pass2 = null
            alert(e)
          })
        } 
        else{
          alert("Por favor ingrese la contraseña igual en ambos campos")
        }
      }
    }
  }
</script>