<template>
<v-container grid-list-md mt-5 >
    <v-toolbar absolute>
      <v-spacer></v-spacer>
      <v-toolbar-items>
        <v-btn flat @click="salir()">SALIR</v-btn>
      </v-toolbar-items>
  </v-toolbar>
  <v-layout row wrap>
    <v-flex xs12>
      <v-toolbar color="blue lighten-1" dark>
          <v-toolbar-side-icon></v-toolbar-side-icon>
          <v-toolbar-title>Condominios</v-toolbar-title>
          <v-spacer></v-spacer>
          <v-dialog v-model="dialog" max-width="500px">
            <v-btn icon slot="activator">
            <v-icon >plus_one</v-icon>
          </v-btn>
          
          <v-card>
            <v-card-title>
              <span class="headline">{{ formTitle }}</span>
            </v-card-title>

            <v-card-text>
              <v-container grid-list-md>
                <v-layout wrap>
                  <v-flex xs6>
                    <v-text-field v-model="editedItem.name" label="Nombre"></v-text-field>
                  </v-flex>
                  <v-flex xs6>
                    <v-text-field v-model= editedItem.rut  label="RUT"></v-text-field>
                  </v-flex>
                  <v-flex xs6>
                    <v-text-field v-model.number= editedItem.user_limit type="number" label="Limite de empleados"></v-text-field>
                  </v-flex>
                  <v-flex xs6>
                    <v-text-field v-model.number= editedItem.zone_limit type="number" label="Limite de zonas"></v-text-field>
                  </v-flex>
                  <v-flex xs4>
                    <v-text-field v-model.number= editedItem.hour_value type="number" label="Valor hora"></v-text-field>
                  </v-flex>
                  <v-flex xs4>
                    <v-text-field v-model.number= editedItem.extra_hour_increase type="number" label="Porcentaje hora extra"></v-text-field>
                  </v-flex>
                  <v-flex xs4>
                    <v-text-field v-model.number= editedItem.working_hours type="number" label="Jornada Laboral"></v-text-field>
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
        :items="condominios"
        rows-per-page-text= "Número de Filas"
        class="elevation-1"
      >
        <template slot="items" slot-scope="props">
          <td :class="{actived:selected == props.item.id}" >{{ props.item.name }} </td>
          <td :class="{actived:selected == props.item.id}" >{{ props.item.rut }}</td>
          <td v-if= props.item.supervisors :class="{actived:selected == props.item.id}" >{{ props.item.supervisors[0].worker.first_name }}
          </td>
           <td v-if= !props.item.supervisors :class="{actived:selected == props.item.id}" >- </td>
<!--           <td :class="{actived:selected == props.item.id}" >{{ props.item.zone_limit }}</td>
          <td :class="{actived:selected == props.item.id}" >{{ props.item.hour_value }}$</td>
          <td :class="{actived:selected == props.item.id}" >{{ props.item.extra_hour_increase }}%</td>
          <td :class="{actived:selected == props.item.id}" >{{ props.item.working_hours }}</td> -->

          <td class="justify-center px-0" :class="{actived:selected == props.item.id}">
           <v-switch v-model="props.item.assistances_mod" @change="changeModulo(props.item)" >
           </v-switch>
          </td>
          <td class="justify-center px-0" :class="{actived:selected == props.item.id}">
           <v-switch  v-model="props.item.routes_mod" @change="changeModulo(props.item)" >
           </v-switch>
          </td>
          <td class="justify-center px-0" :class="{actived:selected == props.item.id}">
           <v-switch  v-model="props.item.tasks_mod" @change="changeModulo(props.item)" >
           </v-switch>
          </td>
          <td class="justify-center px-0" :class="{actived:selected == props.item.id}">
           <v-switch  v-model="props.item.delivery_mod" @change="changeModulo(props.item)" >
           </v-switch>
          </td>
          <td class="justify-center px-0" :class="{actived:selected == props.item.id}">
           <v-switch  v-model="props.item.checks_mod" @change="changeModulo(props.item)" >
           </v-switch>
          </td>
          <td class="justify-center px-0" :class="{actived:selected == props.item.id}">
           <v-switch  v-model="props.item.surveys_mod" @change="changeModulo(props.item)" >
           </v-switch>
          </td>
          <td class="justify-center px-0" :class="{actived:selected == props.item.id}">
            <v-tooltip bottom>
            <v-icon  slot="activator" color="blue darken-2" class="mr-2" @click="getSupervisores(props.item)">person</v-icon>
            <span>Todos los supervisores</span>
          </v-tooltip>
            <v-tooltip bottom>
              <v-icon  slot="activator" color="green darken-2" class="mr-2" @click="editItem(props.item)">edit</v-icon>
              <span>Editar</span>
            </v-tooltip>
            <v-tooltip bottom>
              <v-icon  slot="activator" color="red darken-2" @click="deleteItem(props.item)">delete</v-icon>
              <span>Eliminar</span>
            </v-tooltip>
          </td>
        </template>
        <template slot="no-data">
          <v-btn color="primary" @click="initialize">Recargar</v-btn>
        </template>
      </v-data-table>
      <v-dialog v-model="ventana" fullscreen hide-overlay transition="dialog-bottom-transition">
      <v-card>
        <v-toolbar >
          <v-spacer></v-spacer>
          <v-toolbar-items>
            <v-btn  flat @click.native="ventana = false">Cerrar</v-btn>
          </v-toolbar-items>
        </v-toolbar>
        <bz-supervisor v-if= "condominio" v-bind:condominio="condominio"> </bz-supervisor>
      </v-card>
    </v-dialog>
    </v-flex>
    
    
  </v-layout>
