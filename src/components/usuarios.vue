<template>
<v-container grid-list-md >
  <v-layout row wrap>
    <v-flex xs12 >
      <v-toolbar color="grey" dark>
          <v-toolbar-side-icon></v-toolbar-side-icon>
          <v-toolbar-title>Usuarios de la app</v-toolbar-title>
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
                    <v-text-field v-model="editedItem.worker.first_name" label="Nombre completo" :rules="[rules.required]"></v-text-field>
                  </v-flex>
                  <v-flex xs6>
                    <v-text-field v-model="editedItem.username" label="Usuario" :rules="[rules.required]"></v-text-field>
                  </v-flex>
                  <v-flex xs6>
                    <v-text-field v-model="editedItem.phone" label="Telefono" :rules="[rules.required]"></v-text-field>
                  </v-flex>
                  <v-flex xs6>
                    <v-text-field v-model="editedItem.worker.email" label="Email" :rules="[rules.required, rules.email]"></v-text-field>
                  </v-flex>
                  <v-flex xs6>
                    <v-text-field v-model="editedItem.worker.address" label="Dirección" :rules="[rules.required]"></v-text-field>
                  </v-flex>
                  <v-flex xs6>
                    <v-text-field v-model="editedItem.worker.city" label="Ciudad"></v-text-field>
                  </v-flex>
                  <v-flex xs6>
                    <v-text-field v-model="editedItem.worker.community" label="Comuna"></v-text-field>
                  </v-flex>
                  <v-flex xs6>
                    <v-text-field v-model="editedItem.worker.country" label="Pais"></v-text-field>
                  </v-flex>
                  <v-flex xs6>
                    <v-text-field v-model="editedItem.worker.rut" label="RUT" :rules="[rules.required]"></v-text-field>
                  </v-flex>
                  <v-flex xs6>
                    <v-text-field v-model="editedItem.password" label="Contraseña" :rules="[rules.required]"></v-text-field>
                  </v-flex>
                </v-layout>
              </v-container>
            </v-card-text>

            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn color="blue darken-1" flat @click.native="close">Cancelar</v-btn>
              <v-btn color="blue darken-1" flat @click.native="save" v-if="editedItem.password">Guardar</v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
        </v-toolbar>
      <v-toolbar flat color="white">
        <v-text-field
        v-model="search"
        append-icon="search"
        label="Buscar por nombre, usuario, rut, email o teléfono"
        single-line
        hide-details
      ></v-text-field>
      </v-toolbar>
      <v-data-table
        :headers="headers"
        :items="users"
        :search="search"
        rows-per-page-text= "Número de Filas"
        class="elevation-1"
      >
        <template slot="items" slot-scope="props">
          <td  >{{ props.item.worker.first_name }}</td>
          <td  >{{ props.item.username }}</td>
          <td  >{{ props.item.worker.rut }}</td>
          <td  >{{ props.item.worker.email }}</td>
          <td  >{{ props.item.phone }}</td>
          <td class="justify-center px-0" >
           <v-switch v-if="!props.item.worker.approved" v-model="props.item.approved" @change="aprobar(props.item.worker)" >
           </v-switch>
           <v-icon v-if="props.item.worker.approved" v-model="props.item.approved">done</v-icon>
          </td>
          <td class="justify-center px-0" >
            <v-tooltip bottom>
              <v-icon  slot="activator" color="blue darken-2" class="mr-2" @click="getFicha(props.item)">visibility</v-icon>
              <span>Detalles</span>
            </v-tooltip>
            <v-tooltip bottom>
              <v-icon  slot="activator" color="green darken-2" class="mr-2" @click="editItem(props.item)">edit</v-icon>
              <span>Editar</span>
            </v-tooltip>
            <v-tooltip bottom>
              <v-icon  slot="activator" color="blue darken-2" class="mr-2" @click="props.expanded = !props.expanded">https</v-icon>
              <span>Permisos</span>
            </v-tooltip>
            <v-tooltip bottom>
              <v-icon  slot="activator" color="red darken-2" @click="deleteItem(props.item)">delete</v-icon>
              <span>Eliminar</span>
            </v-tooltip>
          </td>
        </template>
        <template slot="expand" slot-scope="props">
            <v-container grid-list-md>
                <v-layout wrap>
                  <v-flex xs2>
                    <v-switch v-if="props.item.worker.condos.assistances_mod" label="Asistencia" v-model="props.item.assistances_mod" @change="changeStatus(props.item)" >
                    </v-switch>
                    <span v-if="!props.item.worker.condos.assistances_mod">No habilitado</span>
                  </v-flex>
                  <v-flex xs2>
                  <v-switch v-if="props.item.worker.condos.routes_mod"  label="Rondas"  v-model="props.item.routes_mod" @change="changeStatus(props.item)" >
                  </v-switch>
                  <span v-if="!props.item.worker.condos.routes_mod">No habilitado</span>
                  </v-flex>
                  <v-flex xs2>
                  <v-switch v-if="props.item.worker.condos.delivery_mod" label="Entregas"  v-model="props.item.delivery_mod" @change="changeStatus(props.item)" >
                  </v-switch>
                  <span v-if="!props.item.worker.condos.delivery_mod">No habilitado</span>
                  </v-flex>
                  <v-flex xs2>
                  <v-switch v-if="props.item.worker.condos.tasks_mod" label="Gestión" v-model="props.item.tasks_mod" @change="changeStatus(props.item)" >
                  </v-switch>
                  <span v-if="!props.item.worker.condos.tasks_mod">No habilitado</span>
                  </v-flex>
                  <v-flex xs2>
                  <v-switch v-if="props.item.worker.condos.checks_mod" label="Entrega de turno" v-model="props.item.checks_mod" @change="changeStatus(props.item)" >
                  </v-switch>
                  <span v-if="!props.item.worker.condos.checks_mod">No habilitado</span>
                  </v-flex>
                </v-layout>
            </v-container>
          </template>
        <template slot="no-data">
          <v-btn color="primary" @click="initialize">Recargar</v-btn>
        </template>
      </v-data-table>
    </v-flex>
    <v-dialog v-model="ficha" fullscreen hide-overlay transition="dialog-bottom-transition">
      <v-card>
        <v-layout justify-end>
            <v-btn flat @click.native="ficha = false">Cerrar</v-btn>
        </v-layout >
        <bz-usuario v-if= "usuario" v-bind:usuario="usuario"> </bz-usuario>
      </v-card>
    </v-dialog>
  </v-layout>
