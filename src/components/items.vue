<template>
  <v-container grid-list-md>
    <v-layout row wrap>
      <v-flex xs1>
        <v-text-field label="Fecha" readonly box :value="moment(lista.date).format('DD-MM-YYYY')"></v-text-field>
      </v-flex>
      <v-flex xs1>
        <v-text-field label="Hora" readonly box :value="moment(lista.date).format('HH:mm')"></v-text-field>
      </v-flex>
      <v-flex xs6>
        <v-text-field label="Nombre de lista" readonly box :value="lista.name"></v-text-field>
      </v-flex>
      <v-flex xs2>
        <v-text-field label="Responsable" readonly box :value="lista.worker.first_name"></v-text-field>
      </v-flex>
      <v-flex xs12>
        <v-toolbar color="grey" dark>
          <v-toolbar-side-icon></v-toolbar-side-icon>
          <v-toolbar-title>Listado de Entregas</v-toolbar-title>
          <v-spacer></v-spacer>
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
                      <!-- <v-text-field v-model="editedItem.address" label="Direccion"></v-text-field> -->
                      <p @click="showMap = !showMap" style="cursor:pointer;">
                        <v-icon
                          :class="editedItem.address ? 'green-accent-4': 'brown-lighten-5'"
                        >where_to_vote</v-icon>
                        {{editedItem.address ? "Ya ha seleccionado ubicación" : "por favor, seleccione una ubicación"}}
                      </p>
                    </v-flex>
                    <v-flex xs12 md6>
                      <v-text-field v-model="editedItem.street_number" type="number" label="N°"></v-text-field>
                    </v-flex>
                    <v-flex xs12 md6>
                      <v-text-field v-model="editedItem.office_department" label="OffDepto"></v-text-field>
                    </v-flex>
                    <v-flex xs12 md6>
                      <v-text-field v-model="editedItem.addressee" label="Destinatario"></v-text-field>
                    </v-flex>
                    <v-flex xs12 md6>
                      <v-text-field v-model="editedItem.code" label="Código"></v-text-field>
                    </v-flex>
                    <v-flex xs12>
                      <v-textarea v-model="editedItem.description" label="Descripción"></v-textarea>
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
            <div class="absolute-map-container" v-if="showMap">
              <div class="absolute-map">
                <GmapAutocomplete
                  class="google-map-autocomplete"
                  placeholder="Ingresa una dirección "
                  @place_changed="setPlace"
                ></GmapAutocomplete>-
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
                    v-if="this.place"
                    label="★"
                    :position="{
          lat: this.place.geometry.location.lat(),
          lng: this.place.geometry.location.lng(),
        }"
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
                  <button class="google-btn-add-place" @click="showMap = !showMap">
                    cancelar
                    <v-icon class color="red accent-4">close</v-icon>
                  </button>
                </div>
              </div>
            </div>
          </v-dialog>
        </v-toolbar>
        <v-data-table
          :headers="headers"
          :items="itemsLista"
          :search="search"
          rows-per-page-text="Número de Filas"
          :pagination.sync="pagination"
          class="elevation-1"
        >
          <template slot="items" slot-scope="props">
            <td>{{ props.item.address }}</td>
            <td>{{ props.item.description }}</td>
            <td>
              <v-chip v-bind:color="estadoEntrega(props.item, 'color')" small text-color="white">
                <v-avatar>
                  <v-icon>{{ estadoEntrega(props.item, "icono") }}</v-icon>
                </v-avatar>
                {{ estadoEntrega(props.item, "texto") }}
              </v-chip>
            </td>
            <td v-if="props.item.date_end">{{ moment(props.item.date_end).format("DD-MM-YYYY") }}</td>
            <td v-else>-</td>
            <td v-if="props.item.date_end">{{ moment(props.item.date_end).format("HH:mm") }}</td>
            <td v-else>-</td>
            <td class="justify-center px-0" :class="{ actived: selected == props.item.id }">
              <v-tooltip bottom>
                <v-icon
                  slot="activator"
                  color="green darken-2"
                  class="mr-2"
                  @click="editItem(props.item)"
                >edit</v-icon>
                <span>Editar</span>
              </v-tooltip>
              <v-tooltip bottom>
                <v-icon
                  slot="activator"
                  color="blue darken-2"
                  class="mr-2"
                  @click="getComentarios(props.item)"
                >comment</v-icon>
                <span>Comentarios</span>
              </v-tooltip>
              <v-tooltip bottom>
                <v-icon slot="activator" color="red darken-2" @click="deleteItem(props.item)">delete</v-icon>
                <span>Eliminar</span>
              </v-tooltip>
            </td>
          </template>
          <template slot="no-data">
            <v-btn color="primary" @click="initialize">Recargar</v-btn>
          </template>
        </v-data-table>
        <div class="text-xs-center pt-2"></div>
      </v-flex>
      <v-dialog v-model="dialogComment" width="500">
        <v-card>
          <v-card-title class="headline grey lighten-2" primary-title>Comentario</v-card-title>
          <v-card-text>{{ comentario.comment }}</v-card-text>
          <img
            v-if="comentario.image_uuid"
            :src="getImage(comentario.image_uuid)"
            class="img-comment"
          />
          <v-divider></v-divider>

          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="primary" flat @click="dialogComment = false">Cerrar</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-layout>
  </v-container>
