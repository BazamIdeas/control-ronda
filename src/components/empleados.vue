<template>
<v-container grid-list-md >
  <v-layout row wrap>
      <v-speed-dial v-model="fab" left  absolute direction='bottom' transition='slide-y-reverse-transition'>
      <v-btn slot="activator" v-model="fab" color="blue darken-2" dark fab >
        <v-icon>toggle_off</v-icon>
        <v-icon>toggle_on</v-icon>
      </v-btn>
      <v-btn to="/asistencia" fab dark small color="green" >
        <v-icon>account_circle</v-icon>
      </v-btn>
      <v-btn to="/configuracion-asistencia" fab dark small color="indigo">
        <v-icon>settings</v-icon>
      </v-btn>
    </v-speed-dial>

    <v-flex xs8 offset-xs2>
      <v-toolbar color="blue lighten-1" dark>
          <v-toolbar-side-icon></v-toolbar-side-icon>
          <v-toolbar-title>Empleados </v-toolbar-title>
        </v-toolbar>

      <v-toolbar flat color="white">
        <v-text-field
        v-model="search"
        append-icon="search"
        label="Buscar"
        single-line
        hide-details
      ></v-text-field>
        <v-dialog v-model="dialog" max-width="500px">
          <v-card>
            <v-card-title>
              <span class="headline">{{ formTitle }}</span>
            </v-card-title>

            <v-card-text>
              <v-container grid-list-md>
                <v-layout wrap>
                  <v-flex xs12>
                    <v-text-field v-model="editedItem.first_name" label="Nombre"></v-text-field>
                  </v-flex>
                  <v-flex xs12>
                    <v-text-field v-model="editedItem.last_name" label="Apellido"></v-text-field>
                  </v-flex>
                </v-layout>
              </v-container>
            </v-card-text>

            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn color="blue darken-1" flat @click.native="close">Cancelar</v-btn>
              <v-btn color="blue darken-1" flat @click.native="save">Guardar</v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
      </v-toolbar>
      <v-data-table
        :headers="headers"
        :items="employees"
        :search="search"
        :pagination.sync="pagination"
        hide-actions
        class="elevation-1"
      >
        <template slot="items" slot-scope="props">
          <td :class="{actived:selected == props.item.id}" >{{ props.item.first_name }} {{ props.item.last_name }}</td>
          <td class="justify-center px-0" :class="{actived:selected == props.item.id}">
           <v-switch v-if="!props.item.approved" v-model="props.item.approved" @change="changeStatus(props.item)" >
           </v-switch>
           <v-icon v-if="props.item.approved" v-model="props.item.approved">thumb_up_alt</v-icon>
          </td>
          <td class="justify-center px-0" :class="{actived:selected == props.item.id}">
            <v-tooltip bottom>
              <v-icon  slot="activator" color="green darken-2" class="small" @click="editItem(props.item)">edit</v-icon>
              <span>Editar</span>
            </v-tooltip>
            <v-tooltip bottom>
              <v-icon  slot="activator" color="blue darken-2" class="small" @click="getReport(props.item)">alarm</v-icon>
              <span>Reporte mensual</span>
            </v-tooltip>
            <v-tooltip bottom>
              <v-icon  slot="activator" color="orange darken-2" class="small" @click="getResume(props.item)">calendar_today</v-icon>
              <span>Reporte anual</span>
            </v-tooltip>
            <v-tooltip bottom>
              <v-icon  slot="activator" color="red darken-2" class="small" @click="deleteItem(props.item)">delete</v-icon>
              <span>Eliminar</span>
            </v-tooltip>
            </td>
        </template>
        <template slot="no-data">
          <v-btn color="primary" @click="initialize">Recargar</v-btn>
        </template>
      </v-data-table>
    </v-flex>
    <v-dialog v-model="ventana" fullscreen hide-overlay transition="dialog-bottom-transition">
      <v-card>
        <v-toolbar >
          <v-spacer></v-spacer>
          <v-toolbar-items>
            <v-btn  flat @click.native="ventana = false">Cerrar</v-btn>
          </v-toolbar-items>
        </v-toolbar>
        <bz-report v-if= "employeesReport" v-bind:empleado="employeesReport"> </bz-report>
        <bz-resume v-if= "employeesResume" v-bind:empleado="employeesResume"> </bz-resume>
      </v-card>
    </v-dialog>
  </v-layout>
