<template>
    <h1 id="title">Reference Finder</h1>
    <p>Landmark (a number between 0 and 1):</p>
    <input v-model="landmark" @focus="landmarkInputFocus" @blur="landmarkInputBlur">
    <p id="landmark-error">{{ errorMessage }}</p>
    <p>Number of operations (not quite the same as folds): {{ foldNum }}</p>
    <input type="range" min="2" max="6" v-model="foldNum">
    <br>
    <p>Drawing size: {{ drawingSize }}</p>
    <input type="range" min="2" max="6" v-model="drawingSizeSlider" @change="sliderChange">
    <br>
    <button :disabled="showingFolds" @click="getReference" class="find-button"
        :class="{ 'find-button-disabled': showingFolds }">Find reference</button>
    <button v-if="showingFolds" @click="console.log('todo')" class="alternative-button">See another option</button>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';

const landmark = ref<string>("")
const landmarkOnLastBlur = ref<number>(0)
const foldNum = ref<number>(4)
const errorMessage = ref<string>("")
const drawingSizeSlider = ref<number>(2)
const showingFolds = ref<boolean>(false)
const emit = defineEmits<{
    find: [landmark: number, foldNum: number, drawingSize: number],
    newSize: [drawingSize: number],
    clear: []
}>()

const drawingSize = computed(() => drawingSizeSlider.value * 50)

function landmarkInputBlur() {
    const landmarkAsNumber = parseFloat(landmark.value);
    if (isNaN(landmarkAsNumber) || landmarkAsNumber < 0 || landmarkAsNumber > 1) {
        errorMessage.value = "Please enter a real number between 0 and 1."
    } else {
        if (landmarkAsNumber !== landmarkOnLastBlur.value) {
            showingFolds.value = false;
            emit('clear');
        }
        landmarkOnLastBlur.value = landmarkAsNumber;
    }
}

function landmarkInputFocus() {
    errorMessage.value = ''
}

function sliderChange() {
    emit('newSize', drawingSize.value)
}

function getReference() {
    const landmarkAsNumber = parseFloat(landmark.value);
    if (isNaN(landmarkAsNumber) || landmarkAsNumber < 0 || landmarkAsNumber > 1) {
        errorMessage.value = "Please enter a real number between 0 and 1."
    } else {
        emit('find', landmarkAsNumber, foldNum.value, drawingSize.value)
        showingFolds.value = true
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

.find-button-disabled {
    cursor: auto;
}

.alternative-button {
    margin-top: 40px;
    margin-left: 20px;
    background-color: #ab02a3;
    color: white;
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