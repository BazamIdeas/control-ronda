<template>
	<v-container grid-list-md >
		<v-layout row wrap>
			<v-speed-dial v-model="fab" left  absolute direction='bottom' transition='slide-y-reverse-transition'>
				<v-btn slot="activator" v-model="fab" color="blue darken-2" dark fab >
					<v-icon>toggle_off</v-icon>
					<v-icon>toggle_on</v-icon>
				</v-btn>
				<v-btn to="/notificaciones" fab dark small color="green" >
					<v-icon>notifications_active</v-icon>
				</v-btn>
				<v-btn to="/gestion" fab dark small color="indigo">
					<v-icon>list</v-icon>
				</v-btn>
			</v-speed-dial>
			
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
	  selectUsuarios: { id: '', first_name: '' },
	  usuarios: [],
	  subtareas: 0,
	  pagination: {descending: true},
	  ventana: false,
	  dialog: false,
	  selected: 0,
	  headers: [
		{
		  text: 'Fecha',
		  align: 'left',
		  sortable: true,
		  isDescending: true,
		  value: 'date'
		},
		{
		  text: 'Tarea',
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
		 {
		  text: 'Estado',
		  align: 'left',
		  sortable: false,
		  value: 'name'
		},
		{ text: 'Acciones', 
		value: 'name', 
		sortable: false, 
		align: 'left', 
		width: '180'}
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
					this.notificaciones = resp.data       
				}
			})
			.catch(e => {
				console.log(e)
			})
		},
	}
}
</script>

