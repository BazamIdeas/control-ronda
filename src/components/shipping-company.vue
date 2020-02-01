<template>
  <v-container grid-list-md>
    <v-toolbar absolute>
      <v-spacer></v-spacer>
      <v-toolbar-items>
        <v-btn flat to="/recepcion-paquetes">recepcion de paquetes</v-btn>
        <v-btn flat to="/empresas-de-envios">Empresas de envios</v-btn>
        <v-btn flat to="/categorias-de-eventos">categorias de evento</v-btn>
      </v-toolbar-items>
    </v-toolbar>
    <v-layout row wrap mt-5>
      <v-flex xs12>
        <v-toolbar color="grey" dark>
          <v-toolbar-side-icon></v-toolbar-side-icon>
          <v-toolbar-title>Empresas de envios</v-toolbar-title>
          <v-spacer></v-spacer>
          <v-btn icon @click="initialize ()">
            <v-icon>autorenew</v-icon>
          </v-btn>
          <v-dialog v-model="dialog" max-width="500px">
            <v-btn icon slot="activator">
              <v-icon>plus_one</v-icon>
            </v-btn>
            <v-card >
              <v-card-title>
                <span class="headline">{{ formTitle }}</span>
              </v-card-title>

              <v-card-text>
                <v-container grid-list-md>
                  <v-layout wrap>
                    <v-flex xs12>
                      <v-text-field 
                      v-model="editedItem.name" 
                      label="Nombre" 
                      :rules="inputRules"></v-text-field>
                    </v-flex>
                    <v-flex xs12></v-flex>
                  </v-layout>
                </v-container>
              </v-card-text>

              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="blue darken-1" flat @click.native="close" >Cancelar</v-btn>
                <v-btn color="blue darken-1" flat @click.native="save(editedItem)"
                :disabled='isDisable'
                >Guardar</v-btn>
              </v-card-actions>
            </v-card>
          </v-dialog>
        </v-toolbar>
        <v-toolbar flat color="white">
          <v-text-field
            v-model="search"
            append-icon="search"
            label="Buscar por nombre de categoría"
            single-line
            hide-details
          ></v-text-field>
        </v-toolbar>
        <v-data-table
          :headers="headers"
          :items="listas"
          :search="search"
          :pagination.sync="pagination"
          rows-per-page-text="Número de Filas"
          class="elevation-1"
        >
          <template slot="items" slot-scope="props">
            <!--             <td
              :class="{actived:selected == props.item.id}"
            >{{ moment(props.item.date).format('DD-MM-YYYY') }}</td>
            <td
              :class="{actived:selected == props.item.id}"
            >{{ moment(props.item.date).format('HH:mm') }}</td>-->
            <td :class="{actived:selected == props.item.id}">{{ props.item.name }}</td>
            <!--             <td :class="{actived:selected == props.item.id}">{{ props.item.worker.first_name }}</td>
            <td class="justify-center px-0" :class="{actived:selected == props.item.id}">-->
            <v-tooltip bottom>
              <v-icon
                slot="activator"
                color="green darken-2"
                class="mr-2"
                @click="selectItem(props.item)"
              >edit</v-icon>
              <span>Editar</span>
            </v-tooltip>
            <!--               <v-tooltip bottom>
                <v-icon
                  slot="activator"
                  color="blue darken-2"
                  class="mr-2"
                  @click="getItems(props.item)"
                >assignment_turned_in</v-icon>
                <span>Items</span>|
            </v-tooltip>-->
            <v-tooltip bottom>
              <v-icon slot="activator" color="red darken-2" @click="deleteItem(props.item)">delete</v-icon>
              <span>Eliminar</span>
            </v-tooltip>
          </template>
          <template slot="no-data">
            <v-btn color="primary" @click="initialize">Recargar</v-btn>
          </template>
        </v-data-table>
        <div class="text-xs-center pt-2"></div>
      </v-flex>
      <v-dialog v-model="ventana" fullscreen hide-overlay transition="dialog-bottom-transition">
        <v-card>
          <v-layout justify-end>
            <v-btn flat @click.native="ventana = false">Cerrar</v-btn>
          </v-layout>
          <bz-items v-if="itemsLista" v-bind:lista="itemsLista"></bz-items>
        </v-card>
      </v-dialog>
      <v-snackbar
        v-model="isSuccess.snackbar"
        :bottom="isSuccess.y === 'bottom'"
        :color="isSuccess.color"
        :left="isSuccess.x === 'left'"
        :multi-line="isSuccess.mode === 'multi-line'"
        :right="isSuccess.x === 'right'"
        :timeout="isSuccess.timeout"
        :top="isSuccess.y === 'top'"
        :vertical="isSuccess.mode === 'vertical'"
      >
      {{ isSuccess.text }}
      <v-btn
        dark
        text
        @click="isSuccess.snackbar = false"
      >
        Cerrar
      </v-btn>
    </v-snackbar>
    </v-layout>
  </v-container>