</template>

<style>
.actived {
  background: #f7f0b2;
}
.img-comment {
  max-width: 420px;
  padding-left: 10%;
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
</style>

<script>
import axios from "../axios.js";
var moment = require("moment");
moment.locale("es");
export default {
  props: ["lista"],
  data: () => ({
    showMap: false,
    markers: [],
    place: null,
    moment: moment,
    fab: true,
    search: "",
    pagination: { descending: true },
    dialog: false,
    selected: 0,
    comentario: "",
    dialogComment: false,
    headers: [
      {
        text: "Direccion",
        align: "left",
        sortable: false,
        value: "date"
      },
      {
        text: "Descripción",
        align: "left",
        sortable: false,
        value: "name"
      },
      {
        text: "Estado",
        align: "left",
        sortable: false,
        value: "name"
      },
      {
        text: "Fecha de Entregada",
        align: "left",
        sortable: true,
        value: "date_end"
      },
      {
        text: "Hora de Entregada",
        align: "left",
        sortable: true,
        value: "date_end"
      },
      {
        text: "Acciones",
        value: "name",
        sortable: false,
        align: "left",
        width: "180"
      }
    ],
    itemsLista: [],
    editedIndex: -1,
    editedItem: {
      address: "",
      description: ""
    },
    defaultItem: {
      address: "",
      description: ""
    }
  }),

  computed: {
    formTitle() {
      return this.editedIndex === -1 ? "Nueva Entrega" : "Modificar Entrega";
    }
  },

  watch: {
    dialog(val) {
      val || this.close();
    },
    lista: function(newVal, oldVal) {
      this.initialize();
    }
  },

  created() {
    this.initialize();
  },

  methods: {
    saveAddress() {
      if (
        this.markers.length > 0 &&
        this.markers[0].hasOwnProperty("position")
      ) {
        console.log("this.markers >>>", this.markers[0].position);
        let position = JSON.stringify(this.markers[0].position);
        this.editedItem.address = position;
      }
    },
    setPlace(place) {
      console.log("place >>>", place);
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
      console.log("event >>>", e);
      this.place;
      this.markers = [];
      this.markers.push({
        position: position
      });
      console.log("event 2 >>>", position);
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
    initialize() {
      if (this.lista.items) this.itemsLista = this.lista.items;
      else this.itemsLista = [];
    },

    editItem(item) {
      this.selected = item.id;
      this.editedIndex = this.itemsLista.indexOf(item);
      this.editedItem = Object.assign({}, item)
      console.log("this.itemsLista", item);
      console.log("editeditem >>>>", this.editedItem);

      const {address} = this.editedItem
      const {lat,lng} = JSON.parse(address)
      this.markers.push({position:{lat,lng}})
      this.dialog = true;
    },

    estadoEntrega(item, tipo) {
      if (item.delivered) {
        let estado = { color: "orange", icono: "done", texto: "Entregada" };
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

    getComentarios(item) {
      this.comentario = item;
      this.selected = item.id;
      this.dialogComment = true;
    },

    getImage(uid) {
      return this.$store.state.conf.api + "/items/image/" + uid;
    },

    deleteItem(item) {
      this.$axios
        .delete("/items/" + item.id + "?trash=true")
        .then(resp => {
          if (resp.status === 200) {
            const index = this.itemsLista.indexOf(item);
            this.itemsLista.splice(index, 1);
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
        this.markers = []
      }, 500);
    },

    save() {
      if (this.editedIndex > -1) {
        this.$axios
          .put("/items/" + this.editedItem.id, {
            address: this.editedItem.address,
            description: this.editedItem.description,
            street_number: this.editedItem.street_number,
            office_department: this.editedItem.office_department,
            addressee: this.editedItem.addressee,
            code: this.editedItem.code,
            delivery: {
              id: this.lista.id
            }
          })
          .then(resp => {
            if (resp.status === 200) {
              Object.assign(this.itemsLista[this.editedIndex], this.editedItem);
            }
          })
          .catch(e => {
            console.log(e);
          });
      } else {
        axios
          .post("/items/", {
            address: this.editedItem.address,
            description: this.editedItem.description,
            street_number: this.editedItem.street_number,
            office_department: this.editedItem.office_department,
            addressee: this.editedItem.addressee,
            code: this.editedItem.code,
            delivery: {
              id: this.lista.id
            }
          })
          .then(resp => {
            if (resp.status === 201) {
              resp.data.address = this.editedItem.address;
              resp.data.description = this.editedItem.description;
              resp.data.street_number = this.editedItem.street_number;
              resp.data.office_department = this.editedItem.office_department;
              resp.data.addressee = this.editedItem.addressee;
              resp.data.code = this.editedItem.code;
              this.itemsLista.push(resp.data);
            }
          })
          .catch(e => {
            console.log(e);
          });
      }
      this.close();
    }
  }
};
</script>
