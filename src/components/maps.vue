<template>
  <v-flex xs6>
    <div id="map"></div>
  </v-flex>
</template>


<script>
  export default {
   props: ["verificaciones"],
    data: () => ({
      map: null,
      tileLayer: null,
      points: [],
    }),

    computed: {
      
    },
    created () {
      this.initialize()
    },

    mounted() {
      this.initMap();
    },

    watch: { 
      verificaciones: function(newVal, oldVal) { 
        this.initialize()
      }
    },

    methods: {

      initialize () {
        this.points = this.verificaciones        
      },

      initMap() {
        this.map = L.map('map').setView([this.points[0].latitude, this.points[0].longitude], 18) 
        this.tileLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
          { maxZoom: 100 })
        this.tileLayer.addTo(this.map)
        
        let coord =[]

         this.points.forEach((point) => {
          let marker = L.marker([point.latitude,point.longitude]).bindPopup(point.point.name).addTo(this.map)
          coord.push([point.latitude,point.longitude])
        })
        L.polyline(coord).addTo(this.map)
      },

    }
  }
</script>

<style>
.actived{
  background: #f7f0b2;
}
#map { height: 500px;     z-index: 1;}
</style>

