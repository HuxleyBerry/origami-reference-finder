<template>
  <div id="container">
    <div id="inner-container" ref="container">
      <Controls @find="getReference" @new-size="updateSize" @clear="reset" @new-option="handleNewOptionRequest"
        :max-options="maxOptions" :max-drawing-size="maxDrawingSize" />
      <p>{{ errorInfoText }}</p>
      <canvas ref="canvas"></canvas>
    </div>
  </div>

</template>

<script setup lang="ts">
import { onMounted, ref, useTemplateRef } from 'vue';
import Controls from './components/Controls.vue';
import { getDescription, getFoldList, includesLine } from './utils/calc';
import { drawStep, getLinesFromOperation, rotateElements } from './utils/drawing';
import type { FoldDrawingElements, Line, Sequence } from './types/types';

const errorInfoText = ref<string>("")
const maxDrawingSize = ref<number>(6);
const latestStepsPerLine = ref<number | null>(null)
const latestDrawingSize = ref<number | null>(null)
const canvas = useTemplateRef("canvas")
const container = useTemplateRef("container")
let ctx: CanvasRenderingContext2D | null = null
const drawingSettings = {
  mainColour: "#000000",
  pointColour: "#FF0000",
  lineSectionLength: 7
}
const maxOptions = 5;

let storedElements: FoldDrawingElements[] | null = null;
let storedSequences: Sequence[] | null = null;


function reset() {
  if (ctx && canvas.value) {
    errorInfoText.value = "";
    storedElements = null;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.value.width, canvas.value.height)
  }
};

function findReference(reference: number, foldNum: number) {
  storedSequences = getFoldList(reference, foldNum, maxOptions);
}

function getReference(reference: number, foldNum: number, drawingSize: number) {
  doEverything(reference, foldNum, drawingSize, 0)
};

function doEverything(reference: number, foldNum: number, drawingSize: number, optionNum: number) {
  if (ctx != null) {
    reset();
    if (optionNum === 0) {
      findReference(reference, foldNum);
    }
    const fList = storedSequences!![optionNum].sequence;
    console.log(fList);
    errorInfoText.value = getDescription(reference, storedSequences!![optionNum]);
    getElementsFromFolds(fList);
    drawSteps(ctx, drawingSize, storedElements!!);
  }
}

function handleNewOptionRequest(reference: number, foldNum: number, drawingSize: number, optionNum: number) {
  doEverything(reference, foldNum, drawingSize, optionNum)
}

function updateSize(drawingSize: number) {
  if (ctx !== null && storedElements !== null) {
    drawSteps(ctx, drawingSize, storedElements)
  }
}

function getElementsFromFolds(fList: number[]): void {
  let landmarkRotation = 0; // number indicating what edge of the paper the current landmark is on
  let landmarkFlip = 0; // 0 if not flipped, 1 if flipped
  let currentLandmark = 0.5;
  const linesSoFar: Line[] = [[0.5, 0, 0.5, 1]]
  const elementsForEachStep: FoldDrawingElements[] = [{ description: "Fold in half horizontally", line: [0.5, 0, 0.5, 1], markings: [[0, 0.5, Math.PI / 2], [1, 0.5, Math.PI / 2]], arrows: [[0.1, 0.5, 0.9, 0.5]] }]

  fList.forEach((operation) => {
    const { newLandmark, elements, resultFlip, resultRotation } = getLinesFromOperation(operation, currentLandmark, landmarkRotation, landmarkFlip)
    elements.forEach((elementGroup) => {
      const rotatedElements = rotateElements(elementGroup, landmarkRotation, landmarkFlip)
      if (!includesLine(linesSoFar, rotatedElements.line)) {
        linesSoFar.push(rotatedElements.line)
        elementsForEachStep.push(rotatedElements)
      }
    })
    currentLandmark = newLandmark
    landmarkFlip = resultFlip
    landmarkRotation = resultRotation;
  })
  const finalElements = rotateElements({
    description: "Landmark highlighted",
    arrows: [],
    markings: [[0, 0], [currentLandmark, 0]],
    line: [0, 0, currentLandmark, 0],
  }, landmarkRotation, landmarkFlip)
  elementsForEachStep.push(finalElements)
  storedElements = elementsForEachStep
}

function drawSteps(ctx: CanvasRenderingContext2D, drawingSize: number, elementsForEachStep: FoldDrawingElements[]) {
  if (canvas.value && container.value !== null) {
    const linesSoFar: Line[] = []
    const stepsPerLine = Math.floor(container.value.offsetWidth / (2 * drawingSize));
    latestStepsPerLine.value = stepsPerLine;
    console.log("/??", latestStepsPerLine.value)
    latestDrawingSize.value = drawingSize;
    canvas.value.width = stepsPerLine * 2 * drawingSize;
    canvas.value.height = 2 * drawingSize * (Math.ceil((elementsForEachStep.length) / stepsPerLine));
    ctx.translate(drawingSize / 5, drawingSize / 5);
    elementsForEachStep.forEach((elements, index) => {
      linesSoFar.push(elements.line)
      drawStep(ctx, index, stepsPerLine, elements.description, linesSoFar, elements.markings, elements.arrows, drawingSettings, index === elementsForEachStep.length - 1, drawingSize)
    })
  }
};

function handleResize() {
  if (container.value !== null) {
    maxDrawingSize.value = Math.min(6, Math.floor(container.value.offsetWidth / 100));
    if (latestDrawingSize.value !== null && latestStepsPerLine.value !== null) {
      const stepsPerLine = Math.floor(container.value.offsetWidth / (2 * latestDrawingSize.value));
      if (latestStepsPerLine.value !== stepsPerLine) {
        updateSize(Math.min(50 * maxDrawingSize.value, latestDrawingSize.value))
      }
    }
  }
}

onMounted(() => {
  if (canvas.value) {
    ctx = canvas.value.getContext("2d")
  }
  handleResize()
  window.addEventListener("resize", handleResize)
})

</script>

<style scoped>
#container {
  display: flex;
  flex-direction: row;
  justify-content: center;
  width: 100%;
}

@media only screen and (max-width: 600px) {
  #inner-container {
    padding-left: 20px;
    padding-right: 20px;
    max-width: 100%;
  }
}

@media only screen and (min-width: 600px) {
  #inner-container {
    width: 500px;
  }
}

@media only screen and (min-width: 992px) {
  #inner-container {
    width: 900px;
  }
}

@media only screen and (min-width: 1200px) {
  #inner-container {
    width: 1200px;
  }
}
</style>
