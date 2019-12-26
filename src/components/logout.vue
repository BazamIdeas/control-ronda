<template>

</template>

<script>
export default {
  created() {
    this.$store.commit('FINISH_SESION')
    localStorage.removeItem('bazam-token-control')
    this.$router.push('/')
  }
}
</script>