</v-container>
</template>


<script>

import BzUsuario from "./usuario.vue"
  export default {
    components: {BzUsuario},
    data: () => ({
      fab: true,
      search: '',
      UserRoutes: 0,
      dialog: false,
      usuario: '',
      selected: 0,
      ficha: false,
      headers: [
        {
          text: 'Nombre completo',
          sortable: true,
          value: 'worker.first_name'
        },
        {
          text: 'Usuario',
          sortable: true,
          value: 'username'
        },
        {
          text: 'RUT',
          align: 'center',
          sortable: true,
          value: 'worker.rut'
        },
        {
          text: 'Email',
           value: 'worker.email',
        },
        {
          text: 'Telefono',
          sortable: false,
          value: 'phone',
        },
        {
          text: 'Aprobado',
          sortable: false,
        },
        { text: 'Acciones', 
        sortable: false, 
        }
      ],
      users: [],
      editedIndex: -1,
      editedItem: {
        username: '',
        password: '',
        phone: '',
        worker: {
          first_name: '',
          rut: '',
          email: '',
          country: '',
          community: '',
          city: '',
          address: ''
        }
      },
      defaultItem: {
        username: '',
        password: '',
        phone: '',
        worker: {
          first_name: '',
          rut: '',
          email: '',
          country: '',
          community: '',
          city: '',
          address: ''
        }
      },
      rules: {
          required: value => !!value || 'El campo es requerido.',
          counter: value => value.length <= 20 || 'Max 20 characters',
          email: value => {
            const pattern = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
            return pattern.test(value) || 'Correo invalido'
          }
        }
    }),

    computed: {
      formTitle () {
        return this.editedIndex === -1 ? 'Nuevo Usuario' : 'Modificar usuario'
      },
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
        this.$axios.get('/watchers/self')
        .then(resp => {
          if(resp.status === 200){
            if (resp.data !== null){
              this.users = resp.data
            }
            else{
              this.users = []
            }
            
          }
        })
        .catch(e => {
          console.log(e)
        })
      },

      editItem (item) {
        this.selected = item.id
        this.editedIndex = this.users.indexOf(item)
        this.editedItem = Object.assign({}, item)
        this.editedItem.password = 'xxxxxxxx'
        this.dialog = true
      },

      getRoute(item){
        this.selected = item.id
        this.UserRoutes = item
      },

      deleteItem (item) {
        this.$axios.delete('/workers/'+item.worker.id+'?trash=true')
          .then(resp => {
            if(resp.status === 200){
              const index = this.users.indexOf(item)
              this.users.splice(index, 1)
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

      userValidate () {
        this.$axios.get('/watchers/username/'+this.editedItem.username)
        .then(resp => {
          if(resp.status === 200){
            alert("El usuario esta en uso")         
          }
        })
      },

      save () {
        this.$axios.get('/watchers/username/'+this.editedItem.username)
        .then(resp => {
          console.log(resp)
          if(resp.status === 200 && this.editedItem.username != resp.data.username){
            alert("El usuario esta en uso")
            return false         
          }
          return true 
        })
        .catch(e => {
          if(e.response.data.code === 8){
            return true             
            }
          return false
        })
        .then(validacion => {
          if (validacion){
            if (this.editedIndex > -1) {
              
              if (this.editedItem.password === 'xxxxxxxx'){
                delete this.editedItem.password
              }
              this.$axios.put('/watchers/'+this.editedItem.id, this.editedItem)
              .then(resp => {
                if(resp.status === 200){
                  Object.assign(this.users[this.editedIndex], this.editedItem)
                }
              })
              .catch(e => {
                if(e.response.data.code === 1062){
                      alert("No se ha podido modificar al empleado, El usuario o email ya estan están siendo usados")
                    }
                console.log(e)
              })
            } else {
                if (this.users.length < this.$store.state.sesion.user_limit ){
                  this.$axios.post('/watchers/', this.editedItem)
                  .then(resp => {
                    if(resp.status === 201){
                      this.users.push(resp.data)
                    }
                  })
                  .catch(e => {
                    if(e.response.data.code === 1062){
                      alert("No se ha podido registrar al empleado, El usuario o email ya estan están siendo usados")
                    }
                    console.log(e.response.data)
                  })
              }
              else{
                alert('Haz excedido el limite de usuarios de tu plan')
              }
            }
            this.close()
          }
        })
      },

      changeStatus(item){
        delete item.password
        this.$axios.put('/watchers/'+item.id, item)
        .then(resp => {
          if(resp.status === 200){
           alert("Haz cambiado el permiso al usuario satisfactoriamente")
          }
        })
        .catch(e => {
          console.log(e)
        })
      },
       aprobar (item) {
        this.$axios.patch('/workers/'+item.id+'/approve')
        .then(resp => {
          if(resp.status === 200){
            alert('Usuario aprobado')
          }
        })
        .catch(e => {
          console.log(e)
        })
      },

      getFicha(item){
        this.usuario = item
        this.selected = item.id
        this.ficha = true
      },
    }
  }
</script>

<style>
.actived{
  background: #f7f0b2;
}
</style>