</v-container>
</template>


<script>
  import BzSupervisor from "./supervisores.vue"


  export default {
    components: {BzSupervisor },
    data: () => ({
      ventana: false,
      fab: false,
      search: '',
      condominio: 0,
      dialog: false,
      selected: 0,
      ruts: [],
      headers: [
        {
          text: 'Condominio',
          sortable: false,
        },
        {
          text: 'RUT',
          sortable: false,
        },
        { 
        text: 'Supervisor', 
        sortable: false, 
        },
        { 
        text: 'Asistencias', 
        sortable: false, 
        },
        { 
        text: 'Rondas', 
        sortable: false, 
        },
        { 
        text: 'Gestión', 
        sortable: false, 
        },
        { 
        text: 'Entrega', 
        sortable: false, 
        },
        { 
        text: 'Inventario', 
        sortable: false, 
        },
        { 
        text: 'Encuesta', 
        sortable: false, 
        },
        { 
        text: 'Acciones', 
        sortable: false, 
        }
      ],
      condominios: [],
      editedIndex: -1,
      editedItem: {
        name: '',
        user_limit: '',
        zone_limit: '',
        hour_value: '',
        extra_hour_increase: '',
        working_hours: '',
        assistances_mod: false,
        routes_mod: false,
        delivery_mod: false,
        tasks_mod: false,
        rut: ''
      },
      defaultItem: {
        name: '',
        user_limit: '',
        zone_limit: '',
        hour_value: '',
        extra_hour_increase: '',
        working_hours: '',
        assistances_mod: false,
        routes_mod: false,
        delivery_mod: false,
        tasks_mod: false,
        rut: ''
      },
    }),

    computed: {
      formTitle () {
        return this.editedIndex === -1 ? 'Nuevo Condominio' : 'Modificar condominio'
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
        this.$axios.get('/condos/')
        .then(resp => {
          if(resp.status === 200){
            this.condominios = resp.data
            this.ruts = this.condominios.map(function (condominio, index, array) {
            return condominio.rut
            })  
          }
        })
        .catch(e => {
          console.log(e)
        })
      },

      editItem (item) {
        this.selected = item.id
        this.editedIndex = this.condominios.indexOf(item)
        this.editedItem = Object.assign({}, item)
        this.dialog = true
      },

      getSupervisores(item){
        this.selected = item.id
        this.condominio = item
        this.ventana = true
      },

      deleteItem (item) {
        this.$axios.delete('/condos/'+item.id+"?trash=true")
          .then(resp => {
            if(resp.status === 200){
              const index = this.condominios.indexOf(item)
              this.condominios.splice(index, 1)
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
          if (this.ruts.indexOf(this.editedItem.rut) > -1) {
            alert("El rut de la empresa ya esta registrado")
          }
          else{
            if (this.editedIndex > -1) {
            this.$axios.put('/condos/'+this.editedItem.id, this.editedItem)
            .then(resp => {
              if(resp.status === 200){
                Object.assign(this.condominios[this.editedIndex], this.editedItem)
              }
            })
            .catch(e => {
              console.log(e)
            })
          } else {
              this.$axios.post('/condos/', this.editedItem)
              .then(resp => {
              if(resp.status === 201){
                  this.condominios.push(resp.data)
                  alert("condominio creado, no olvide crear un usuario")
                  }
              })
              .catch(e => {
              console.log(e)
              })
          }
          this.close()
        }
      },

      changeModulo(item){
        this.selected = item.id
        this.$axios.put('/condos/'+item.id, item)
        .then(resp => {
          if(resp.status === 200){
            alert('Modulo cambiado')
          }
        })
        .catch(e => {
          console.log(e)
        })
      },

      salir (){
      this.$store.commit('FINISH_SESION')
      localStorage.removeItem('bazam-token-control')
      this.$router.push('/')
      }
      
    }
  }
</script>

<style>
.actived{
  background: #f7f0b2;
}
</style>
