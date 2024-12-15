<template>
    <h1 id="title">Origami Reference Finder</h1>
    <p>Landmark (a number between 0 and 1):</p>
    <input v-model="landmark" @focus="landmarkInputFocus" @blur="landmarkInputBlur">
    <p id="landmark-error">{{ errorMessage }}</p>
    <p>Number of operations (not quite the same as folds): {{ foldNum }}</p>
    <input class="slider" type="range" min="2" max="6" v-model.number="foldNum" @change="foldNumSliderChange">
    <br>
    <p>Drawing size: {{ drawingSize }}</p>
    <input class="slider" type="range" min="2" :max="maxDrawingSize" v-model.number="drawingSizeSlider"
        @change="sliderChange">
    <br>
    <div id="buttons-div">
        <button :disabled="buttonDisabled" @click="getReference" class="find-button"
            :class="{ 'find-button-disabled': buttonDisabled }">Find reference</button>
        <button v-if="buttonDisabled" @click="anotherOption" class="alternative-button" :disabled="optionsExhausted"
            :class="{ 'options-button-disabled': optionsExhausted }">See another option</button>
    </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';

const props = defineProps<{ maxOptions: number, maxDrawingSize: number }>()

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

watch(() => props.maxDrawingSize, (newMaxDrawingSize) => {
    if (drawingSizeSlider.value > newMaxDrawingSize) {
        drawingSizeSlider.value = newMaxDrawingSize;
    }
})
</script>

<style scoped>
p {
    font-family: sans-serif;
}

.slider {
    accent-color: #44AF69
}

#title {
    text-align: center;
    font-family: sans-serif;
}

.find-button {
    background-color: #44AF69;
    font-size: medium;
    padding: 8px;
    border-radius: 10px;
    cursor: pointer;
}

.alternative-button {
    background-color: #FCAB10;
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

#buttons-div {
    margin-top: 40px;
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    gap: 10px;
}
</style>