<template>
    <h1 id="title">Origami Reference Finder</h1>
    <p>Landmark (a number between 0 and 1):</p>
    <input v-model="landmark" @focus="landmarkInputFocus" @blur="landmarkInputBlur">
    <p id="landmark-error">{{ errorMessage }}</p>
    <p>Number of operations (not quite the same as folds): {{ foldNum }}</p>
    <input type="range" min="2" max="6" v-model="foldNum" @change="foldNumSliderChange">
    <br>
    <p>Drawing size: {{ drawingSize }}</p>
    <input type="range" min="2" max="6" v-model="drawingSizeSlider" @change="sliderChange">
    <br>
    <button :disabled="buttonDisabled" @click="getReference" class="find-button"
        :class="{ 'find-button-disabled': buttonDisabled }">Find reference</button>
    <button v-if="buttonDisabled" @click="anotherOption" class="alternative-button" :disabled="optionsExhausted"
        :class="{ 'options-button-disabled': optionsExhausted }">See another option</button>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';

const props = defineProps<{ maxOptions: number }>()

const landmark = ref<string>("")
const landmarkOnLastBlur = ref<number>(0)
const foldNum = ref<number>(4)
const errorMessage = ref<string>("")
const drawingSizeSlider = ref<number>(2)
const buttonDisabled = ref<boolean>(false)
const optionNum = ref<number>(0)
const emit = defineEmits<{
    find: [landmark: number, foldNum: number, drawingSize: number],
    newSize: [drawingSize: number],
    clear: []
    newOption: [num: number, landmark: number, foldNum: number, drawingSize: number]
}>()

const drawingSize = computed(() => drawingSizeSlider.value * 50)
const optionsExhausted = computed(() => optionNum.value >= props.maxOptions - 1)

function landmarkInputBlur() {
    const landmarkAsNumber = parseFloat(landmark.value);
    if (isNaN(landmarkAsNumber) || landmarkAsNumber < 0 || landmarkAsNumber > 1) {
        errorMessage.value = "Please enter a real number between 0 and 1.";
    } else {
        if (landmarkAsNumber !== landmarkOnLastBlur.value) {
            buttonDisabled.value = false;
            emit('clear');
        }
        landmarkOnLastBlur.value = landmarkAsNumber;
    }
}

function anotherOption() {
    optionNum.value += 1;
    emit("newOption", parseFloat(landmark.value), foldNum.value, drawingSize.value, optionNum.value);
}

function landmarkInputFocus() {
    errorMessage.value = '';
}

function sliderChange() {
    emit('newSize', drawingSize.value);
}

function foldNumSliderChange() {
    buttonDisabled.value = false;
    optionNum.value = 0;
    emit('clear')
}

function getReference() {
    const landmarkAsNumber = parseFloat(landmark.value);
    if (isNaN(landmarkAsNumber) || landmarkAsNumber < 0 || landmarkAsNumber > 1) {
        errorMessage.value = "Please enter a real number between 0 and 1.";
    } else {
        emit('find', landmarkAsNumber, foldNum.value, drawingSize.value);
        buttonDisabled.value = true;
        optionNum.value = 0;
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

.find-button-disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.options-button-disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

#landmark-error {
    margin-top: 4px;
    margin-bottom: 0px;
    color: red;
    min-height: 18px;
}
</style>