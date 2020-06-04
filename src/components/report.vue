<template>
  <v-container grid-list-md>
    <v-layout row wrap>
      <v-flex xs10 class="white" offset-xs1>
        <v-card>
          <v-toolbar color="grey" dark>
            <v-toolbar-side-icon></v-toolbar-side-icon>
            <v-toolbar-title>Reporte mensual de asistencia - Empleado: {{ empleado.first_name }} {{ empleado.last_name }}</v-toolbar-title>
            <v-spacer></v-spacer>
            <v-chip @click="excel()" small>
              <v-avatar>
                <v-icon>arrow_downward</v-icon>
              </v-avatar>Excel
            </v-chip>
            <v-chip @click="pdf()" small>
              <v-avatar>
                <v-icon>arrow_downward</v-icon>
              </v-avatar>Pdf
            </v-chip>
          </v-toolbar>
          <v-container grid-list-md>
            <v-layout row wrap>
              <v-flex xs12 sm6 md2>
                <v-text-field label="Horas Jornada" v-model="jornada" readonly></v-text-field>
              </v-flex>
              <v-flex xs12 sm6 md2>
                <v-text-field label="Valor Hora" v-model="valor_hora" prefix="$"></v-text-field>
              </v-flex>
              <v-flex xs12 sm6 md2>
                <v-text-field label="%  Hora extra" v-model="porcentaje" prefix="%"></v-text-field>
              </v-flex>
              <v-flex xs12 sm6 md2>
                <v-text-field label="Tiempo extra" v-model="priceHour" prefix="$" readonly></v-text-field>
              </v-flex>
              <v-flex xs12 sm6 md2>
                <v-text-field
                  label="Pagar adicional"
                  v-model="mountHour"
                  readonly
                  prefix="$"
                  color="success"
                ></v-text-field>
              </v-flex>
              <v-flex xs12 sm6 md2>
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
                  <v-text-field slot="activator" v-model="mes" label="Mes" readonly></v-text-field>
                  <v-date-picker
                    v-model="date"
                    locale="es-419"
                    @input="$refs.menu.save(date)"
                    type="month"
                  ></v-date-picker>
                </v-menu>
              </v-flex>
            </v-layout>
          </v-container>
          <v-data-table :headers="headers" :items="assistances" hide-actions class="elevation-1">
            <template slot="items" slot-scope="props">
              <td>{{ props.item.day }}</td>
              <td>{{ moment(props.item.entry.date).format('HH:mm') }}</td>
              <td>{{ inicio_colacion(props.item) }}</td>
              <td>{{ final_colacion(props.item) }}</td>
              <td>{{ moment(props.item.exit.date).format('DD') }}</td>
              <td>{{ moment(props.item.exit.date).format('HH:mm') }}</td>
              <td>{{ conversorHoras(props.item) }}</td>
              <td>{{ diferencial(props.item)}}</td>
              <td>
                <v-icon v-if="props.item.is_holiday" large color="green darken-2">done</v-icon>
              </td>
            </template>
            <template slot="no-data">
              <v-btn color="primary" @click="initialize">Recargar</v-btn>
            </template>
          </v-data-table>
        </v-card>
      </v-flex>
    </v-layout>
  </v-container>
</template>


<script>
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
var moment = require("moment");
require("moment-duration-format");
moment.locale("es");

