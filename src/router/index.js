import Vue from 'vue'
import Router from 'vue-router'
import store from '../store/'

import Empleados from '@/components/empleados'
import Usuarios from '@/components/usuarios'
import Rondas from '@/components/rondas'
import Zonas from '@/components/zonas'
import Login from '@/components/login'
import ConfAsistencia from '@/components/confAsistencia'
import Logout from '@/components/logout'
import Cuenta from '@/components/cuenta'
import Restringida from '@/components/restringida'
import LoginAdmin from '@/components/administrador'
import Panel from '@/components/panel'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/asistencia',
      name: 'asistencia',
      component: Empleados,
      meta: {
        requiresAuth: true
      },
      beforeEnter: (to, from, next) => {
        if (store.state.sesion.assistances_mod) {
          next()
        } else {
          next({
            name: 'restringida'
          })
        }
      }
    },
    {
      path: '/configuracion-asistencia',
      name: 'confAsistencia',
      component: ConfAsistencia,
      meta: {
        requiresAuth: true
      },
      beforeEnter: (to, from, next) => {
        if (store.state.sesion.assistances_mod) {
          next()
        } else {
          next({
            name: 'restringida'
          })
        }
      }
    },
    {
      path: '/cuenta',
      name: 'cuenta',
      component: Cuenta,
      meta: {
        requiresAuth: true
      }
    },
    {
      path: '/usuarios',
      name: 'usuarios',
      component: Usuarios,
      meta: {
        requiresAuth: true
      }
    },
    {
      path: '/ronda',
      name: 'ronda',
      component: Rondas,
      meta: {
        requiresAuth: true
      },
      beforeEnter: (to, from, next) => {
        if (store.state.sesion.routes_mod) {
          next()
        } else {
          next({
            name: 'restringida'
          })
        }
      }
    },
    {
      path: '/zonas',
      name: 'zonas',
      component: Zonas,
      meta: {
        requiresAuth: true
      },
      beforeEnter: (to, from, next) => {
        if (store.state.sesion.routes_mod) {
          next()
        } else {
          next({
            name: 'restringida'
          })
        }
      }
    },
    {
      path: '/',
      name: 'login',
      component: Login,
      meta: {
        requiresVisitor: true
      }
    },
    {
      path: '/logout',
      name: 'logout',
      component: Logout,
      meta: {
        requiresAuth: true
      }
    },
    {
      path: '/area-restringida',
      name: 'restringida',
      component: Restringida,
      meta: {
        requiresAuth: true
      }
    },
    {
      path: '/administracion',
      name: 'administracion',
      component: LoginAdmin,
      meta: {
        requiresVisitor: true
      }
    },
    {
      path: '/administracion/panel',
      name: 'panel',
      component: Panel,
      meta: {
        admin: true
      },
      beforeEnter: (to, from, next) => {
        if (store.state.status) {
          next()
        } else {
          next({
            name: 'login'
          })
        }
      }
    }
  ],
  mode: 'history'
})
