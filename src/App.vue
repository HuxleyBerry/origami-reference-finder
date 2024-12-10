<template>
  <div id="container">
    <div id="inner-container" ref="container">
      <Controls :showing-folds="showingFolds" @find="getReference" />
      <p>{{ errorInfoText }}</p>
      <canvas ref="canvas"></canvas>
    </div>
  </div>

</template>

<script setup lang="ts">
import { onMounted, ref, useTemplateRef } from 'vue';
import Controls from './components/Controls.vue';
import { getFoldList, includesLine } from './utils/calc';
import { drawStep, getLinesFromOperation, rotateElements } from './utils/drawing';
import type { FoldDrawingElements, Line } from './types/types';

const showingFolds = ref<boolean>(false)
const errorInfoText = ref<string>("")
const canvas = useTemplateRef("canvas")
const container = useTemplateRef("container")
let ctx: CanvasRenderingContext2D | null = null
const drawingSettings = {
  mainColour: "#000000",
  pointColour: "#FF0000",
  lineSectionLength: 7
}


function reset() {
  if (ctx && canvas.value) {
    //todo fix
    ctx.clearRect(-10, -10, canvas.value.width, canvas.value.height)
  }
};

function getReference(reference: number, foldNum: number, drawingSize: number) {
  if (canvas.value !== null && ctx != null) {
    reset();
    // eliminated = []; //not in the reset() function because we only want to reset this within the getReference() function
    const [fList, descriptionText] = getFoldList(reference, foldNum);
    errorInfoText.value = descriptionText;
    console.log(fList)
    drawSteps(ctx, fList, drawingSize);
  }
};

function drawSteps(ctx: CanvasRenderingContext2D, fList: number[], drawingSize: number) {
  if (canvas.value && container.value !== null) {
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
    linesSoFar.push(finalElements.line)

    const stepsPerLine = Math.floor(container.value.offsetWidth / (2 * drawingSize));
    console.log(container.value.offsetWidth, stepsPerLine)
    canvas.value.width = stepsPerLine * 2 * drawingSize;
    canvas.value.height = 2 * drawingSize * (Math.ceil((elementsForEachStep.length) / stepsPerLine));
    ctx.translate(drawingSize / 10, drawingSize / 10);
    console.log(elementsForEachStep)
    elementsForEachStep.forEach((elements, index) => {
      drawStep(ctx, index, stepsPerLine, elements.description, linesSoFar.slice(0, index + 1), elements.markings, elements.arrows, drawingSettings, index === elementsForEachStep.length - 1, drawingSize)
    })
    showingFolds.value = true;
  }
};


onMounted(() => {
  if (canvas.value) {
    ctx = canvas.value.getContext("2d")
  }
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
