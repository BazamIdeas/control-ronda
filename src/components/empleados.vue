<template>
<v-container grid-list-md >
  <v-toolbar absolute>
      <v-spacer></v-spacer>
      <v-toolbar-items>
        <v-btn flat to='/empleados'>REPORTE DE EMPLEADOS</v-btn>
        <v-btn flat to='/asistencias'>ASISTENCIAS</v-btn>
        <v-btn flat to='/configuracion-asistencia'>CONFIGURACIÓN</v-btn>
      </v-toolbar-items>
  </v-toolbar>
  <v-layout row wrap mt-5>
    <v-flex xs6>
      <v-toolbar color="grey" dark>
          <v-toolbar-title>EMPLEADOS</v-toolbar-title>
          <v-spacer></v-spacer>
          <v-btn icon @click="initialize ()">
            <v-icon>autorenew</v-icon>
          </v-btn>
        </v-toolbar>

      <v-toolbar flat color="white">
        <v-text-field
        v-model="search"
        append-icon="search"
        label="Buscar por nombre o RUT"
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
                    <v-text-field v-model="editedItem.first_name" label="Nombre Completo"></v-text-field>
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
        rows-per-page-text= "Número de Filas"
        class="elevation-1"   
             :loading="loading1"
      >
                            <v-progress-linear v-slot:progress color="blue" indeterminate></v-progress-linear>

        <template slot="items" slot-scope="props">
          <td :class="{actived:selected == props.item.id}" >{{ props.item.first_name }}</td>
          <td :class="{actived:selected == props.item.id}" >{{ props.item.rut }}</td>
          <td class="justify-center px-0" :class="{actived:selected == props.item.id}">
              <v-chip class="text-xs-center" small slot="activator" @click="getReport(props.item)">Mensual</v-chip>
              <v-chip class="text-xs-center" small slot="activator" @click="getResume(props.item)">Anual</v-chip>
            </td>
        </template>
        <template slot="no-data">
          <v-btn color="primary" @click="initialize">Recargar</v-btn>
        </template>
      </v-data-table>
    </v-flex>
    <v-flex xs6>
      <v-toolbar color="grey" dark>
        <v-toolbar-title>JORNADAS SIN TERMINAR</v-toolbar-title>
      </v-toolbar>
      <v-toolbar flat color="white">
        <v-text-field
        v-model="search2"
        append-icon="search"
        label="Buscar por nombre"
        single-line
        hide-details
      ></v-text-field>
      </v-toolbar>
      <v-data-table
        :headers="headers2"
        :items="sinTerminar"
        rows-per-page-text= "Número de Filas"
        class="elevation-1"
        :loading="loading2"
      >
   <v-progress-linear v-slot:progress color="blue" indeterminate></v-progress-linear>

        <template slot="items" slot-scope="props">
          <tr @click="props.expanded = !props.expanded" style="cursor:pointer">
            <td >{{ props.item.workers.first_name }}</td>
            <td  >{{moment(props.item.date).format('DD/MM/YYYY') }}</td>
            <td >{{moment(props.item.date).format('HH:mm') }}</td>
          </tr>
        </template>
        <template slot="expand" slot-scope="props">
          <v-card flat>
            <v-container grid-list-md >
            <v-layout row wrap>
              <v-flex xs12> <h4>Cerrar jornada manualmente</h4></v-flex>
              <v-flex xs4>
                  <v-menu
                  ref="menu"
                  :close-on-content-click="false"
                  v-model="menu"
                  :nudge-right="40"
                  lazy
                  transition="scale-transition"
                  offset-y
                  full-width
                  min-width="290px"
                  >
                  <v-text-field
                  slot="activator"
                  v-model="fecha"
                  label="Fecha de salida"
                  readonly
                  ></v-text-field>
                  <v-date-picker v-model="date" locale="es-419" @input="$refs.menu.save(date)"></v-date-picker>
                </v-menu>
              </v-flex>
              <v-flex xs4>
                  <v-menu
                  ref="menu2"
                  :close-on-content-click="false"
                  v-model="menu2"
                  :nudge-right="40"
                  lazy
                  transition="scale-transition"
                  offset-y
                  full-width
                  min-width="290px"
                  >
                  <v-text-field
                  slot="activator"
                  v-model="hora2"
                  label="Hora de salida"
                  readonly
                  ></v-text-field>
                  <v-time-picker 
                  v-model="hora2" 
                  locale="es-419" 
                  @input="$refs.menu.save(hora2)"
                  format="24hr"
                  scrollable>
                  </v-time-picker>
                </v-menu>
              </v-flex>
              <v-flex xs4>
                 <v-btn small @click="cerrarJornada(props.item)">Guardar</v-btn>
              </v-flex>
            </v-layout>
            </v-container>
          </v-card>
        </template>
        <template slot="no-data">
          <p>No hay asistencias por completar o aún se está verificando</p>
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

  var moment = require ('moment')

  export default {
    components: {BzReport, BzResume},
    data: () => ({
      fab: true,
      isConnected: false,
      moment: moment,
      menu: false,
      loading1:false,
      loading2:false,
      menu2: false,
      date: null,
      fechaActual: moment().format('DD-MM-YYYY'),
      hora2: '00:00',
      search2: '',
      search: '',
      employeesReport: 0,
      employeesResume: 0,
      dialog: false,
      selected: 0,
      ventana: false,
      tiempoReal: [],
      sinTerminar: [],
      headers2:[
        { 
        text: 'Nombre', 
        sortable: true,
        value: 'watchers.worker.first_name',
        },
        {
          text: 'Fecha',
          sortable: true,
          value: 'date',
          isDescending: true
        },
        {
          text: 'Hora de entrada'
        },
        ],
      headers: [
        {
          text: 'Nombre Completo',
          sortable: true,
          value: 'first_name',
        },
        {
          text: 'RUT',
          sortable: true,
          value: 'rut',
        },
        { text: 'Reportes'}
      ],
      employees: [],
      editedIndex: -1,
      editedItem: {
        first_name: '',
      },
      defaultItem: {
        first_name: '',
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
      },

      fecha: function (){
        if (!this.date){
          return this.fechaActual
        }
        else{
          return moment(this.date).format('DD-MM-YYYY')
        }
      },

      fechaHora: function (){
        let fecha = this.date ? moment(this.date).format('YYYY-MM-DD') : moment(this.fechaActual).format('YYYY-MM-DD')
        return fecha + ' ' + this.hora2 + ':00'
         
      }
    },

    watch: {
      dialog (val) {
        val || this.close()
      }
    },

    created () {
      this.initialize()
      this.asistencias ()
      //this.socket()
    },

    methods: {
      socket (){
        const socket = new WebSocket(this.$store.state.conf.socket + '/ws/join?token=' + localStorage.getItem('bazam-token-control'))
        socket.onmessage = event => {
          this.initialize()
          let data = event.data.replace("-", "_")
          let dataParser = JSON.parse(data)
          let estados = {
            'entry': {color: 'green', texto: 'Entrada'},
            'break': {color: 'orange', texto: 'Inicio colación'},
            'finish_break': {color: 'blue', texto: 'Final colación'},
            'exit': {color: 'red', texto: 'Salida'}
          }
          dataParser.tipo = estados[dataParser.Content]
          this.tiempoReal.push(dataParser)
        }
      },

      initialize () {
        this.GetSelf()
      },
      GetSelf(){
        this.loading1 = true
        this.$axios.get('/workers/self')
        .then(resp => {
          if(resp.status === 200){
            this.employees = resp.data
                    this.loading1 = false
          }
        })
        .catch(e => {
          console.log(e)
                  this.loading1 = false
        })
      },
      cerrarJornada (jornada) {
        //console.log(jornada)
        this.$axios.post('/asistencias/cerrar/', { 
          "date" : this.fechaHora,
          "watchers_id" : jornada.watchers.id,
          "workers_id" : jornada.workers.id,
          "work_time_id": jornada.id
          }, {baseURL: this.$store.state.conf.api2,})
        .then(resp => {
          //console.log(resp)
          if(resp.status === 200){
            const index = this.sinTerminar.indexOf(jornada)
            this.sinTerminar.splice(index, 1)
            alert('Jornada cerrada')
          }
        })
        .catch(e => {
          console.log(e)
        })
      },

      asistencias () {
        this.loading2 = true
        this.$axios.get('/assistances?limit=1000000000000000')
        .then(resp => {
          if(resp.status === 200){
            const finalizadas = resp.data.filter(a =>  a.type === 'exit').map(b => b.work_time_id)
            const entradas = resp.data.filter(a =>  a.type === 'entry')
            for (let index = 0; index <  entradas.length; index++) {
              const asistencia = entradas[index];
              if (asistencia.workers.condos.id === this.$store.state.admin.condos.id){
                //console.log(Object.keys(trabajadores))
                //console.log(asistencia.workers.id)
                if (finalizadas.indexOf(asistencia.id) === -1){
                  this.sinTerminar.push(asistencia)
                }
              }
            }
          }
         this.loading2 =false

        })
        .catch(e => {
          console.log(e)
                  this.loading2 = false

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
            alert('Persona aprobada')
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
