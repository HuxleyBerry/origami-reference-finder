<template>
  <Controls :showing-folds="showingFolds" @find="getReference" />
  <p>{{ errorInfoText }}</p>
  <canvas ref="canvas"></canvas>
</template>

<script setup lang="ts">
import { onMounted, ref, useTemplateRef } from 'vue';
import Controls from './components/Controls.vue';
import { getFoldList } from './utils/calc';
import { drawStep, getLinesFromOperation } from './utils/drawing';
import type { DrawingSettings, Line } from './types/types';

const showingFolds = ref<boolean>(false)
const errorInfoText = ref<string>("")
const canvas = useTemplateRef("canvas")
let ctx: CanvasRenderingContext2D | null = null
const stepsPerLine = 3;
const drawingSettings = ref<DrawingSettings>({
  mainColour: "#000000",
  pointColour: "#FF0000",
  lineSectionLength: 7
})


function reset() {
  if (ctx && canvas.value) {
    ctx.clearRect(-10, -10, canvas.value.width, canvas.value.height)
  }
};

function getReference(reference: number, foldNum: number) {
  if (canvas.value !== null && ctx != null) {
    reset();
    // eliminated = []; //not in the reset() function because we only want to reset this within the getReference() function
    const [fList, descriptionText] = getFoldList(reference, foldNum);
    errorInfoText.value = descriptionText;
    console.log(fList);
    drawSteps(ctx, fList);
  }
};

function drawSteps(ctx: CanvasRenderingContext2D, fList: number[]) {
  let landmarkRotation = 0; // number indicating what edge of the paper the current landmark is on
  let landmarkFlip = 0; // 0 if not flipped, 1 if flipped
  let currentLandmark = 0.5;
  let currentStep = 0;
  const linesSoFar: Line[] = [[0.5, 0, 0.5, 1]]
  drawStep(ctx, currentStep, stepsPerLine, "Fold in half horizontally", linesSoFar, [[0, 0.5, Math.PI / 2], [1, 0.5, Math.PI / 2]], [[0.1, 0.5, 0.9, 0.5]], drawingSettings.value, false)
  fList.forEach((operation, outerIndex) => {
    const { newLandmark, elements, resultFlip, resultRotation } = getLinesFromOperation(operation, currentLandmark, landmarkRotation, landmarkFlip)
    elements.forEach((elementGroup, innerIndex) => {
      currentStep += 1
      linesSoFar.push(elementGroup.line)
      drawStep(ctx, currentStep, stepsPerLine, elementGroup.description, linesSoFar, elementGroup.points, elementGroup.arrows, drawingSettings.value, outerIndex === fList.length - 1 && innerIndex === elements.length - 1)
    })
    currentLandmark = newLandmark
    landmarkFlip = resultFlip
    landmarkRotation = resultRotation;
  })
  /*for (let i = 0; i < fList.length; i++) {
    addLinesFromFold(fList[i], currentLandmark);
  }
  canvas.value.width = stepsPerLine * 200;
  canvas.value.height = 200 * (Math.ceil((2 + lines2.length) / stepsPerLine));
  ctx.translate(10, 10);
  drawStep(0);
  for (var i = 0; i < lines2.length; i++) {
    if (includesLine(lines, lines2[i])) {
      lines.push(lines2[i]);
      drawStep(i + 1);
    }
  }
  descriptionText.push("Landmark highlighted");
  lines.push(rotateLine([0, 0, currentLandmark, 0], landmarkRotation, landmarkFlip))
  points.push([rotatePoint(0, 0, landmarkRotation, landmarkFlip), rotatePoint(currentLandmark, 0, landmarkRotation, landmarkFlip)]);
  drawStep(lines2.length + 1);*/
  /*if (newMethodRequired) {
    getAnotherMethod();
  };*/
};


onMounted(() => {
  if (canvas.value) {
    ctx = canvas.value.getContext("2d")
    canvas.value.width = 600
    canvas.value.height = 600
    if (ctx === null) {
      alert("Could not get canvas context")
    }
  }

})

</script>

<style scoped></style>
