<template>
<v-container grid-list-md >
  <v-layout row wrap>
    <v-flex xs4>
        <v-flex xs12>
            <v-text-field label="Subtarea" readonly box :value= 'subtarea.name'></v-text-field>
        </v-flex>
        <v-textarea label="Descripción" v-model= subtarea.description readonly></v-textarea>
    </v-flex>
    <v-flex xs8>
      <v-toolbar color="indigo" dark>
        <v-toolbar-side-icon></v-toolbar-side-icon>
        <v-toolbar-title>Comentarios</v-toolbar-title>
        <v-spacer></v-spacer>
      </v-toolbar>

      <v-card>
        <v-container fluid grid-list-md>
          <v-layout row wrap>
            
          </v-layout>
        </v-container>
      </v-card>
    </v-flex>
  </v-layout>
</v-container>
</template>

<script>
export default {
    props: ['subtarea']
        
}
</script>

