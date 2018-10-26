<template>
<v-container grid-list-md >
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
                    <v-text-field v-model.number= editedItem.user_limit type="number" label="Limite de empleados"></v-text-field>
                  </v-flex>
                  <v-flex xs6>
                    <v-text-field v-model.number= editedItem.zone_limit type="number" label="Limite de zonas"></v-text-field>
                  </v-flex>
                  <v-flex xs6>
                    <v-text-field v-model.number= editedItem.hour_value type="number" label="Valor hora"></v-text-field>
                  </v-flex>
                  <v-flex xs6>
                    <v-text-field v-model.number= editedItem.extra_hour_increase type="number" label="Porcentaje hora extra"></v-text-field>
                  </v-flex>
                  <v-flex xs6>
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
        :pagination.sync="pagination"
        hide-actions
        class="elevation-1"
      >
        <template slot="items" slot-scope="props">
          <td :class="{actived:selected == props.item.id}" >{{ props.item.name }} </td>
          <td :class="{actived:selected == props.item.id}" >{{ props.item.user_limit }}</td>
          <td :class="{actived:selected == props.item.id}" >{{ props.item.zone_limit }}</td>
          <td :class="{actived:selected == props.item.id}" >{{ props.item.hour_value }}$</td>
          <td :class="{actived:selected == props.item.id}" >{{ props.item.extra_hour_increase }}%</td>
          <td :class="{actived:selected == props.item.id}" >{{ props.item.working_hours }}</td>
          <td class="justify-center px-0" :class="{actived:selected == props.item.id}">
           <v-switch v-model="props.item.assistances_mod" @change="changeModulo(props.item)" >
           </v-switch>
          </td>
          <td class="justify-center px-0" :class="{actived:selected == props.item.id}">
           <v-switch  v-model="props.item.routes_mod" @change="changeModulo(props.item)" >
           </v-switch>
          </td>
          <td class="justify-center px-0" :class="{actived:selected == props.item.id}">
            <v-tooltip bottom>
              <v-icon  slot="activator" color="blue darken-2" class="mr-2" @click="getSupervisores(props.item)">person</v-icon>
              <span>Usuarios</span>
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
    </v-flex>
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
      pagination: {rowsPerPage: 10},
      dialog: false,
      selected: 0,
      headers: [
        {
          text: 'Condominio',
          sortable: false,
        },
        {
          text: 'Empleados (Max)',
          sortable: false,
        },
        { text: 'Zonas (Max)', 
        sortable: false, 
        },

        { 
        text: '$ Hora', 
        sortable: false, 
        },
        { 
        text: '% hora extra', 
        sortable: false, 
        },
        { 
        text: 'Jornada (Hrs)', 
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
        text: 'Supervisores', 
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
      },
    }),

    computed: {
      formTitle () {
        return this.editedIndex === -1 ? 'Nuevo Condominio' : 'Modificar condominio'
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
        this.$axios.get('/condos/')
        .then(resp => {
          if(resp.status === 200){
            this.condominios = resp.data
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
        this.$axios.delete('/condos/'+item.id)
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
    }
  }
</script>

<style>
.actived{
  background: #f7f0b2;
}
</style>
