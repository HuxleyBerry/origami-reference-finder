<template>
    <h1>Reference Finder</h1>
    <p>Landmark (a number between 0 and 1)</p>
    <input v-model="landmark">
    <br>
    <br>
    <p>Number of operations (not quite the same as folds): {{ foldNum }}</p>
    <input type="range" value="4" min="2" max="6" v-model="foldNum">
    <br>
    <br>
    <br>
    <button v-if="showingFolds" id="another" @click="console.log('todo')">See another option</button>
    <button v-else @click="getReference">Find reference</button>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const landmark = ref<string>("")
const foldNum = ref<number>(4)
const props = defineProps<{
    showingFolds: boolean
}>()
const emit = defineEmits<{
    find: [landmark: number, foldNum: number]
}>()

function getReference() {
    const landmarkAsNumber = parseFloat(landmark.value);
    if (landmarkAsNumber < 0 || landmarkAsNumber > 1) {
        alert("invalid!")
    } else {
        emit('find', landmarkAsNumber, foldNum.value)
    }
}
</script>