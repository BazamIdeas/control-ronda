<template>
<v-container grid-list-md >
    <v-toolbar absolute>
      <v-spacer></v-spacer>
      <v-toolbar-items>
        <v-btn flat to='/asistencia'>EMPLEADOS</v-btn>
        <v-btn flat to='/configuracion-asistencia'>CONFIGURACIÓN</v-btn>
      </v-toolbar-items>
  </v-toolbar>
  <v-layout row wrap  mt-5>
    <v-flex xs5>
      <v-card>
        <v-toolbar color="grey" dark>
          <v-toolbar-title>Parametros</v-toolbar-title>
          <v-spacer></v-spacer>
          <v-btn icon @click="initialize ()">
            <v-icon>autorenew</v-icon>
          </v-btn>
        </v-toolbar>
        <v-container grid-list-md >
          <v-layout row wrap>
            <v-flex xs8>
              <v-text-field
              v-model= jornada
                label="Horas de Jornada Laboral"
              ></v-text-field>
            </v-flex>
            <v-flex xs4>
            <v-btn color="success" @click="changeJornada()">Guardar</v-btn>
            </v-flex>
          </v-layout>
          <v-layout row wrap>
            <v-flex xs8>
              <v-text-field
              v-model="valorHora"
                label="Valor por hora "
              ></v-text-field>
            </v-flex>
            <v-flex xs4>
            <v-btn color="success" @click="changeValorHora()">Guardar</v-btn>
            </v-flex>
          </v-layout>
          <v-layout row wrap>
            <v-flex xs8>
              <v-text-field
              v-model="porcentaje"
                label="% por hora extra"
              ></v-text-field>
            </v-flex>
            <v-flex xs4>
            <v-btn color="success" @click="changePorcentaje()">Guardar</v-btn>
            </v-flex>
          </v-layout>
          <v-layout row wrap>
            <v-flex xs12>
              <v-text-field
               v-model="valueExtra"
                label="Valor por hora extra"
                readonly
                box
              ></v-text-field>
            </v-flex>
          </v-layout>
        </v-container>
      </v-card>
    </v-flex>
    <v-flex xs5 >
      <v-card>
        <v-toolbar color="grey" dark>
          <v-toolbar-title>Feriados</v-toolbar-title>
          <v-spacer></v-spacer>
          <v-btn icon @click="initialize ()">
            <v-icon>autorenew</v-icon>
          </v-btn>
        </v-toolbar>
        <v-container >
          <v-layout align-center justify-center>
            <v-flex xs12 >
              <v-data-table
              :headers="headers"
              :items="days"
              rows-per-page-text= "Número de Filas">
              <template slot="items" slot-scope="props">
                <td >{{ moment(props.item.date).format('DD-MM-YYYY') }}</td>
                <td class="justify-center px-0">
                  <v-tooltip bottom>
                    <v-icon  slot="activator" color="red darken-2" @click="deleteFeriado(props.item)">delete</v-icon>
                    <span>Eliminar</span>
                  </v-tooltip>
                </td>
              </template>
              <template slot="no-data">
                <v-btn color="primary" @click="initialize">Recargar</v-btn>
              </template>
            </v-data-table>
            </v-flex>
          </v-layout>
          <v-layout row wrap>
            <v-flex xs8>
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
              <v-text-field
              slot="activator"
              v-model="feriado"
              label="Nuevo feriado"
              readonly
            ></v-text-field>
            <v-date-picker v-model="date" locale="es-419" @input="$refs.menu.save(date)" ></v-date-picker>
            </v-menu>
            </v-flex>
            <v-flex xs4>
            <v-btn color="success" @click="changeDays()">Agregar</v-btn>
            </v-flex>
          </v-layout>
        </v-container>
      </v-card>
    </v-flex> 
  </v-layout>
</v-container>
</template>


<script>

  import axios from '../axios.js'

  var moment = require ('moment')
  moment.locale('es')

  export default {

    data: () => ({
      moment: moment,
      menu: false,
      date: null,
      dialog: false,
      fab: true,
      pass: null,
      jornada: null,
      valorHora: null,
      porcentaje: null,
      days: [],
      headers: [
        {
          text: 'Fecha',
          align: 'left',
        },
        { text: 'Eliminar', 
        value: 'name',  }
      ],
    }),

    computed: {
      valueExtra: function () {
        return (( parseInt(this.valorHora) * (parseInt(this.porcentaje) / 100)) + parseInt(this.valorHora))
      },

      feriado: function (){
        if (!this.date){
          return null
        }
        else{
          return moment(this.date).format('YYYY-MM-DD')
        }
      }
    },

    watch: {

    },

    created () {
      this.initialize()
    },

    methods: {
      initialize () {

        axios.get('/condos/self')
        .then(resp => {
          if(resp.status === 200){
            if (resp.data.holidays)
              this.days = resp.data.holidays
          }
        })
        .catch(e => {
          console.log(e)
        })
        this.jornada =  parseInt(this.$store.state.sesion.working_hours)
        this.valorHora =  parseFloat(this.$store.state.sesion.hour_value)
        this.porcentaje =  parseFloat(this.$store.state.sesion.extra_hour_increase)
      },

      changeJornada () {
        let edicion = this.$store.state.admin.condos
        edicion.working_hours = parseInt(this.jornada)
        this.cambiar(edicion) 
      },

      changeValorHora () {
        let edicion = this.$store.state.admin.condos
        edicion.hour_value = parseInt(this.valorHora)
        this.cambiar(edicion) 
      },
      changePorcentaje () {
        let edicion = this.$store.state.admin.condos
        edicion.extra_hour_increase = parseInt(this.porcentaje)
        this.cambiar(edicion) 
      },

      cambiar (atributo){
        this.$axios.put('/condos/'+this.$store.state.sesion.id, atributo)
          .then(resp => {
            if(resp.status === 200){
              alert('Cambios realizados')
            }
          })
          .catch(e => {
            console.log(e)
          })
      },

      deleteFeriado (item) {
        this.$axios.delete('/holidays/'+item.id+'?trash=true')
          .then(resp => {
            if(resp.status === 200){
              const index = this.days.indexOf(item)
              this.days.splice(index, 1)
            }
          })
          .catch(e => {
            console.log(e)
          })
      },

      changeDays () {
        if (this.feriado){
        axios.post('/holidays/', {
              date : this.feriado
            })
          .then(resp => {
            if(resp.status === 201){
              this.days.push(resp.data)
              alert("Dia feriado agregado")
            }
          })
          .catch(e => {
            console.log(e)
          })
        }
        else{
          alert("Fecha invalida")
        }
      }

    }
  }
</script>