</template>


<script>
var moment = require("moment");
moment.locale("es");
import BzItems from "./items.vue";
import axios, { nodeInstance } from "../axios.js";

export default {
  components: { BzItems },
  data: () => ({
     isSuccess:{
        color: '',
        mode: '',
        snackbar: false,
        text: '',
        timeout: 5000,
        x: null,
        y: 'top'},
    moment: moment,
    fab: true,
    info: null,
    ventana: false,
    pagination: { descending: true },
    search: "",
    itemsLista: 0,
    usuarios: [],
    selectCategory: { id: "", name: "" },
    dialog: false,
    selected: 0,
    inputRules: [
      v => v.length >= 2 || `*Este campo es obligatorio y debe tener 2 o más caracteres`
    ],
    isValid: false,
    headers: [
      /*       {
        text: "Fecha",
        align: "left",
        sortable: true,
        value: "date",
        isDescending: true
      },
      {
        text: "Hora",
        align: "left",
        sortable: true,
        value: "date",
        isDescending: true
      }, */
      {
        text: "Categoría",
        align: "left",
        sortable: true,
        value: "name"
      },
      {
        text: "Acciones",
        value: "name",
        sortable: false,
        align: "left",
        width: "180"
      }
    ],
    listas: [],
    editedIndex: -1,
    editedItem: {
      name: ""
    },
    defaultItem: {
      name: ""
    }
  }),

  computed: {
    isDisable(){
      console.info(this.editedItem.name)
      if(this.editedItem.name.length < 2)
       return !this.isValid
    },
    formTitle() {
      return this.editedIndex === -1
        ? "Nueva empresa de envio"
        : "Modificar empresa de envio";
    }
  },
  watch: {
    dialog(val) {
      val || this.close();
    }
  },
  created() {
    this.initialize();
    this.getUsuarios();
  },
  methods: {
    initialize() {
      nodeInstance
        .get("/shipping_company/")
        .then(resp => {
          if (resp.status === 200) {
            this.listas = resp.data;
          }
        })
        .catch(e => {
          console.error(e);
        });
    },
    selectItem(item) {
      this.selected = item.id;
      this.editedIndex = this.listas.indexOf(item);
      this.editedItem = Object.assign({}, item);
      this.dialog = true;
    },
    getUsuarios() {
      this.$axios
        .get("/watchers/self")
        .then(resp => {
          if (resp.status === 200) {
            if (resp.data !== null) {
              let workers = [];
              resp.data.forEach(element => {
                workers.push(element.worker);
              });
              this.usuarios = workers;
            } else {
              this.users = [];
            }
          }
        })
        .catch(e => {
          console.error(e);
        });
    },

    deleteItem(item) {
      if (item.hasOwnProperty("id")) {
        let id = item.id;
        nodeInstance
          .delete("/shipping_company/" + id)
          .then(resp => {
            if (resp.status === 200) {
              this.initialize();
              this.isSuccess = {
                color: 'success',
                snackbar: true,
                text: 'Eliminada con éxito!',
                timeout: 5000,
                x: null,
                y: 'top'
              }
              this.close();
            }
          })
          .catch(e => {
            console.error(e);
            this.isSuccess = {
                color: 'error',
                snackbar: true,
                text: 'No es posible eliminar',
                timeout: 5000,
                x: null,
                y: 'top'
              }
          });
      }
    },
    close() {
      this.selected = 0;
      this.dialog = false;
      this.editedItem = Object.assign({}, this.defaultItem);
      this.editedIndex = -1;
    },
    save(item) {
      if(item.name.length <= 2){
        return
      }
      if (item.hasOwnProperty("id")) {
        nodeInstance
          .put("/shipping_company/", {
            name: item.name,
            id: item.id
          })
          .then(resp => {
            if (resp.status === 200) {
              this.initialize();
              this.isSuccess = {
                color: 'success',
                snackbar: true,
                text: 'Editada con éxito!',
                timeout: 5000,
                x: null,
                y: 'top'
              }
              this.close();
            }
          })
          .catch(e => {
            console.error(e);
            this.isSuccess = {
                color: 'error',
                snackbar: true,
                text: 'No es posible editar',
                timeout: 5000,
                x: null,
                y: 'top'
              }
          });
      } else {

        nodeInstance
          .post("/shipping_company/", {
            name: item.name
          })
          .then(resp => {
            if (resp.status === 200) {
              this.initialize();
              this.isSuccess = {
                color: 'success',
                snackbar: true,
                text: 'Añadida con éxito!',
                timeout: 5000,
                x: null,
                y: 'top'
              }
              this.close();
            }
          })
          .catch(e => {
            console.error(e);
            this.isSuccess = {
                color: 'error',
                snackbar: true,
                text: 'No es posible añadir',
                timeout: 5000,
                x: null,
                y: 'top'
              }
          });
      }
    }
  }
};
</script>

<style>
.actived {
  background: #f7f0b2;
}
</style>
