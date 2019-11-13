<template>
	<v-container grid-list-md >
		<v-toolbar absolute>
      <v-spacer></v-spacer>
      <v-toolbar-items>
        <v-btn flat to='/notificaciones'>
         <v-badge left>
          <span slot="badge">{{numeroNotificaciones}}</span>
          NOTIFICACIONES 
        </v-badge>
        </v-btn>
        
        <v-btn flat to='/gestion'>TAREAS</v-btn>
      </v-toolbar-items>
  </v-toolbar>
		<v-layout row wrap mt-5>
			<v-flex xs12>
      <v-toolbar color="grey" dark>
          <v-toolbar-side-icon></v-toolbar-side-icon>
          <v-toolbar-title>Listado de Notificaciones </v-toolbar-title>
          <v-spacer></v-spacer>
        </v-toolbar>
				<v-toolbar flat color="white">
        <v-text-field
        v-model="search"
        append-icon="search"
        label="Buscar por fecha, notificacion o responsable"
        single-line
      
      ></v-text-field>
        
      </v-toolbar>
      <v-data-table
        :headers="headers"
        :items="notificaciones"
        :search="search"
        rows-per-page-text= "Número de Filas"
        :pagination.sync="pagination"
        class="elevation-1"
      >
        <template slot="items" slot-scope="props">
          <td>{{ moment(props.item.date).format('DD-MM-YYYY') }}</td>
					<td>{{ moment(props.item.date).format('HH:mm') }}</td>
          <td>{{ props.item.name }}</td>
					<td>{{ props.item.worker.first_name }}</td>
					<td  :class="{actived:selected == props.item.id}">
            <v-tooltip bottom>
              <v-icon  slot="activator" color="blue darken-2" class="mr-2" @click="getDescripcion(props.item)">visibility</v-icon>
              <span>Descripción</span>
            </v-tooltip>
						 <v-chip color="white" small v-if= "props.item.foto" @click="props.expanded = !props.expanded"><v-icon>camera_alt</v-icon></v-chip>
						 <v-chip color="red" small text-color="white" v-if= "!props.item.view" >no visto</v-chip>
          </td>
        </template>
        <template slot="no-data">
          <v-btn color="primary" @click="initialize">Recargar</v-btn>
        </template>
      </v-data-table>
      <div class="text-xs-center pt-2">
      </div>
    </v-flex>
		<v-dialog v-model="vistaDescripcion" width="500">
			<v-card>
        <v-card-title class="headline grey lighten-2" primary-title>
         {{descripcion.name}}
        </v-card-title>
        <v-card-text>
          {{descripcion.description}}
        </v-card-text>
        <img v-if="descripcion.image_uuid" :src = getImage(descripcion.image_uuid) class="img-comment" > 
        <v-divider></v-divider>
			<v-card-actions><v-spacer></v-spacer>
          <v-btn color="primary" flat  @click="vistaDescripcion = false">
            Cerrar
          </v-btn>
        </v-card-actions>
      </v-card>
		</v-dialog>
		</v-layout>
	</v-container>
</template>

<script>
import axios from '../axios.js'
var moment = require ('moment')
moment.locale('es')
export default {
	data: () => ({
		moment: moment,
	  fab: true,
	  info: null,
	  search: '',
		pagination: {descending: true},
		descripcion: '',
		vistaDescripcion: false,
		selected: 0,
		numeroNotificaciones: 0,
	  headers: [
		{
		  text: 'Fecha',
		  align: 'left',
		  sortable: true,
		  isDescending: true,
		  value: 'date'
		},
		{
		  text: 'Hora',
		  align: 'left',
		  sortable: true,
		  isDescending: true,
		  value: 'date'
		},
		{
		  text: 'Notificación',
		  align: 'left',
		  sortable: true,
		  value: 'worker.first_name'
		},
		{
		  text: 'Responsable',
		  align: 'left',
		  sortable: true,
		  value: 'name'
		},
		{ text: 'Detalles', 
		value: 'name', 
		sortable: false, 
		align: 'left', }
	  ],
	  notificaciones: [],
	}),

	created () {
		this.initialize()
	},

	methods: {
		initialize () {
			axios.get('/notifications/condos/self')
			.then(resp => {
				if(resp.status === 200){
					if (resp.data.length > 0)
						resp.data.forEach(element => {
							if (!element.view)
								this.numeroNotificaciones += 1
							element.foto = element.image_uuid ? true : false
						})
						
					this.notificaciones = resp.data       
				}
			})
			.catch(e => {
				console.log(e)
			})
		},

		getDescripcion(item){
			if(!item.view){
				axios.put('/notifications/'+item.id+'/view/true')
				.then(resp => {
					if(resp.status === 200){
						numeroNotificaciones = numeroNotificaciones - 1
					}
				})
				.catch(e => {
					console.log(e)
				})
			}
			this.descripcion = item
			this.selected = item.id
			this.vistaDescripcion = true
		},
			
		getImage (uid) { return this.$store.state.conf.api+'/notifications/image/'+uid },
	}
}
</script>

<style>
.img-comment{
      max-width: 420px;
    padding-left: 10%;
}
</style>
