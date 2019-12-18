<template>
  <v-container grid-list-md>
    <v-toolbar absolute>
      <v-spacer></v-spacer>
      <v-toolbar-items>
        <v-btn flat to="/residentes">RESIDENTES</v-btn>
        <v-btn flat to="/encuestas">ENCUESTAS</v-btn>
      </v-toolbar-items>
    </v-toolbar>
    <v-layout row wrap mt-5>
      <v-flex xs12>
        <v-toolbar color="grey" dark>
          <v-toolbar-side-icon></v-toolbar-side-icon>
          <v-toolbar-title>RESIDENTES</v-toolbar-title>
          <v-spacer></v-spacer>
          <v-chip small v-on:click="aprobacionMasiva()">Aprobar todos</v-chip>

          <v-dialog v-model="dialogCsv" max-width="500px">
            <v-btn icon slot="activator">
              <v-icon>home</v-icon>
            </v-btn>
            <v-card>
              <v-card-title>
                <span class="headline">Importar Residentes</span>
              </v-card-title>

              <v-card-text>
                <v-container grid-list-md>
                  <v-layout wrap>
                    <v-flex xs12>
                      <!--                       <v-text-field @change="readCsvFile()"  ref="inputFiles" type="file" label="csv"></v-text-field>
                      -->
                      <input type="file" @change="readCsvFile" ref="inputFiles" label="csv" />
                    </v-flex>
                  </v-layout>
                </v-container>
              </v-card-text>

              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="blue darken-1" flat @click.native="closeDialogCsv">Cancelar</v-btn>
                <v-btn color="blue darken-1" flat @click.native="save">Guardar</v-btn>
              </v-card-actions>
            </v-card>
          </v-dialog>

          <!--  RESIDENTS DIALOG END-->

          <v-dialog v-model="dialog" max-width="500px">
            <v-btn icon slot="activator">
              <v-icon>plus_one</v-icon>
            </v-btn>
            <v-card>
              <v-card-title>
                <span class="headline">{{ formTitle }}</span>
              </v-card-title>

              <v-card-text>
                <v-container grid-list-md>
                  <v-layout wrap>
                    <v-flex xs6>
                      <v-text-field
                        v-model="editedItem.name"
                        label="Nombre completo"
                        :rules="[rules.required]"
                      ></v-text-field>
                    </v-flex>
                    <v-flex xs6>
                      <v-text-field v-model="editedItem.rut" label="RUT" :rules="[rules.required]"></v-text-field>
                    </v-flex>
                    <v-flex xs6>
                      <v-text-field
                        v-model="editedItem.phone"
                        label="Telefono"
                        :rules="[rules.required]"
                      ></v-text-field>
                    </v-flex>
                    <v-flex xs6>
                      <v-text-field
                        v-model="editedItem.email"
                        label="Email"
                        :rules="[rules.required, rules.email]"
                      ></v-text-field>
                    </v-flex>
                    <v-flex xs6>
                      <v-text-field
                        v-model="editedItem.departament"
                        label="Casa / Departamento"
                        :rules="[rules.required]"
                      ></v-text-field>
                    </v-flex>
                    <v-flex xs6>
                      <v-text-field
                        v-model.number="editedItem.percentage"
                        label="% Alicuota"
                        :rules="[rules.required]"
                      ></v-text-field>
                    </v-flex>
                    <v-flex xs6>
                      <v-text-field
                        v-model="editedItem.password"
                        label="Contraseña"
                        :rules="[rules.required]"
                      ></v-text-field>
                    </v-flex>
                    <v-flex xs6>
                      <v-switch label="Comité" v-model="editedItem.committee"></v-switch>
                    </v-flex>
                  </v-layout>
                </v-container>
              </v-card-text>

              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="blue darken-1" flat @click.native="close">Cancelar</v-btn>
                <v-btn
                  color="blue darken-1"
                  flat
                  @click.native="save"
                  v-if="editedItem.password"
                >Guardar</v-btn>
              </v-card-actions>
            </v-card>
          </v-dialog>
        </v-toolbar>
        <v-toolbar flat color="white">
          <v-text-field
            v-model="search"
            append-icon="search"
            label="Buscar por nombre, rut, email o teléfono"
            single-line
            hide-details
          ></v-text-field>
        </v-toolbar>
        <v-data-table
          :headers="headers"
          :items="residentes"
          :search="search"
          rows-per-page-text="Número de Filas"
          class="elevation-1"
        >
          <template slot="items" slot-scope="props">
            <td>{{ props.item.name }}</td>
            <td>{{ props.item.rut }}</td>
            <td>{{ props.item.email }}</td>
            <td>{{ props.item.phone }}</td>
            <td>{{ props.item.departament }}</td>
            <td>{{ props.item.percentage }}%</td>
            <td class="justify-center px-0">
              <v-switch v-model="props.item.approved" @change="changeStatus(props.item)"></v-switch>
            </td>
            <td class="justify-center px-0">
              <v-switch v-model="props.item.committee" @change="changeStatus(props.item)"></v-switch>
            </td>
            <td class="justify-center px-0">
              <!-- <v-tooltip bottom>
              <v-icon  slot="activator" color="blue darken-2" class="mr-2" @click="getFicha(props.item)">visibility</v-icon>
              <span>Detalles</span>
              </v-tooltip>-->
              <v-tooltip bottom>
                <v-icon
                  slot="activator"
                  color="green darken-2"
                  class="mr-2"
                  @click="editItem(props.item)"
                >edit</v-icon>
                <span>Editar</span>
              </v-tooltip>
              <!-- <v-tooltip bottom>
              <v-icon  slot="activator" color="blue darken-2" class="mr-2" @click="props.expanded = !props.expanded">https</v-icon>
              <span>Permisos</span>
              </v-tooltip>-->
              <v-tooltip bottom>
                <v-icon slot="activator" color="red darken-2" @click="deleteItem(props.item)">delete</v-icon>
                <span>Eliminar</span>
              </v-tooltip>
            </td>
          </template>
          <!--         <template slot="expand" slot-scope="props">
            <v-container grid-list-md>
                <v-layout wrap>
                  <v-flex xs3>

                  </v-flex>
                  <v-flex xs3>

                  </v-flex>
                </v-layout>
            </v-container>
          </template>-->
          <template slot="no-data">
            <v-btn color="primary" @click="initialize">Recargar</v-btn>
          </template>
        </v-data-table>
      </v-flex>
      <!--   <v-dialog v-model="ficha" fullscreen hide-overlay transition="dialog-bottom-transition">
      <v-card>
        <v-layout justify-end>
            <v-btn flat @click.native="ficha = false">Cerrar</v-btn>
        </v-layout >
        <bz-usuario v-if= "usuario" v-bind:usuario="usuario"> </bz-usuario>
      </v-card>
      </v-dialog>-->
    </v-layout>
  </v-container>