</v-container>
</template>


<script>
  import BzReport from "./report.vue"
  import BzResume from "./resume.vue"

  export default {
    components: {BzReport, BzResume},
    data: () => ({
      fab: false,
      search: '',
      employeesReport: 0,
      employeesResume: 0,
      pagination: {rowsPerPage: 1000},
      dialog: false,
      selected: 0,
      ventana: false,
      headers: [
        {
          text: 'Nombre y Apellido',
          sortable: true,
          value: 'first_name',
          width: '140'
        },
        { text: 'Aprobado', 
        value: 'approved', 
        sortable: true, 
        width: '10'},

        { text: 'Acciones', 
        value: 'name', 
        sortable: false, 
        width: '100'}
      ],
      employees: [],
      editedIndex: -1,
      editedItem: {
        first_name: '',
        last_name: ''
      },
      defaultItem: {
        first_name: '',
        last_name: ''
      }
    }),

    computed: {
      formTitle () {
        return this.editedIndex === -1 ? 'Nuevo Empleado' : 'Modificar empleado'
      },
      pages () {
        if (this.pagination.rowsPerPage == null ||
          this.pagination.totalItems == null
        ) return 0

        return Math.ceil(this.pagination.totalItems / this.pagination.rowsPerPage)
      }
    },

    watch: {
      dialog (val) {
        val || this.close()
      }
    },

    created () {
      this.initialize()
    },

    methods: {
      initialize () {
        this.$axios.get('/workers/self')
        .then(resp => {
          if(resp.status === 200){
            this.employees = resp.data
          }
        })
        .catch(e => {
          console.log(e)
        })
      },

      editItem (item) {
        this.selected = item.id
        this.editedIndex = this.employees.indexOf(item)
        this.editedItem = Object.assign({}, item)
        this.dialog = true
      },

      changeStatus (item) {
        this.selected = item.id
        this.$axios.patch('/workers/'+item.id+'/approve')
        .then(resp => {
          if(resp.status === 200){
            alert('Empleado aprobado')
          }
        })
        .catch(e => {
          console.log(e)
        })
      },

      getReport(item){
        this.employeesResume= 0
        this.selected = item.id
        this.employeesReport = item
        this.ventana = true
      },

      getResume(item){
        this.employeesReport= 0
        this.selected = item.id
        this.employeesResume = item
        this.ventana = true
      },

      deleteItem (item) {
        this.$axios.delete('/workers/'+item.id)
          .then(resp => {
            if(resp.status === 200){
              const index = this.employees.indexOf(item)
              this.employees.splice(index, 1)
            }
          })
          .catch(e => {
            console.log(e)
          })
      },

      close () {
        this.selected = 0
        this.dialog = false
        setTimeout(() => {
          this.editedItem = Object.assign({}, this.defaultItem)
          this.editedIndex = -1
        }, 500)
      },

      save () {
        if (this.editedIndex > -1) {
          this.$axios.put('/workers/'+this.editedItem.id, {
            first_name : this.editedItem.first_name,
            last_name : this.editedItem.last_name,
            condos: {
              id: this.$store.state.sesion.id
            }
          })
          .then(resp => {
            if(resp.status === 200){
              Object.assign(this.employees[this.editedIndex], this.editedItem)
            }
          })
          .catch(e => {
            console.log(e)
          })
        } else {
            if (this.employees.length < this.$store.state.sesion.user_limit ){
            this.$axios.axios.post('/workers/', {
              first_name : this.editedItem.first_name,
              last_name : this.editedItem.last_name,
            })
            .then(resp => {
              if(resp.status === 201){
                this.employees.push(resp.data)
              }
            })
            .catch(e => {
              console.log(e)
            })
          }
          else{
            alert('Haz excedido el limite de usuarios de tu plan')
          }
        }
        this.close()
      }
    }
  }
</script>

<style>
.actived{
  background: #f7f0b2;
}

</style>
