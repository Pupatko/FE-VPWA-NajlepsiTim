import { Notify } from 'quasar'

export default () => {
  Notify.setDefaults({
    position: 'bottom-right',   // <== TU nastavíš default pozíciu
    timeout: 3000,
    actions: [{ icon: 'close', color: 'white' }]
  })
}
