<template>
	<v-container grid-list-md >
		<v-layout row wrap>
			<v-speed-dial v-model="fab" left  absolute direction='bottom' transition='slide-y-reverse-transition'>
				<v-btn slot="activator" v-model="fab" color="blue darken-2" dark fab >
					<v-icon>toggle_off</v-icon>
					<v-icon>toggle_on</v-icon>
				</v-btn>
				<v-btn to="/notificaciones" fab dark small color="red" >
        {{numeroNotificaciones}}
      	</v-btn>
				<v-btn to="/gestion" fab dark small color="indigo">
					<v-icon>list</v-icon>
				</v-btn>
			</v-speed-dial>
			<v-flex xs6>
      <v-toolbar color="blue lighten-1" dark>
          <v-toolbar-side-icon></v-toolbar-side-icon>
          <v-toolbar-title>Listado de Notificaciones </v-toolbar-title>
          <v-spacer></v-spacer>
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
          <td>{{ props.item.name }}</td>
					<td>{{ props.item.worker.first_name }}</td>
					<td  :class="{actived:selected == props.item.id}">
            <v-tooltip bottom>
              <v-icon  slot="activator" color="blue darken-2" class="mr-2" @click="getDescripcion(props.item)">visibility</v-icon>
              <span>Descripción</span>
            </v-tooltip>
						 <v-chip color="red" small text-color="white" v-if= "!props.item.view" >!</v-chip>

          </td>
        </template>
        <template slot="no-data">
          <v-btn color="primary" @click="initialize">Recargar</v-btn>
        </template>
      </v-data-table>
      <div class="text-xs-center pt-2">
      </div>
    </v-flex>
		<v-flex xs6 v-if="vistaDescripcion">
			<v-layout row wrap> 
				<v-flex xs12>
					<v-textarea
          box
          label="Descripción"
					v-model="descripcion.description"
					readonly
        ></v-textarea>
				</v-flex>
				<v-flex xs12>
					<img v-if="descripcion.image_uuid" :src = getImage(descripcion.image_uuid) class="img-comment" >  
				</v-flex>
			</v-layout>
		</v-flex>
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
		api: 'http://apicc.bazamdev.com/v1',
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
		  text: 'Notificación',
		  align: 'left',
		  sortable: false,
		  value: 'name'
		},
		{
		  text: 'Responsable',
		  align: 'left',
		  sortable: false,
		  value: 'name'
		},
		{ text: 'Descripción', 
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
			
		getImage (uid) { return this.api+'/notifications/image/'+uid },
	}
}
</script>

<style>
.img-comment{
  max-width: 400px;
}
</style>
