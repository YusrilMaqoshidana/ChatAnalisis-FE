import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import PrimeVue from 'primevue/config'
import { definePreset } from '@primevue/themes'
import Aura from '@primevue/themes/aura'

import App from './App.vue'
import router from './router'

const InkEmberPreset = definePreset(Aura, {
  semantic: {
    primary: {
      50: '#FDF8F0',
      100: '#FAF0DE',
      200: '#F2DCBA',
      300: '#EAC593',
      400: '#E5B675',
      500: '#E0A75E',
      600: '#C7914C',
      700: '#A1733B',
      800: '#7C572A',
      900: '#583C1C',
      950: '#3E2911',
    },
    colorScheme: {
      dark: {
        primary: {
          color: '#E0A75E',
          inverseColor: '#12141C',
          hoverColor: '#EAC593',
          activeColor: '#C7914C',
        },
        background: {
          primary: '#12141C',
          secondary: '#1B1E2A',
        },
      },
    },
  },
})

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(PrimeVue, {
  theme: {
    preset: InkEmberPreset,
    options: {
      darkModeSelector: '.dark',
    },
  },
})

app.mount('#app')
