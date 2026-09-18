import { defineStore } from 'pinia'
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'

export const useCurrentDateStore = defineStore('currentDate', () => {

    const route = useRoute()
    const dateParam = computed(() => String(route.params.date))

    const date = ref(new Date())
    const isoDate = computed(() => date.value.toLocaleDateString('sv-SE'))

    function getDateFromParam() {
        let param = String(route.params.date)
        console.log("date param has changed", param)
        const d = new Date(); // today
        if (param.includes('tomorrow')) {
            d.setDate(d.getDate() + 1);
        } else if (param.includes('yesterday')) {
            d.setDate(d.getDate() - 1);
        } else if (!param.includes('today')) {
            d.setTime(Date.parse(param))
        }
        date.value = d
    }

    watch(() => route.params.date, () => getDateFromParam())

    getDateFromParam()

    return { date, isoDate }
})