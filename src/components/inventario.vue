 
<!-- 
resolucion de hoy
 mejor evitarse crear otra logica de expansion panel. 
 mejor hacer que cuando existan incidencias de los items no se muestre el boton de eventos
 en cambio, que cuando no hayan incidencias se muestre el boton de eventos
 asi se expanderan los 2 siempre, pero solo se visualizara el que tenga data

 TODO: hacer la logica de insercion de eventos al expanded panel, agregar un loader o efecto.
-->
<template>
  <v-container grid-list-md mt-5>
    <v-toolbar absolute>
      <v-spacer></v-spacer>
      <v-toolbar-items>
        <v-btn flat to="/productos">ITEMS</v-btn>
        <v-btn flat to="/inventario">ENTREGA DE TURNO</v-btn>
      </v-toolbar-items>
    </v-toolbar>
    <v-flex xs12>
      <v-layout row wrap>
        <v-flex xs3 mt-3>
          <h2>Reporte de entrega de Turnos</h2>
        </v-flex>
        <v-flex xs3>
          <v-radio-group v-model="tipoInforme" :mandatory="false" row @change="initialize">
            <v-radio label="Diario" value="diario"></v-radio>
            <v-radio label="Mensual" value="mensual"></v-radio>
          </v-radio-group>
        </v-flex>
        <v-flex xs3>
          <v-menu
            ref="menu"
            :close-on-content-click="false"
            v-model="menu"
            :nudge-right="40"
            v-if="tipoInforme == 'diario'"
            lazy
            transition="scale-transition"
            offset-y
            full-width
            min-width="290px"
          >
            <v-text-field slot="activator" v-model="fecha" label="Dia" readonly></v-text-field>
            <v-date-picker
              v-model="date"
              locale="es-419"
              @input="$refs.menu.save(date)"
              @change="initialize"
            ></v-date-picker>
          </v-menu>
          <v-menu
            ref="menu"
            :close-on-content-click="false"
            v-model="menu"
            :nudge-right="40"
            v-if="tipoInforme == 'mensual'"
            lazy
            transition="scale-transition"
            offset-y
            full-width
            min-width="290px"
          >
            <v-text-field slot="activator" v-model="mes" label="Mes" readonly></v-text-field>
            <v-date-picker
              v-model="date"
              locale="es-419"
              @input="$refs.menu.save(date)"
              @change="initialize"
              type="month"
            ></v-date-picker>
          </v-menu>
        </v-flex>
        <v-flex xs3 pl-4>
          <!--<v-chip @click="excel()" >
            <v-avatar>
              <v-icon>arrow_downward</v-icon>
            </v-avatar>
            Excel
          </v-chip>-->
          <v-chip @click="pdf()">
            <v-avatar>
              <v-icon>arrow_downward</v-icon>
            </v-avatar>Pdf
          </v-chip>
        </v-flex>
      </v-layout>
      <v-layout row wrap>
        <v-flex xs12>
          <v-toolbar flat color="white">
            <v-text-field
              v-model="search"
              append-icon="search"
              label="Buscar por trabajador o comentario"
              single-line
              hide-details
            ></v-text-field>
          </v-toolbar>
          <v-data-table
            :headers="headers"
            :items="inventario"
            :search="search"
            :expand="expand"
            :pagination.sync="pagination"
            rows-per-page-text="Número de Filas"
            class="elevation-1"
          >
            <template slot="items" slot-scope="props">
              <td>{{ moment(props.item.date).format('DD/MM/YYYY') }}</td>
              <td>{{ moment(props.item.date).format('HH:mm') }}</td>
              <td>{{ props.item.workers.first_name }}</td>
              <td>{{ props.item.comment }}</td>
              <td>
                <!-- <v-chip small> {{ props.item.estado }}</v-chip> -->
                <v-chip
                  color="red"
                  small
                  text-color="white"
                  v-if="props.item.occurrences"
                  @click="props.expanded = !props.expanded"
                >!</v-chip>
                <v-chip
                  color="white"
                  small
                  v-if="props.item.foto"
                  @click="props.expanded = !props.expanded"
                >
                  <v-icon>camera_alt</v-icon>
                </v-chip>
                <v-chip
                  color="red"
                  class="rounded-expand-button"
                  text-color="white"
                  small
                  @click="GetShiftChangeEvents(props)"
                >
                  <v-icon>event</v-icon>
                </v-chip>
              </td>
            </template>
            <template slot="expand" slot-scope="props">
              <div>
                              <v-card flat>
                <v-list>
                  <v-list-tile
                    v-for="ocurrencia in props.item.occurrences"
                    :key="ocurrencia.id"
                    avatar
                  >
                    <v-list-tile-content>
                      <v-list-tile-title v-html="ocurrencia.objects.name"></v-list-tile-title>
                      <v-list-tile-sub-title v-html="ocurrencia.comment"></v-list-tile-sub-title>
                    </v-list-tile-content>

                    <v-list-tile-action>
                      <v-btn small color="primary" @click="getComentarios(ocurrencia)">Detalles</v-btn>
                    </v-list-tile-action>
                  </v-list-tile>
                </v-list>
              </v-card>
                    <v-card flat> DATA HERE</v-card>
              </div>
            </template>


            <template slot="no-data">
              <h3>No hay registros en esta fecha</h3>
              <v-btn small color="primary" @click="initialize">Recargar</v-btn>
            </template>
          </v-data-table>
        </v-flex>
        <v-dialog
          v-model="ventanaComentarios"
          fullscreen
          hide-overlay
          transition="dialog-bottom-transition"
        >
          <v-card>
            <v-layout justify-end>
              <v-btn flat @click.native="ventanaComentarios = false">Cerrar</v-btn>
            </v-layout>
            <bz-ocurrencia v-if="comentarios" v-bind:ocurrencia="comentarios"></bz-ocurrencia>
          </v-card>
        </v-dialog>
      </v-layout>
    </v-flex>
  </v-container>