var jsPDF = require("jspdf");
var fileSaver = require("file-saver");
var xlsx = require("xlsx");
require("jspdf-autotable");
export default {
  props: ["empleado", "mes_numero"],
  data: () => ({
    moment: moment,
    menu: false,
    date: null,
    totalDifCount: [],
    totalHoursCount: [],
    dialog: false,
    dateNew: null,
    jornada: null,
    valor_hora: null,
    porcentaje: null,
    total_horas_extras: 0,
    total_horas: 0,
    mesN: moment(d).format("MM"),
    anio: moment(d).format("YYYY"),
    hourSum: null,

    headers: [
      {
        text: "Dia",
        value: "first_name"
      },
      {
        text: "Ingreso",
        value: "last_name"
      },
      {
        text: "Inicio Colación",
        value: "status"
      },
      {
        text: "Termino Colación",
        value: "name"
      },
      {
        text: "Dia de Salida",
        value: "name"
      },
      {
        text: "Hora Salida",
        value: "name"
      },
      {
        text: "Tiempo Trabajado",
        value: "name"
      },
      {
        text: "Diferencial",
        value: "name"
      },
      {
        text: "Festivo",
        value: "name"
      }
    ],
    columns: [
      { title: "DIA", dataKey: "dia" },
      { title: "INGRESO", dataKey: "entrada" },
      { title: "INICIO COLACION", dataKey: "inicio_colacion" },
      { title: "TERMINO COLACION", dataKey: "final_colacion" },
      { title: "DIA SALIDA", dataKey: "fecha_salida" },
      { title: "SALIDA", dataKey: "salida" },
      { title: "TIEMPO TRABAJADO", dataKey: "horas" },
      { title: "DIFERENCIAL", dataKey: "diferencial" },
      { title: "FESTIVO", dataKey: "festivo" }
    ],
    assistances: []
  }),

  watch: {
    empleado: function(newVal, oldVal) {
      this.date = null;
      if (this.mes_numero) {
        this.mesN = this.mes_numero;
      }
      this.initialize(this.mesN, this.anio);
    },
    mes_numero: function(newVal, oldVal) {
      this.date = null;
      if (this.mes_numero) {
        this.mesN = this.mes_numero;
      }
      this.initialize(this.mesN, this.anio);
    }
  },

  computed: {
    calculeTotalHours() {
      const totalDurations = durations
        .slice(1)
        .reduce(
          (prev, cur) => moment.duration(cur).add(prev),
          moment.duration(durations[0])
        );
    },
    priceHour: function() {
      let vh = parseFloat(this.valor_hora);
      let percent = parseFloat(this.porcentaje);
      return parseFloat(vh * (percent / 100) + vh);
    },

    mountHour: function() {
      let priceHour = parseFloat(this.priceHour);
      return (
        parseFloat(this.total_horas_extras) * parseFloat(priceHour)
      ).toFixed(2);
    },
    mes: function() {
      if (this.mes_numero) {
        return meses[this.mes_numero - 1];
      }
      if (!this.date) {
        return meses[m];
      } else {
        let dateNew = this.date.split("-");
        this.initialize(dateNew[1], dateNew[0]);
        return meses[parseInt(dateNew[1]) - 1];
      }
    }
  },

  created() {
    if (this.mes_numero) {
      this.mesN = this.mes_numero;
    }

    this.initialize(this.mesN, this.anio);
  },

  methods: {
    initialize(m, y) {
      var loader = this.$loading.show({
        loader: "dots"
      });
      this.$axios
        .get("/workers/" + this.empleado.id + "/data/" + y + "/" + m)
        .then(resp => {
          if (resp.status === 200) {
            let dias = [];
            this.total_horas_extras = 0;
            this.total_horas = 0;

            // Obteniendo todas las claves del JSON
            for (var dia in resp.data.month_data.days) {
              dias.push(resp.data.month_data.days[dia]);
              this.total_horas_extras += Math.abs(
                resp.data.month_data.days[dia].extra_worked_hours
              );
              this.total_horas += Math.abs(
                resp.data.month_data.days[dia].total_worked_hours
              );

              //mark
            }

            this.assistances = dias;

            this.jornada = parseFloat(this.$store.state.sesion.working_hours);
            this.valor_hora = parseFloat(this.$store.state.sesion.hour_value);
            this.porcentaje = parseFloat(
              this.$store.state.sesion.extra_hour_increase
            );

            loader.hide()
          } else {
          loader.hide()
            alert("No hay reportes para esta fecha");
          }
        })
        .catch(e => {
           loader.hide()
          this.assistances = [];
          alert("No hay reportes para esta fecha");
        });
    },

    printElem() {
      if (!this.date) {
        let mes = this.mesN;
        let anio = this.anio;
        this.download(anio, mes);
      } else {
        let dateNew = this.date.split("-");
        let mes = dateNew[1];
        let anio = dateNew[0];
        this.download(anio, mes);
      }
    },

    download(anio, mes) {
      this.$axios
        .get(
          "/workers/" +
            this.empleado.id +
            "/data/" +
            anio +
            "/" +
            mes +
            "/download"
        )
        .then(resp => {
          if (resp.status === 200) {
            let csvContent = "data:text/csv;charset=utf-8," + resp.data;
            const data = encodeURI(csvContent);
            const link = document.createElement("a");
            link.setAttribute("href", data);
            const file =
              "Reporte Mensual: " +
              this.empleado.first_name +
              " " +
              this.empleado.last_name +
              "-" +
              meses[parseInt(mes) - 1] +
              "/" +
              anio +
              ".csv";
            link.setAttribute("download", file);
            link.click();
          } else {
            alert("No hay reportes para esta fecha");
          }
        })
        .catch(e => {
          alert("No hay reportes para esta fecha");
        });
    },

    inicio_colacion(item) {
      if (item.hasOwnProperty("break")) {
        return moment(item.break.date).format("HH:mm");
      } else {
        return "-";
      }
    },
    final_colacion(item) {
      if (item.hasOwnProperty("finish_break")) {
        return moment(item.finish_break.date).format("HH:mm");
      } else {
        return "-";
      }
    },
    conversorHoras(el, toPrint = 0) {
      var diff = moment.duration(
        moment(el.exit.date).diff(moment(el.entry.date))
      );
      var res = moment.duration(diff.asMilliseconds(), "milliseconds");
      if (toPrint) {
        return diff;
      }
      return res.format("HH:mm [minutos]");
    },
    diferencial(el, toPrint = 0) {
      // toPrint para saber si se llama desde
      // las funciones de exportar reportes
      // para devolver un formato iterable
      // para calcular el tiempo total

      let rule = this.$store.state.sesion.working_hours;
      var diff = moment.duration(
        moment(el.exit.date).diff(moment(el.entry.date))
      );
      var res = moment.duration(diff.asMilliseconds(), "milliseconds");
      let comparator = res.format("HH.mm").toString() - rule;
      comparator = comparator.toFixed(2);
      if (toPrint && comparator <= 0) {
        return false;
      }
      if (toPrint) {
        return comparator;
      }
      if (comparator <= 0) {
        return "sin diferencial";
      }
      let str = comparator.toString().replace(".", ":") + " minutos";
      return str;
    },
    getTotalDiferencial() {
      let times = [];
      let t = "";
      //totalDifCount
      for (let i = 0; i < this.assistances.length; i++) {
        let diff = this.diferencial(this.assistances[i], true);

        if (diff != false) {
          times.push(diff);
        }
        if (i == this.assistances.length - 1) {
          t = times.reduce((prev, cur) => parseFloat(prev) + parseFloat(cur));
          console.log("reduced", t);
          let split = t.toString().split(".");
          let hours = split[1] > 60 ? parseInt(split[0]) + 1 : split[0];
          let minutes = split[1] > 60 ? parseInt(split[1]) - 60 : split[1];
          return `${hours}:${minutes} minutos`;
        }
      }
      //console.log("times > ", times);
    },
    getTotalHours() {
      let times = [];
      let response = "";
      let t = 0;
      //totalDifCount

      for (let i = 0; i < this.assistances.length; i++) {
        let diff = this.conversorHoras(this.assistances[i], true);

        if (diff != false) {
          times.push(diff);
        }
        if (i === this.assistances.length - 1) {
          for (let index = 0; index < times.length; index++) {
            let el = times[index];
            let hour = moment.duration(el.asMilliseconds(), "milliseconds");

            let replace = hour.format("HH:mm").replace(":", ".");
            console.log(replace);
            t = parseFloat(replace) + t;
            if (index === times.length - 1) {
              let split = t
                .toFixed(2)
                .toString()
                .split(".");
              let hours = split[1] > 60 ? parseInt(split[0]) + 1 : split[0];
              let minutes = split[1] > 60 ? parseInt(split[1]) - 60 : split[1];
              response = `${hours}:${minutes} minutos`;
              return response;
            }
          }
        }
      }
      //console.log("times > ", times);
    },
    pdf() {
      /*       var loader = this.$loading.show({
        loader: "dots"
      }); */
      var doc = new jsPDF("landscape");
      doc.text("Reporte mensual de asistencia", 15, 20);
      doc.setFontSize(12);
      doc.text(
        "Mes: " + this.mes + " | Empleado: " + this.empleado.first_name,
        15,
        25
      );

      const file =
        "Reporte Mensual de asistencia: " +
        this.empleado.first_name +
        "-" +
        this.mes +
        "-" +
        this.anio +
        ".pdf";
      let tabla = [];

      this.assistances.forEach(asistencia => {
        let festivo = asistencia.is_holiday ? "SI" : "NO";

        let ini_break = asistencia.hasOwnProperty("break")
          ? moment(asistencia.break.date).format("HH:mm")
          : "-";
        let finish_break = asistencia.hasOwnProperty("finish_break")
          ? moment(asistencia.finish_break.date).format("HH:mm")
          : "-";
        tabla.push({
          dia: asistencia.day,
          entrada: moment(asistencia.entry.date).format("HH:mm"),
          inicio_colacion: ini_break,
          final_colacion: finish_break,
          fecha_salida: moment(asistencia.exit.date).format("DD"),
          salida: moment(asistencia.exit.date).format("HH:mm"),
          horas: this.conversorHoras(asistencia),
          diferencial: this.diferencial(asistencia),
          festivo: festivo
        });
      });
      tabla.push({
        dia: "TOTAL",
        horas: this.getTotalHours(),
        diferencial: this.getTotalDiferencial()
      });
      doc.autoTable(this.columns, tabla, {
        halign: "center",
        margin: { top: 35 }
      });
      /*       loader.hide() */
      doc.save(file);
    },

    excel() {
      var loader = this.$loading.show({
        loader: "dots"
      });
      var wb = xlsx.utils.book_new();
      wb.Props = {
        Title: "Reporte mensual de asistencia"
      };
      wb.SheetNames.push("Informe");
      var ws_data = [
        ["Reporte mensual de asistencia"],
        ["Mes: " + this.mes, "Empleado: " + this.empleado.first_name],
        [
          "DIA",
          "INGRESO",
          "INICIO COLACIÓN",
          "TERMINO COLACIÓN",
          "DIA SALIDA",
          "HORA",
          "TIEMPO TRABAJADO",
          "DIFERENCIAL",
          "FESTIVO"
        ]
      ];

      this.assistances.forEach(asistencia => {
        let festivo = asistencia.is_holiday ? "SI" : "NO";

        let ini_break = asistencia.hasOwnProperty("break")
          ? moment(asistencia.break.date).format("HH:mm")
          : "-";
        let finish_break = asistencia.hasOwnProperty("finish_break")
          ? moment(asistencia.finish_break.date).format("HH:mm")
          : "-";

        ws_data.push([
          asistencia.day,
          moment(asistencia.entry.date).format("HH:mm"),
          ini_break,
          finish_break,
          moment(asistencia.exit.date).format("DD"),
          moment(asistencia.exit.date).format("HH:mm"),
          this.conversorHoras(asistencia),
          this.diferencial(asistencia),
          festivo
        ]);
      });

      ws_data.push([
        "TOTAL",
        "",
        "",
        "",
        "",
        "",
        this.getTotalHours(),
        this.getTotalDiferencial()
      ]);
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
        "Reporte Mensual de asistencia: " +
        this.empleado.first_name +
        "-" +
        this.mes +
        "-" +
        this.anio +
        ".xlsx";

      loader.hide();
      saveAs(
        new Blob([s2ab(wbout)], { type: "application/octet-stream" }),
        file
      );
    }
  }
};
</script>

<style>
.actived {
  background: #f7f0b2;
}
.img {
  width: 100%;
}

table.v-table tbody td:first-child,
table.v-table tbody td:not(:first-child),
table.v-table tbody th:first-child,
table.v-table tbody th:not(:first-child),
table.v-table thead td:first-child,
table.v-table thead td:not(:first-child),
table.v-table thead th:first-child,
table.v-table thead th:not(:first-child) {
  padding: 0 8px !important;
}
</style>
