<script setup lang="ts">
import { ref } from 'vue'
import { RouterView } from 'vue-router'

console.log("Starting connection to WebSocket Server")
let connection = new WebSocket("wss://localhost/websocket")
let last_msg = ref("test")

connection.onmessage = function (event) {
    console.log(event);
    last_msg.value = event.data;
    console.log(event.data)
}

connection.onopen = function (event) {
    console.log(event)
    console.log("Successfully connected to the echo websocket server...")
}


</script>

<template>
    <button @click="connection.send('Hallo Welt!')">Test WS</button>
    <RouterView></RouterView>
    <div class="popup">
        <p>{{ last_msg }}</p>
    </div>
</template>

<style>
* {
    font-family: monospace;
}

.popup {
    /* height: 2em; */
    width: auto;
    position: absolute;
    top: 0;
    right: 0;
    background-color: darkgreen;
    color: white;
    padding: 0.5em 1em;
}
</style>
