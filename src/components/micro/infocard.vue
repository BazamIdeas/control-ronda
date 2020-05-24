<template>

<div class="powers">
  <div class="power-header">
   <div class="power-header-content">
     <span>
       <h1>{{title}} </h1>
      </span>
      <img :src='getImgUrl(shape)' :alt="title">
   </div>
  <hr
  :style="`background-image: ${styles.gradient} `">
  </div>

  <div class="power-actions">
    <div class="col">
      <v-switch  style="padding-top:0; margin-top:0;"
              v-model="isActive"
              :color="styles.color"
               hide-details
               @click.prevent
            ></v-switch>
    </div>

  <div class="col">
   <button
    @click="goTo()"
    :style="`background-image: ${styles.gradient}`"
    class="button" round >acceder</button>

  </div>

  </div>
</div>
</template>

<script>
export default {
  data: () => ({
    p: "hola"
  }),
  props: ["title", "shape", "styles", "url", "mod"],
  methods: {
    getImgUrl(pic) {
      return require("@/assets/" + pic);
    },
    goTo() {
      if(isActive){
        this.$router.push(this.url);
      }else {
        alert("Aun no ha habilitado esta caracteristica.")
      }
    }
  },
  computed: {
    isActive() {
      let result = this.$store.state.sesion[this.mod];
       return result;
    },

  }
};
</script>
<style scoped>
.powers {
  box-shadow: 2px 2px 11px 1px rgba(0, 0, 0, 0.25);

  background-image: linear-gradient(0deg, #f2f2f2 0%, #ffffff 100%);
  border: solid 1px #e0e0e0;
  border-radius: 7px;
   /* background:url('../assets/draw-bg.svg'); */
}
.power-actions .button {
  color: white;
  font-weight: bold;
  text-transform: capitalize;
  padding: 0.3rem;
  padding-left: 1.5rem;
  padding-right: 1.5rem;
  border-radius: 2rem;
}
.power-header {
  border-radius: 0 0 10% 6%;
  overflow: hidden;
}
.power-header > .power-header-content {
  display: flex;
  justify-content: space-between;
  height: 50px;
  align-items: center;
  background-image: linear-gradient(0deg, #f2f2f2 0%, #ffffff 100%);
}
.power-header span {
  flex: 4;
  text-align: center;
}
.power-header h1 {
  font-size: 1.2rem;
  font-weight: 400;
}
.power-header img {
  position: relative;
  right: -0.5rem;
}
hr {
  height: 3px;
  border: none;
}
.power-actions {
  display: flex;
  padding-top: 3rem;
  padding-bottom: 1rem;
  align-items: baseline;
  justify-content: space-around;
}
</style>
