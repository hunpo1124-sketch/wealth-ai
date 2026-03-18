import { createRouter, createWebHashHistory } from 'vue-router'
import Home from '../views/Home.vue'
import Transactions from '../views/Transactions.vue'
import Statistics from '../views/Statistics.vue'
import Assets from '../views/Assets.vue'
import Settings from '../views/Settings.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/transactions',
    name: 'Transactions',
    component: Transactions
  },
  {
    path: '/statistics',
    name: 'Statistics',
    component: Statistics
  },
  {
    path: '/assets',
    name: 'Assets',
    component: Assets
  },
  {
    path: '/settings',
    name: 'Settings',
    component: Settings
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router