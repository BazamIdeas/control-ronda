<template>
<v-container grid-list-md >
<!--    <v-layout row wrap>
    <v-flex xs4 >
      <v-card>
        <v-container >
          <h2>Bienvenido {{nombre}}</h2>
          <v-layout row wrap>
            <v-flex xs8 >
              <v-text-field
                label="Cambiar contraseña"
                v-model="pass"
              ></v-text-field>
            </v-flex>
            <v-flex xs4>
            <v-btn color="success" @click="changePass()">Guardar</v-btn>
            </v-flex>
          </v-layout>
        </v-container>
      </v-card>
    </v-flex>
    <v-flex xs4 offset-xs4 >
      <v-card>
        <v-container >
          <h2>{{empresa}}</h2>
          <v-layout row wrap>
            <v-flex xs8 >
              <h5 >Limites de trabajadores: {{usuarios}}</h5>
              <h5>Limite de zonas: {{zonas}}</h5>
            </v-flex>
          </v-layout>
        </v-container>
      </v-card>
    </v-flex>
  </v-layout>
  <v-layout row wrap>
    <v-flex xs4>
      <v-card>
        <v-container grid-list-md >
          <v-layout justify-space-around>
              <v-icon>list</v-icon><h3>Encuestas</h3>
          </v-layout>
          <v-layout justify-space-around>
            <h4 class="estado">Estado: <span v-html=encuestas></span></h4>
          </v-layout>
        </v-container>
      </v-card>
    </v-flex>
    <v-flex xs4>
      <v-card>
        <v-container grid-list-md >
          <v-layout justify-space-around>
              <v-icon>check_box</v-icon><h3>Entrega de turno</h3>
          </v-layout>
          <v-layout justify-space-around>
            <h4 class="estado">Estado: <span v-html=inventario></span></h4>
          </v-layout>
        </v-container>
      </v-card>
    </v-flex>
    <v-flex xs4>
      <v-card>
        <v-container grid-list-md >
          <v-layout justify-space-around>
              <v-icon>list</v-icon><h3>Gestion de tareas</h3>
          </v-layout>
          <v-layout justify-space-around>
            <h4 class="estado">Estado: <span v-html=gestion></span></h4>
          </v-layout>
        </v-container>
      </v-card>
    </v-flex>
    <v-flex xs4>
      <v-card>
        <v-container grid-list-md >
          <v-layout justify-space-around>
              <v-icon>check_box</v-icon><h3>Control de entregas</h3>
          </v-layout>
          <v-layout justify-space-around>
            <h4 class="estado">Estado: <span v-html=entrega></span></h4>
          </v-layout>
        </v-container>
      </v-card>
    </v-flex>
    <v-flex xs4>
      <v-card>
        <v-container grid-list-md >
          <v-layout justify-space-around>
              <v-icon>calendar_today</v-icon><h3>Control de Asistencia</h3>
          </v-layout>
          <v-layout justify-space-around>
            <h4 class="estado">Estado: <span v-html=asistencia></span></h4>
          </v-layout>
        </v-container>
      </v-card>
    </v-flex>
    <v-flex xs4>
      <v-card>
        <v-container grid-list-md >
          <v-layout justify-space-around>
              <v-icon>restore</v-icon><h3>Control de Rondas</h3>
          </v-layout>
          <v-layout justify-space-around>
           <h4 class="estado">Estado: <span v-html=ronda></span></h4>
          </v-layout>
        </v-container>
      </v-card>
    </v-flex>
  </v-layout> -->
        <v-layout>
 <v-flex xs12 md6>
   <h1 class="dashboard-title"> Módulos Habilitados Para su Plan: </h1>
    <br><br>
   </v-flex>
        </v-layout>
              <v-layout row wrap>
        <v-flex md4 xs12 v-for="(item,index) in infocard" :key="index">
          <bz-infocard :title="item.title" :shape="item.shape" :styles="item.style"></bz-infocard>
          <br><br>
        </v-flex>
      </v-layout>

</v-container>
</template>
<script>
import BzInfocard from "@/components/micro/infocard";

export default {
  components: { BzInfocard },
  data: () => ({
    pass: null,
    infocard: [
      {
        title: "ASISTENCIAS",
        shape: "infocards/orange.png",
        style: {
          gradient: "linear-gradient(0deg, #d8801e 0%, #efc231 100%)",
          color: "orange"
        },
        url: "/asistencias"
      },
      {
        title: "RONDA",
        shape: "infocards/blue.png",
        style: {
          gradient: "linear-gradient(0deg, #3b68ae 0%, #5da4e7 100%)",
          color: "blue"
        },
        url: "/rondas"
      },
      {
        title: "ENCUESTAS",
        shape: "infocards/black.png",
        style: {
          gradient: "linear-gradient(0deg, #232325 0%, #5b595a 100%)",
          color: "black"
        },
        url: "/encuestas"
      },
      /*       {
        title: "TURNOS",
        shape: "infocards/green.png",
        style: {
          gradient: "linear-gradient(0deg, #426618 0%, #83de48 100%)",
          color: "green"
        }
      },
      {
        title: "DELIVERY",
        shape: "infocards/red.png",
        style: {
          gradient: "linear-gradient(0deg, #912a12 0%, #ff0101 100%)",
          color: "red"
        }
      }, */
      {
        title: "GESTIÓN",
        shape: "infocards/yellow.png",
        style: {
          gradient: "linear-gradient(0deg, #ffcd07 0%, #ffae00 100%)",
          color: "yellow"
        },
        url: "/gestion"
      }
    ]
  }),
  computed: {
    asistencia() {
      return this.estado(this.$store.state.sesion.assistances_mod);
    },
    ronda() {
      return this.estado(this.$store.state.sesion.routes_mod);
    },
    gestion() {
      return this.estado(this.$store.state.sesion.tasks_mod);
    },
    inventario() {
      return this.estado(this.$store.state.sesion.tasks_mod);
    },
    encuestas() {
      return this.estado(this.$store.state.sesion.tasks_mod);
    },
    entrega() {
      return this.estado(this.$store.state.sesion.delivery_mod);
    },
    usuarios() {
      return this.$store.state.sesion.user_limit;
    },
    zonas() {
      return this.$store.state.sesion.zone_limit;
    },
    nombre() {
      return this.$store.state.admin.first_name;
    },
    empresa() {
      return this.$store.state.admin.condos.name;
    }
  },

  created() {
    this.initialize();
  },

  methods: {
    initialize() {},

    estado(item) {
      if (item) {
        return '<span class="habilitado">Habilitado</span>';
      } else {
        return '<span class="desabilitado">Desabilitado</span>';
      }
    },

    changePass() {
      this.$axios
        .put("/supervisors/change-password/self/", {
          password: this.pass
        })
        .then(resp => {
          this.pass = null;
          if (resp.status === 200) {
            alert("Contraseña modificada");
          }
        })
        .catch(e => {
          this.pass = null;
          console.log(e);
        });
    }
  }
};
</script>

<style>
.dashboard-title {
  border: solid #6161617d 1px;
  color: #616161d6;
  box-shadow: 2px 2px 11px 1px rgba(0, 0, 0, 0.25);
  border-radius: 5%;
  text-align: center;
}
.desabilitado {
  color: crimson;
}
.proximamente {
  color: darkgray;
}

.habilitado {
  color: chartreuse;
}

.estado {
  margin-top: 20px;
}
</style>
