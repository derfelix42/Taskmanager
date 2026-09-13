<script setup lang="ts">
import { getCategoryColors } from '@/api/api';
import { computed, onMounted, reactive, watch } from 'vue';

let categories = reactive({})

import { useRoute } from 'vue-router'

const route = useRoute()

const categoryInfo = computed(() => {
  let id = route.params.id

  if (Array.isArray(id)) {
    id = id[0]
  }

  // Route params are normally strings; object keys work as strings too.
  return categories[id] ?? null
})


onMounted(async () => {
    let cats = await getCategoryColors();
    console.log(cats)
    Object.assign(categories, cats)
})


</script>

<template>
    <h2>Category "{{categoryInfo.Bezeichnung }}" {{ $route.params.prefix }}</h2>
    <!-- <pre>{{ JSON.stringify(categories, null, 2) }}</pre> -->
</template>

<style></style>