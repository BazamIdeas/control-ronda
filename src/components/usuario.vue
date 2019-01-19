<template>
  <v-container grid-list-md >
    <v-layout row wrap>
        <v-flex xs4 text-xs-center>
          <img  height= "300" v-if="usuario.worker.image_uuid" :src = getImage(usuario.worker.image_uuid) >  
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
                  <v-text-field label="Teléfono" box readonly :value= usuario.worker.phone></v-text-field>
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
export default {
  props: ['usuario'],
  data: () => ({
    api: 'http://apicc.bazamdev.com/v1'
  }),

  methods: {
    getImage (uid) { return this.$store.state.conf.api+'/workers/face/'+uid },

  }
}
</script>
