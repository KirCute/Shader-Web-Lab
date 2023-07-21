import {createI18n} from 'vue-i18n'
import messages from './index'

const i18n = createI18n({
    legacy: false,
    locale: localStorage.getItem('lang') || "zhCN",
    messages
})

export default function (app) {
    app.use(i18n)
}