</template>


<script>
import BzUsuario from "./usuario.vue";
import papaparse from "papaparse";
export default {
  components: { BzUsuario },
  data: () => ({
    fab: true,
    search: "",
    dialog: false,
    dialogCsv: false,
    fileCsv: [],
    usuario: "",
    selected: 0,
    ficha: false,
    headers: [
      {
        text: "Nombre completo",
        sortable: true,
        value: "name"
      },
      {
        text: "RUT",
        sortable: true,
        value: "rut"
      },
      {
        text: "Email",
        sortable: true,
        value: "email"
      },
      {
        text: "Teléfono",
        value: "phone"
      },
      {
        text: " Casa / Departamento",
        value: "departament"
      },
      {
        text: "Alicuota (%)",
        value: "percentage"
      },
      {
        text: "Aprobado",
        value: "percentage"
      },
      {
        text: "Comité",
        value: "percentage"
      },
      { text: "Acciones", sortable: false }
    ],
    residentes: [],
    editedIndex: -1,
    editedItem: {
      name: "",
      password: "",
      phone: "",
      rut: "",
      email: "",
      departament: "",
      percentage: "",
      committee: false,
      approved: true
    },
    defaultItem: {
      name: "",
      password: "",
      phone: "",
      rut: "",
      email: "",
      departament: "",
      percentage: "",
      committee: false,
      approved: true
    },
    rules: {
      required: value => !!value || "El campo es requerido.",
      counter: value => value.length <= 20 || "Max 20 characters",
      email: value => {
        const pattern = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return pattern.test(value) || "Correo invalido";
      }
    }
  }),

  computed: {
    formTitle() {
      return this.editedIndex === -1
        ? "Nuevo Residente"
        : "Modificar residente";
    }
  },

  watch: {
    dialog(val) {
      val || this.close();
    },
    dialogCsv(val) {
      val || this.close();
    }
  },

  created() {
    this.initialize();
  },

  methods: {
    initialize() {
      this.$axios
        .get("/residents/self")
        .then(resp => {
          if (resp.status === 200) {
            if (resp.data !== null) {
              this.residentes = resp.data;
            } else {
              this.residentes = [];
            }
          }
        })
        .catch(e => {
          console.log(e);
        });
    },
 
   readCsvFile() {
      this.files = this.$refs.inputFiles.files[0];
      var csv
     papaparse.parse(this.files, {
        complete: async function(results) {
          console.log("Finished:", results.data);
        }
      });
    },
    editItem(item) {
      this.selected = item.id;
      this.editedIndex = this.residentes.indexOf(item);
      this.editedItem = Object.assign({}, item);
      this.editedItem.password = "xxxxxxxx";
      this.dialog = true;
    },

    getRoute(item) {
      this.selected = item.id;
      this.UserRoutes = item;
    },

    deleteItem(item) {
      this.$axios
        .delete("/residents/" + item.id + "?trash=true")
        .then(resp => {
          if (resp.status === 200) {
            const index = this.residentes.indexOf(item);
            this.residentes.splice(index, 1);
          }
        })
        .catch(e => {
          console.log(e);
        });
    },

    close() {
      this.selected = 0;
      this.dialog = false;
      setTimeout(() => {
        this.editedItem = Object.assign({}, this.defaultItem);
        this.editedIndex = -1;
      }, 1500);
    },
    closeDialogCsv() {
      this.selected = 0;
      this.dialogCsv = false;
      /*         setTimeout(() => {
          this.editedItem = Object.assign({}, this.defaultItem)
          this.editedIndex = -1
        }, 1500) */
    },

    /* userValidate () {
        this.$axios.get('/residents/username/'+this.editedItem.username)
        .then(resp => {
          if(resp.status === 200){
            alert("El usuario esta en uso")         
          }
        })
      }, */

    save() {
      this.$axios
        .get("/residents/email/" + this.editedItem.email)
        .then(resp => {
          console.log(resp);
          if (resp.status === 200 && this.editedItem.email != resp.data.email) {
            alert("El Email esta en uso");
            return false;
          }
          return true;
        })
        .catch(e => {
          if (e.response.data.code === 8) {
            return true;
          }
          return false;
        })
        .then(validacion => {
          if (validacion) {
            if (this.editedIndex > -1) {
              if (this.editedItem.password === "xxxxxxxx") {
                delete this.editedItem.password;
              }
              this.$axios
                .put("/residents/" + this.editedItem.id, this.editedItem)
                .then(resp => {
                  if (resp.status === 200) {
                    Object.assign(
                      this.residentes[this.editedIndex],
                      this.editedItem
                    );
                    alert("Cambio satisfactorio");
                  }
                })
                .catch(e => {
                  if (e.response.data.code === 1062) {
                    alert(
                      "No se ha podido modificar al residente, el email ya esta registrado"
                    );
                  }
                  console.log(e);
                });
            } else {
              this.$axios
                .post("/residents/", this.editedItem)
                .then(resp => {
                  if (resp.status === 201) {
                    this.residentes.push(resp.data);
                  }
                })
                .catch(e => {
                  if (e.response.data.code === 1062) {
                    alert(
                      "No se ha podido registrar al residente, el email ya existe"
                    );
                  }
                  console.log(e.response.data);
                });
            }
            this.close();
          }
        });
    },

    aprobacion() {
      console.log(this.residentes.length);
      this.residentes.forEach(residente => {
        console.log(residente);
        delete residente.password;
        residente.approved = true;
        this.$axios.put("/residents/" + residente.id, residente);
      });
      alert("Todos los residentes han sido aprobados");
    },

    async aprobacionMasiva() {
      await this.aprobacion();
      this.initialize();
    },

    changeStatus(item) {
      delete item.password;
      this.$axios
        .put("/residents/" + item.id, item)
        .then(resp => {
          if (resp.status === 200) {
            alert("Cambio satisfactorio");
          }
        })
        .catch(e => {
          console.log(e);
        });
    },
    aprobar(item) {
      this.$axios
        .patch("/workers/" + item.id + "/approve")
        .then(resp => {
          if (resp.status === 200) {
            alert("Usuario aprobado");
          }
        })
        .catch(e => {
          console.log(e);
        });
    },

    getFicha(item) {
      this.usuario = item;
      this.selected = item.id;
      this.ficha = true;
    }
  }
};
</script>

<style>
.actived {
  background: #f7f0b2;
}
</style>
