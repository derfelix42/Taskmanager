<script setup lang="ts">
import { onBeforeUnmount, ref } from 'vue'
import { RouterView } from 'vue-router'

console.log("Starting connection to WebSocket Server")
let connection = new WebSocket("wss://localhost/websocket")
const last_msg = ref("")
const show_popup = ref(false)
let hide_popup_timeout: ReturnType<typeof setTimeout> | undefined

connection.onmessage = function (event) {
    // console.log(event);
    last_msg.value = event.data;
    show_popup.value = true;

    if (hide_popup_timeout) {
        clearTimeout(hide_popup_timeout)
    }

    hide_popup_timeout = setTimeout(() => {
        show_popup.value = false;
    }, 3000)

    console.log("Websocket Message:", event.data)
}

connection.onopen = function (event) {
    console.log(event)
    console.log("Successfully connected to the echo websocket server...")
}

onBeforeUnmount(() => {
    connection.close()

    if (hide_popup_timeout) {
        clearTimeout(hide_popup_timeout)
    }
})

</script>

<template>
    <!-- <button @click="connection.send('Hallo Welt!')">Test WS</button> -->
    <RouterView></RouterView>
    <Transition name="popup">
        <div v-if="show_popup" class="popup">
            <p>{{ last_msg }}</p>
        </div>
    </Transition>
</template>

<style>
* {
    font-family: monospace;
}

.popup {
    width: auto;
    position: absolute;
    top: 0;
    right: 0;
    background-color: darkgreen;
    color: white;
    padding: 0.5em 1em;
}

.popup-enter-active,
.popup-leave-active {
    transition: opacity 0.6s ease;
}

.popup-enter-from,
.popup-leave-to {
    opacity: 0;
}
</style>
