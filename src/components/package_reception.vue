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
          <v-toolbar-title>Recepción de paquetes</v-toolbar-title>
          <v-spacer></v-spacer>
          <v-btn icon @click="initialize()">
            <v-icon>autorenew</v-icon>
          </v-btn>
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
                    <v-flex xs12>
                      <v-flex xs12>
                        <!-- <v-text-field v-model="editedItem.address" label="Direccion"></v-text-field> -->
                        <p @click="showMap = !showMap" style="cursor:pointer;">
                          <v-icon
                            :class="editedItem.address 
                            ? 'green-accent-4'
                            : 'brown-lighten-5'"
                            :rules="inputRules"
                          >where_to_vote</v-icon>
                          {{editedItem.address 
                          ? "Ya ha seleccionado ubicación" 
                          : "por favor, seleccione una ubicación"}}
                          <small
                          style="color:tomato">{{editedItem.address.length <= 5
                          ? "*Este campo es obligatorio"
                          : ""}}
                        </small>
                        </p>

                        <button class="google-btn-add-place" @click="watchMap = !watchMap">
                          <v-icon color="green accent-4">map</v-icon>
                          Observar ubicación
                        </button>
                      </v-flex>
                      <v-select
                        :items="usuarios"
                        v-model="editedItem.worker_id"
                        item-text="first_name"
                        item-value="id"
                        label="Usuario responsable"
                        single-line
                        :rules="inputRules"
                      ></v-select>
                    </v-flex>
                    <v-flex xs12>
                      <v-select
                        :items="shipping_companies"
                        item-text="name"
                        v-model="editedItem.shipping_company_id"
                        item-value="id"
                        label="Empresa de envío"
                        single-line
                        :rules="inputRules"
                      ></v-select>
                    </v-flex>
                    <v-flex xs12>
                      <v-text-field
                        v-model="editedItem.addreesse"
                        label="Destinatario"
                        :rules="inputRules"
                      ></v-text-field>
                    </v-flex>
                    <v-flex xs12></v-flex>
                  </v-layout>
                </v-container>
              </v-card-text>

              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn 
                  color="blue darken-1" 
                  flat 
                  @click.native="close"
                  >Cancelar</v-btn>
                <v-btn
                  color="blue darken-1"
                  flat
                  @click.native="save(editedItem)"
                  :disabled="isDisable"
                >Guardar</v-btn>
              </v-card-actions>
            </v-card>
            <div class="absolute-map-container" v-if="showMap">
              <div class="absolute-map">
                <GmapAutocomplete
                  class="google-map-autocomplete"
                  placeholder="Ingresa una dirección "
                  @place_changed="setPlace"
                ></GmapAutocomplete>
                <br />

                <GmapMap
                  style="width: 600px; height: 300px;"
                  :zoom="1"
                  :center="{lat: 0, lng: 0}"
                  @click="setMarker"
                >
                  <GmapMarker
                    v-for="(marker, index) in markers"
                    :key="index"
                    :position="marker.position"
                  />
                  <GmapMarker
                    v-if="this.itemAddress"
                    label="★"
                    :position="this.itemAddress"

                  />
                </GmapMap>
                <br />

                <div style="display:flex; justify-content:center;">
                  <button
                    class="google-btn-add-place mr-4"
                    @click="saveAddress(); showMap = !showMap"
                    :class="{'btn-disabled': markers.length <= 0 }"
                    :disabled="markers.length <= 0"
                  >
                    guardar
                    <v-icon class color="green accent-4">save</v-icon>
                  </button>
                  <button class="google-btn-add-place" @click="markers === [];showMap = !showMap">
                    cancelar
                    <v-icon class color="red accent-4">close</v-icon>
                  </button>
                </div>
              </div>
            </div>

          <!-- MAP JUST FOR WATCH DATA -->

          <div class="absolute-map-container" v-if="watchMap">
              <div class="absolute-map">
                <GmapMap
                  style="width: 600px; height: 300px;"
                  :zoom="1"
                  :center="{lat: 0, lng: 0}">
                  <GmapMarker
                    v-if="this.itemAddress"
                    label="★"
                    :position="itemAddress"
                  />
                </GmapMap>
              </div>
              <button class="google-btn-add-place close-watchMap" @click="watchMap = !watchMap">
                    Salir
                    <v-icon class color="grey accent-4">close</v-icon>
                  </button>
            </div>

 
 
          <!-- END OF MAP FOR WATCH DATA -->
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
            <td
              :class="{actived:selected == props.item.id}"
            >{{ shipping_companies.find(el => el.id === props.item.shipping_company_id ).name}}</td>
            <td
              :class="{actived:selected == props.item.id}"
            >{{usuarios.find(el => el.id === props.item.worker_id).first_name}}</td>
            <td>
              <v-chip v-bind:color="estadoEntrega(props.item, 'color')" small text-color="white">
                <v-avatar>
                  <v-icon>{{ estadoEntrega(props.item, "icono") }}</v-icon>
                </v-avatar>
                {{ estadoEntrega(props.item, "texto") }}
              </v-chip>
            </td>
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
    showMap: false,
    watchMap: false,
    markers: [],
    place: null,
    moment: moment,
    fab: true,
    info: null,
    ventana: false,
    pagination: { descending: true },
    search: "",
    itemsLista: 0,
    usuarios: [],
    selectCategory: { id: "", name: "" },
    selectUsuarios: { id: "", first_name: "" },
    dialog: false,
    selected: 0,
    itemAddress: [],
    inputRulesSave:[
      v => v.length 
    ],
    inputRules: [
      (v) => {
        if(typeof(v) ==='string'){
          return v.length < 1 && `*Este campo no puede estar vacío`
        }else if(typeof(v) === 'number'){
          return v < 1 && `*Este es obligatorio`
        }
        }
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
        text: "Compañía",
        align: "left",
        sortable: true,
        value: "shipping_company_id"
      },
      {
        text: "Responsable",
        align: "left",
        sortable: true,
        value: "worker"
      },
      {
        text: "Estado",

        sortable: false,
        align: "left"
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
    shipping_companies: [],
    editedIndex: -1,
    editedItem: {
      shipping_company_id: "",
      worker_id: "",
      addreesse: "",
      address: ""
    },
    defaultItem: {
      shipping_company_id: "",
      worker_id: "",
      addreesse: "",
      address: ""
    }
  }),
  computed: {
    isDisable() {
      if (this.editedItem.addreesse.length <= 1
          || this.editedItem.address.length <= 1
          || this.editedItem.worker_id <= 1
          || this.editedItem.shipping_company_id < 1){
        return !this.isValid;
        }
    },
    formTitle() {
      return this.editedIndex === -1
        ? "Nueva recepción de paquetes"
        : "Modificar recepción de paquetes";
    },
  },
  watch: {
    dialog(val) {
      val || this.close();
    }
  },
  created() {
    this.initialize();
  },
  methods: {
    setPlace(place) {
      //console.log("place >>>", place);
      /*     this.place = place; */
      if (place) {
        let position = {
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng()
        };
        this.markers = [];
        this.markers.push({
          position: position
        });
      }
    },
    setMarker(e) {
      let position = {
        lat: e.latLng.lat(),
        lng: e.latLng.lng()
      };
      this.place;
      this.markers = [];
      this.markers.push({
        position: position
      });
      this.place = null
    },
    usePlace(place) {
      if (this.place) {
        this.markers = {
          position: {
            lat: this.place.geometry.location.lat(),
            lng: this.place.geometry.location.lng()
          }
        };
        this.place = null;
      }
    },
    saveAddress() {
      if (
        this.markers.length > 0 &&
        this.markers[0].hasOwnProperty("position")
      ) {
        let position = JSON.stringify(this.markers[0].position);
        this.editedItem.address = position;
      }

    },
    PrintThis(e) {
      //editedItem.shipping_company_id
      console.log("event >>>> ", e);
    },
    async initialize() {
      await this.getUsuarios();
      await this.getShippingCompanies();
      await this.getPackages();
    },
    estadoEntrega(item, tipo) {
      //console.info(item,tipo)
      if (item.delivered_date) {
        let estado = {
          color: "green",
          icono: "done",
          texto: "Entregada"
        };
        return estado[tipo];
      } else {
        let estado = {
          color: "red",
          icono: "hourglass_empty",
          texto: "Pendiente"
        };
        return estado[tipo];
      }
    },
    getPackages() {
      nodeInstance
        .get("/package_reception/self/")
        .then(resp => {
          if (resp.status === 200) {
            this.listas = [];
            this.listas = resp.data;
            console.log("packages >>>> ", resp.data);

          }
        })
        .catch(e => {
          console.error(e);
        });
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
          console.log(e);
        });
    },
    getShippingCompanies() {
      nodeInstance
        .get("/shipping_company/")
        .then(resp => {
          if (resp.status === 200) {
            this.shipping_companies = resp.data;
          }
        })
        .catch(e => {
          console.error(e);
        });
    },
    selectItem(item) {
      console.info(item.id)
      console.info(item.address)
      const getItemAddress = JSON.parse(item.address)
      this.itemAddress = {lat:getItemAddress.lat,lng:getItemAddress.lng}
      console.info(this.itemAddress)
      this.selected = item.id;
      this.editedIndex = this.listas.indexOf(item);
      this.editedItem = Object.assign({}, item);
      this.dialog = true;
    },
    deleteItem(item) {
      if (item.hasOwnProperty("id")) {
        let id = item.id;
        nodeInstance
          .delete("/package_reception/" + id)
          .then(resp => {
            if (resp.status === 200) {
              this.initialize();
              this.close()
              this.isSuccess = {
                color: 'success',
                snackbar: true,
                text: 'Eliminado con éxito!',
                timeout: 5000,
                x: null,
                y: 'top'
              }
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
      this.markers = []
      this.itemAddress = []
    },
    save(item) {
      console.log("save >>>", item);
      if (item.hasOwnProperty("id")) {
        console.info(item, 'here to edit')
        nodeInstance
          .put("/package_reception/", {
            id: item.id,
            shipping_company_id: item.shipping_company_id,
            worker_id: item.worker_id,
            addreesse: item.addreesse,
            address: item.address
          })
          .then(resp => {
            if (resp.status === 200) {
              this.initialize();
              this.isSuccess = {
                color: 'success',
                snackbar: true,
                text: 'Editado con éxito!',
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
          return
          })
      } else {
        console.info(item, "here to save");
        nodeInstance
          .post("/package_reception/", item)
          .then(resp => {
            if (resp.status === 200) {
              this.initialize();
              this.isSuccess = {
                color: 'success',
                snackbar: true,
                text: 'Registrado con éxito!',
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
                text: 'No es posible registrar',
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

.absolute-map-container {
  position: absolute;
  background: #fffffb;
  height: 100%;
  width: 100%;
  top: 0;
  left: 0;
  min-width: 100%;
  min-height: 100%;
  z-index: 99999999999999999999;
  display: flex;
  flex-flow: column;
  justify-content: center;
  align-items: center;
}
.google-map-autocomplete {
  border: solid 2px #f1f1f1;
  padding: 0.4rem;
  width: 100%;
  max-width: 100%;
}
.google-btn-add-place {
  background: #e0e0f5;
  display: flex;
  align-items: center;
  font-weight: bold;
  padding: 0.2rem;
  padding-right: 0.7rem;
  padding-left: 0.7rem;
  border-radius: 5px;
}
.btn-disabled,
.btn-disabled .v-icon {
  background: #ececec !important;
  color: #bdbdbd !important;
}
.brown-lighten-5 {
  color: #efebe9 !important;
}
.green-accent-4 {
  color: #00c853 !important;
}

.close-watchMap{
  margin-top: 1em;
}
</style>
