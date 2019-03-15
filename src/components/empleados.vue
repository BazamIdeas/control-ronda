<template>
<v-container grid-list-md >
  <v-toolbar absolute>
      <v-spacer></v-spacer>
      <v-toolbar-items>
        <v-btn flat to='/asistencia'>EMPLEADOS</v-btn>
        <v-btn flat to='/configuracion-asistencia'>CONFIGURACIÓN</v-btn>
      </v-toolbar-items>
  </v-toolbar>
  <v-layout row wrap mt-5>
    <v-flex xs8>
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
      >
        <template slot="items" slot-scope="props">
          <td :class="{actived:selected == props.item.id}" >{{ props.item.first_name }}</td>
          <td :class="{actived:selected == props.item.id}" >{{ props.item.rut }}</td>
          <td class="justify-center px-0" :class="{actived:selected == props.item.id}">
           <v-switch v-if="!props.item.approved" v-model="props.item.approved" @change="changeStatus(props.item)" >
           </v-switch>
           <v-icon v-if="props.item.approved" v-model="props.item.approved">done</v-icon>
          </td>
          <td class="justify-center px-0" :class="{actived:selected == props.item.id}">
            <!-- <v-tooltip bottom>
              <v-icon  slot="activator" color="green darken-2" class="small" @click="editItem(props.item)">edit</v-icon>
              <span>Editar</span>
            </v-tooltip> -->
              <v-chip class="text-xs-center" slot="activator" @click="getReport(props.item)">Mensual</v-chip>
              <v-chip class="text-xs-center" slot="activator" @click="getResume(props.item)">Anual</v-chip>
            <!-- <v-tooltip bottom>
              <v-icon  slot="activator" color="red darken-2" class="small" @click="deleteItem(props.item)">delete</v-icon>
              <span>Eliminar</span>
            </v-tooltip> -->
            </td>
        </template>
        <template slot="no-data">
          <v-btn color="primary" @click="initialize">Recargar</v-btn>
        </template>
      </v-data-table>
    </v-flex>
    <v-flex xs4>
      <v-toolbar color="grey" dark>
        <v-toolbar-title>TIEMPO REAL</v-toolbar-title>
      </v-toolbar>
      <v-data-table
        :headers="headers2"
        :items="tiempoReal"
        hide-actions
        class="elevation-1"
      >
        <template slot="items" slot-scope="props">
          <td >{{ props.item.User }}</td>
          <td ><v-chip small :color= 'props.item.tipo.color' text-color="white">{{props.item.tipo.texto}}</v-chip></td>
        </template>
        <template slot="no-data">
          <p>Vista previa de las asistencias en tiempo real, este listado es temporal </p>
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
      fab: true,
      isConnected: false,
      search: '',
      employeesReport: 0,
      employeesResume: 0,
      dialog: false,
      selected: 0,
      ventana: false,
      tiempoReal: [],
      headers2:[{text:'Nombre', value:'User', sortable: false}, {text:'Tipo', value: 'Content', sortable: false}],
      headers: [
        {
          text: 'Nombre Completo',
          sortable: true,
          value: 'first_name',
          width: '140'
        },
        {
          text: 'RUT',
          sortable: true,
          value: 'rut',
          width: '140'
        },
        { text: 'Aprobado', 
        width: '10'},

        { text: 'Reportes', 
        width: '100'}
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
      }
    },

    watch: {
      dialog (val) {
        val || this.close()
      }
    },

    created () {
      this.initialize()
      this.socket()
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
