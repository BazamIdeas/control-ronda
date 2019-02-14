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
import Gestion from '@/components/tareas'
import Panel from '@/components/panel'
import Notificaciones from '@/components/notificaciones'
import Entrega from '@/components/entrega'
import Eventos from '@/components/eventos'
import Productos from '@/components/productos'
import Inventario from '@/components/inventario'
import Encuestas from '@/components/encuestas'
import Residentes from '@/components/residentes'

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
      path: '/eventos',
      name: 'eventos',
      component: Eventos,
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
      path: '/gestion',
      name: 'gestion',
      component: Gestion,
      meta: {
        requiresAuth: true
      },
      beforeEnter: (to, from, next) => {
        if (store.state.sesion.tasks_mod) {
          next()
        } else {
          next({name: 'restringida'})
        }
      }
    },
    {
      path: '/notificaciones',
      name: 'notificaciones',
      component: Notificaciones,
      meta: {
        requiresAuth: true
      },
      beforeEnter: (to, from, next) => {
        if (store.state.sesion.tasks_mod) {
          next()
        } else {
          next({name: 'restringida'})
        }
      }
    },
    {
      path: '/entrega',
      name: 'entrega',
      component: Entrega,
      meta: {
        requiresAuth: true
      },
      beforeEnter: (to, from, next) => {
        if (store.state.sesion.delivery_mod) {
          next()
        } else {
          next({name: 'restringida'})
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
      path: '/productos',
      name: 'productos',
      component: Productos,
      meta: {
        requiresAuth: true
      },
      beforeEnter: (to, from, next) => {
        if (store.state.sesion.checks_mod) {
          next()
        } else {
          next({
            name: 'restringida'
          })
        }
      }
    },
    {
      path: '/inventario',
      name: 'inventario',
      component: Inventario,
      meta: {
        requiresAuth: true
      },
      beforeEnter: (to, from, next) => {
        if (store.state.sesion.checks_mod) {
          next()
        } else {
          next({
            name: 'restringida'
          })
        }
      }
    },
    {
      path: '/encuestas',
      name: 'encuestas',
      component: Encuestas,
      meta: {
        requiresAuth: true
      },
      beforeEnter: (to, from, next) => {
        if (store.state.sesion.surveys_mod) {
          next()
        } else {
          next({
            name: 'restringida'
          })
        }
      }
    },
    {
      path: '/residentes',
      name: 'residentes',
      component: Residentes,
      meta: {
        requiresAuth: true
      },
      beforeEnter: (to, from, next) => {
        if (store.state.sesion.surveys_mod) {
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
