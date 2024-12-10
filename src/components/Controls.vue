<template>
    <h1 id="title">Reference Finder</h1>
    <p>Landmark (a number between 0 and 1):</p>
    <input v-model="landmark" @focus="errorMessage = ''" @blur="landmarkInputBlur">
    <p id="landmark-error">{{ errorMessage }}</p>
    <p>Number of operations (not quite the same as folds): {{ foldNum }}</p>
    <input type="range" min="2" max="6" v-model="foldNum">
    <br>
    <p>Drawing size: {{ drawingSize }}</p>
    <input type="range" min="2" max="6" v-model="drawingSizeSlider">
    <br>
    <button v-if="showingFolds" @click="console.log('todo')" class="find-button">See another option</button>
    <button v-else @click="getReference" class="find-button">Find reference</button>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';

const landmark = ref<string>("")
const foldNum = ref<number>(4)
const errorMessage = ref<string>("")
const drawingSizeSlider = ref<number>(2)
const props = defineProps<{
    showingFolds: boolean
}>()
const emit = defineEmits<{
    find: [landmark: number, foldNum: number, drawingSize: number]
}>()

const drawingSize = computed(() => drawingSizeSlider.value * 50)

function landmarkInputBlur() {
    const landmarkAsNumber = parseFloat(landmark.value);
    if (isNaN(landmarkAsNumber) || landmarkAsNumber < 0 || landmarkAsNumber > 1) {
        errorMessage.value = "Please enter a real number between 0 and 1."
    }
}

function getReference() {
    const landmarkAsNumber = parseFloat(landmark.value);
    if (isNaN(landmarkAsNumber) || landmarkAsNumber < 0 || landmarkAsNumber > 1) {
        errorMessage.value = "Please enter a real number between 0 and 1."
    } else {
        emit('find', landmarkAsNumber, foldNum.value, drawingSize.value)
    }
}
</script>

<style scoped>
p {
    font-family: sans-serif;
}

#title {
    text-align: center;
    font-family: sans-serif;
}

.find-button {
    margin-top: 40px;
    background-color: #02ab02;
    font-size: medium;
    padding: 8px;
    border-radius: 10px;
    cursor: pointer;
}

#landmark-error {
    margin-top: 4px;
    margin-bottom: 0px;
    color: red;
    min-height: 18px;
}
</style>