</template>


<script>
import BzOcurrencia from "./ocurrencia.vue";
var moment = require("moment");
var jsPDF = require("jspdf");
let meses = new Array(
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre"
);
let d = new Date();
let m = d.getMonth();
var fileSaver = require("file-saver");
var xlsx = require("xlsx");
moment.locale("es");
export default {
  components: { BzOcurrencia },
  data: () => ({
    moment: moment,
    expand: false,
    fechaActual: moment().format("DD-MM-YYYY"),
    search: "",
    menu: false,
    menu2: false,
    date: null,
    comentarios: "",
    pagination: { descending: true },
    ventanaComentarios: false,
    dialog: false,
    tipoInforme: "diario",
    selected: 0,
    columns: [
      { title: "FECHA", dataKey: "fecha" },
      { title: "HORA", dataKey: "hora" },
      { title: "TRABAJADOR", dataKey: "trabajador" },
      { title: "COMENTARIO", dataKey: "comentario" },
      { title: "ESTADO", dataKey: "estado" }
    ],

    headers: [
      {
        text: "Fecha",
        sortable: true,
        value: "date",
        align: "center"
      },
      { text: "Hora", value: "date", align: "center", sortable: false },
      {
        text: "Trabajador",
        value: "worker.name",
        align: "center",
        sortable: true
      },
      {
        text: "Comentario",
        value: "comment",
        align: "center",
        sortable: false
      },
      { text: "Estado", value: "data", align: "center", sortable: false }
    ],
    inventario: [],
    editedIndex: -1
  }),

  computed: {
    fecha: function() {
      if (!this.date) {
        return this.fechaActual;
      } else {
        return moment(this.date).format("DD-MM-YYYY");
      }
    },

    mes: function() {
      if (!this.date) {
        return meses[m];
      } else {
        let dateNew = this.date.split("-");
        //this.initialize(dateNew[1],dateNew[0])
        return meses[parseInt(dateNew[1]) - 1];
      }
    }
  },

  created() {
    this.initialize();
  },

  methods: {
    GetShiftChangeEvents(props) {
      console.log("props >>>>, ", props);
      props.item.aly = "funciona esto";
      props.expand2 = true
      if (props.expanded) {
        console.log("vino aca 1 ", props.expanded);
        props.expanded = !props.expanded;
        setTimeout(() => {
          props.expanded = !props.expanded;
        }, 700);
      } else {
        console.log("vino aca 2 ", props.expanded);
        props.expanded = !props.expanded;
      }
    },
    initialize() {
      let peticion = {
        diario: moment(this.fecha, "DD-MM-YYYY").format("YYYY-MM-DD"),
        mensual:
          moment(this.fecha, "DD-MM-YYYY").format("YYYY") +
          "/" +
          moment(this.fecha, "DD-MM-YYYY").format("MM")
      };

      this.$axios
        .get("/condos/checks/" + peticion[this.tipoInforme])
        .then(resp => {
          if (resp.status === 200) {
            this.inventario = resp.data;
            this.inventario.forEach(element => {
              element.estado = element.occurrences
                ? "Aviso de incidencia"
                : "Sin incidencias";
              if (element.occurrences) {
                element.occurrences.forEach(ocurrencia => {
                  element.foto = ocurrencia.image_uuid ? true : false;
                });
              }
            });
          } else {
            alert("No hay registros en esta fecha");
          }
        })
        .catch(e => {
          this.inventario = [];
          alert("No hay registros en esta fecha");
          console.log(e);
        });
    },
    pdf() {
      let fechaReporte = this.tipoInforme == "diario" ? this.fecha : this.mes;

      var doc = new jsPDF("landscape");
      doc.text("Sistema de control de ronda", 15, 20);
      doc.setFontSize(12);
      doc.text("Empresa: " + this.$store.state.admin.condos.name, 15, 25);
      const file = "Reporte de entrega de turnos -" + fechaReporte + ".pdf";
      let tabla = [];

      this.inventario.forEach(entrega => {
        let comentario = entrega.comment ? entrega.comment : "-";

        tabla.push({
          fecha: moment(entrega.date).format("DD/MM/YYYY"),
          hora: moment(entrega.date).format("HH:mm"),
          trabajador: entrega.workers.first_name,
          comentario: comentario,
          estado: entrega.estado
        });
      });

      doc.autoTable(this.columns, tabla, { margin: { top: 40 } });
      doc.save(file);
    },

    excel() {
      var wb = xlsx.utils.book_new();
      wb.Props = {
        Title: "Sistema de control de ronda"
      };
      wb.SheetNames.push("Informe");
      var ws_data = [
        ["Sistema de control de ronda"],
        [
          "Empresa: " + this.$store.state.admin.condos.name,
          "Empleado: " + this.user.worker.first_name
        ],
        ["ZONA", "PUNTO", "FECHA", "HORA", "COMENTARIO", "LATITUD", "LONGITUD"]
      ];
      this.inventario.forEach(entrega => {
        let comentario = "-";
        if (entrega.watcher_comment) comentario = entrega.watcher_comment;
        ws_data.push([
          entrega.point.zones.name,
          entrega.point.name,
          moment(entrega.date).format("DD/MM/YYYY"),
          moment(entrega.date).format("HH:mm"),
          comentario,
          entrega.latitude,
          entrega.longitude
        ]);
      });
      var ws = xlsx.utils.aoa_to_sheet(ws_data);
      wb.Sheets["Informe"] = ws;
      var wbout = xlsx.write(wb, { bookType: "xlsx", type: "binary" });
      function s2ab(s) {
        var buf = new ArrayBuffer(s.length);
        var view = new Uint8Array(buf);
        for (var i = 0; i < s.length; i++) view[i] = s.charCodeAt(i) & 0xff;
        return buf;
      }
      const file =
        "Reporte de ronda -" +
        this.user.worker.first_name +
        "-" +
        moment().format("DD/MM/YYYY") +
        ".xlsx";
      saveAs(
        new Blob([s2ab(wbout)], { type: "application/octet-stream" }),
        file
      );
    },

    getComentarios(item) {
      this.comentarios = item;
      this.ventanaComentarios = true;
    }
  }
};
</script>

<style>
.actived {
  background: #f7f0b2;
}
.rounded-expand-button .v-chip__content {
  padding: 0.3rem !important;
  cursor: pointer;
}
</style>
