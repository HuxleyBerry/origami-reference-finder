import { flipLandmark, rotateCornerDescription, rotateEdgeDescription, rotateLine, rotatePoint } from "./rotation";
import type { Arrow, Point, Line, LineSection, DrawingSettings, FoldDrawingElements } from "@/types/types";



function getRotatedArrows (arrows: Arrow[], landmarkRotation: 0 | 1 | 2 | 3, landmarkFlip: 0 | 1): Arrow[] {
    const newArrows: Arrow[] = []
    for (var i = 0; i < arrows.length; i++) {
        const start = rotatePoint(arrows[i][0], arrows[i][1], landmarkRotation, landmarkFlip);
        const end = rotatePoint(arrows[i][2], arrows[i][3], landmarkRotation, landmarkFlip);
        const startToEnd = [end[0] - start[0], end[1] - start[1]];
        // checkForSmallFold(startToEnd);
        newArrows.push([start[0] + 0.1 * startToEnd[0], start[1] + 0.1 * startToEnd[1], start[0] + 0.9 * startToEnd[0], start[1] + 0.9 * startToEnd[1]]);
    }
    return newArrows;
  };
  function getRotatedPoints (points: Point[] | LineSection[], landmarkRotation: 0 | 1 | 2 | 3, landmarkFlip: 0 | 1): Point[] {
    const newPoints: Point[] = [];
    points.forEach((currentPoint) => {
      const rotatedPoint: Point | LineSection = rotatePoint(currentPoint[0], currentPoint[1], landmarkRotation, landmarkFlip);
      if (currentPoint.length === 2) { // a regular point
        newPoints.push(rotatedPoint);
      } else if (currentPoint.length === 3) { // a line section
        if (landmarkFlip % 2 == 1) {
          rotatedPoint.push(currentPoint[2] + Math.PI * landmarkRotation / 2);
        } else {
          rotatedPoint.push(-currentPoint[2] - Math.PI * landmarkRotation / 2);
        }
        newPoints.push(rotatedPoint);
      }
    })
    return newPoints
  };

  var drawLine = function (ctx: CanvasRenderingContext2D, li: Line, stepNum: number, stepsPerLine: number): void {
    ctx.moveTo(li[0] * 100 + 200 * (stepNum % stepsPerLine), li[1] * 100 + 200 * Math.floor(stepNum / stepsPerLine));
    ctx.lineTo(li[2] * 100 + 200 * (stepNum % stepsPerLine), li[3] * 100 + 200 * Math.floor(stepNum / stepsPerLine));
  };
  var drawText = function (ctx: CanvasRenderingContext2D, x: number, y: number, txt: string): void {
    const textLines = txt.split("||");
    textLines.forEach((line, index) => {
      ctx.fillText(line, x, y + 10 * index, 180);
    })

  };
  var drawArrow = function (ctx: CanvasRenderingContext2D, a: Arrow, stepNum: number, stepsPerLine: number): void {
    //var dist = Math.sqrt(Math.pow(a[0] - a[2], 2) + Math.pow(a[1] - a[3], 2));
    const mid = [(a[0] + a[2]) / 2, (a[1] + a[3]) / 2];
    // the condition below checks whether the centre of the square is to the right of the arrow
    const midToStart = (a[2] - a[0]) * (0.5 - a[1]) - (a[3] - a[1]) * (0.5 - a[0]) < 0 ? [-a[1] + mid[1], a[0] - mid[0]] : [+a[1] - mid[1], -a[0] + mid[0]]
    const control = [mid[0] + midToStart[0], mid[1] + midToStart[1]];
    ctx.moveTo(a[0] * 100 + 200 * (stepNum % stepsPerLine), a[1] * 100 + 200 * Math.floor(stepNum / stepsPerLine));
    ctx.quadraticCurveTo(control[0] * 100 + 200 * (stepNum % stepsPerLine), control[1] * 100 + 200 * Math.floor(stepNum / stepsPerLine), a[2] * 100 + 200 * (stepNum % stepsPerLine), a[3] * 100 + 200 * Math.floor(stepNum / stepsPerLine));
    const angle = Math.atan2(-a[3] + control[1], -a[2] + control[0]);
    ctx.lineTo(10 * Math.cos(angle - Math.PI / 6) + a[2] * 100 + 200 * (stepNum % stepsPerLine), 10 * Math.sin(angle - Math.PI / 4) + a[3] * 100 + 200 * Math.floor(stepNum / stepsPerLine))
    ctx.moveTo(a[2] * 100 + 200 * (stepNum % stepsPerLine), a[3] * 100 + 200 * Math.floor(stepNum / stepsPerLine));
    ctx.lineTo(10 * Math.cos(angle + Math.PI / 6) + a[2] * 100 + 200 * (stepNum % stepsPerLine), 10 * Math.sin(angle + Math.PI / 4) + a[3] * 100 + 200 * Math.floor(stepNum / stepsPerLine))
    ctx.stroke();
  };
  var drawPoint = function (ctx: CanvasRenderingContext2D, p: Point | LineSection, stepNum: number, stepsPerLine: number, lineLength: number) {
    if (p.length == 2) { // a point
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(100 * p[0] + 200 * (stepNum % stepsPerLine), 100 * p[1] + 200 * Math.floor(stepNum / stepsPerLine), 2, 0, 2 * Math.PI);
      ctx.fill();
    } else if (p.length === 3) { // a line
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(100 * p[0] + 200 * (stepNum % stepsPerLine) - lineLength * Math.cos(p[2]), 100 * p[1] + 200 * Math.floor(stepNum / stepsPerLine) - lineLength * Math.sin(p[2]));
      ctx.lineTo(100 * p[0] + 200 * (stepNum % stepsPerLine) + lineLength * Math.cos(p[2]), 100 * p[1] + 200 * Math.floor(stepNum / stepsPerLine) + lineLength * Math.sin(p[2]));
    }
    ctx.stroke();
  };
  
  export function drawStep (ctx: CanvasRenderingContext2D, stepNum: number, stepsPerLine: number, description: string, lines: Line[], points: (Point | LineSection)[], arrows: Arrow[], settings: DrawingSettings, isFinalStep: boolean) {
    ctx.beginPath();
    ctx.lineWidth = 1;
    ctx.setLineDash([]);
    ctx.rect((stepNum % stepsPerLine) * 200, Math.floor(stepNum / stepsPerLine) * 200, 100, 100);
    ctx.stroke();
    ctx.beginPath();
    ctx.lineWidth = 0.5;
    drawText(ctx, (stepNum % stepsPerLine) * 200, 110 + Math.floor(stepNum / stepsPerLine) * 200, description);
    for (let i = 0; i < lines.length; i++) {
      if (i == lines.length - 1) {
        if (!isFinalStep) { // don't draw fold line if final step
          ctx.stroke();
          ctx.beginPath();
          ctx.lineWidth = 1;
          ctx.setLineDash([10, 10]);
        } else {
          ctx.stroke();
          ctx.strokeStyle = "blue";
          ctx.fillStyle = "blue"
          ctx.beginPath();
          ctx.lineWidth = 3;
        }
      }
      drawLine(ctx, lines[i], stepNum, stepsPerLine);
    }
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = settings.pointColour;
    ctx.strokeStyle = settings.pointColour;
    points.forEach((point) => {
      drawPoint(ctx, point, stepNum, stepsPerLine, settings.lineSectionLength);
    })
    ctx.beginPath();
    ctx.strokeStyle = settings.mainColour;
    ctx.fillStyle = settings.mainColour;
    ctx.lineWidth = 1;
    if (!isFinalStep) { // don't draw arrows if final step
      ctx.beginPath();
      arrows.forEach((arrow) => {
        drawArrow(ctx, arrow, stepNum, stepsPerLine);
      })
    }
    ctx.stroke();
  };
  

export function getLinesFromOperation(operationNum: number, c: number, landmarkRotation: number, landmarkFlip: number): {newLandmark: number, elements: FoldDrawingElements[], resultFlip: number, resultRotation: number} { // this assumes the original landmark is a length along the top edge starting from the top left corner
  if (operationNum < 2) {
    const newLandmark = flipLandmark(c / 4, operationNum%2);
    const fold1: FoldDrawingElements = {
      line: rotateLine([c / 2, 0, c / 2, 1], landmarkRotation, landmarkFlip),
      arrows: [[0, 0.5, c, 0.5]],
      description: "Fold the edge perpendicular to the sides||so that the " + rotateCornerDescription(0, landmarkRotation, landmarkFlip) + " corner||lies on the landmark you just made",
      points: [[0, 0], [c, 0]]
    }
    const fold2: FoldDrawingElements = {
      line: rotateLine([c / 4, 0, c / 4, 1], landmarkRotation, landmarkFlip),
      arrows: [[0, 0.5, c / 2, 0.5]],
      description: "Fold the edge to the crease you just made",
      points: [[0, 0], [c / 2, 0]]
    }
    return {newLandmark, elements: [fold1, fold2], resultFlip: (operationNum + landmarkFlip)%2, resultRotation: landmarkRotation}
  } else if (operationNum < 4) { 
    const newLandmark = flipLandmark(c / 2, operationNum % 2);
    const fold: FoldDrawingElements = {
        line: rotateLine([c / 2, 0, c / 2, 1], landmarkRotation, landmarkFlip),
        arrows: [[0, 0.5, c, 0.5]],
        description: "Fold the edge perpendicular to the sides||so that the " + rotateCornerDescription(0, landmarkRotation, landmarkFlip) + " corner||lies on the landmark you just made",
        points: [[0, 0], [c, 0]]
    };
    return {newLandmark, elements: [fold], resultFlip: (operationNum + landmarkFlip) % 2, resultRotation: landmarkRotation};
  } else if (operationNum < 6) {
    const newLandmark = flipLandmark((3 * c) / 4, operationNum % 2);
    const fold1: FoldDrawingElements = {
        line: rotateLine([c / 2, 0, c / 2, 1], landmarkRotation, landmarkFlip),
        arrows: [[0, 0.5, c, 0.5]],
        description: "Fold the edge perpendicular to the sides||so that the " + rotateCornerDescription(0, landmarkRotation, landmarkFlip) + " corner||lies on the landmark you just made",
        points: [[0, 0], [c, 0]]
    };
    const fold2: FoldDrawingElements = {
        line: rotateLine([3 * c / 4, 0, 3 * c / 4, 1], landmarkRotation, landmarkFlip),
        arrows: [[c / 2, 0.5, c, 0.5]],
        description: "Fold halfway between the line you just made||and the landmark from the step before that",
        points: [[c / 2, 0], [c, 0]]
    };
    return {newLandmark, elements: [fold1, fold2], resultFlip: (operationNum + landmarkFlip) % 2, resultRotation: landmarkRotation};
  } else if (operationNum < 8) {
    const newLandmark = flipLandmark((1 - c * c) / 2, operationNum % 2);
    const fold: FoldDrawingElements = {
        line: rotateLine([0, (1 - c * c) / 2, 1, (2 - Math.pow(1 - c, 2)) / 2], landmarkRotation, landmarkFlip),
        arrows: [[0, 1, c, 0]],
        description: "Fold the " + rotateCornerDescription(3, landmarkRotation, landmarkFlip) + " corner to the landmark",
        points: [[0, 1], [c, 0]]
    };
    return {newLandmark, elements: [fold], resultFlip: (operationNum + 1 + landmarkFlip) % 2, resultRotation: landmarkRotation + (3 - 2 * (landmarkFlip % 2))};
  } else if (operationNum < 10) {
    const newLandmark = flipLandmark(Math.pow(1 - c, 2) / 2, operationNum % 2);
    const fold: FoldDrawingElements = {
        line: rotateLine([0, (1 - c * c) / 2, 1, (2 - Math.pow(1 - c, 2)) / 2], landmarkRotation, landmarkFlip),
        arrows: [[0, 1, c, 0]],
        description: "Fold the " + rotateCornerDescription(3, landmarkRotation, landmarkFlip) + " corner to the landmark",
        points: [[0, 1], [c, 0]]
    };
    return {newLandmark, elements: [fold], resultFlip: (operationNum + 1 + landmarkFlip) % 2, resultRotation: landmarkRotation + (1 + 2 * (landmarkFlip % 2))};
  } else if (operationNum < 12) {
    const newLandmark = flipLandmark((1 - Math.sqrt(1 - c * c)) / c, operationNum % 2);
    const fold1: FoldDrawingElements = {
        line: rotateLine([c, 0, c, 1], landmarkRotation, landmarkFlip),
        arrows: c < 0.5 ? [[0, 0.5, 2 * c, 0.5]] : [[1, 0.5, 2 * c - 1, 0.5]],
        description: "Fold perpendicular to the edge from the landmark",
        points: [[c, 0], [c, 1]]
    };
    const fold2: FoldDrawingElements = {
        line: rotateLine([(1 - Math.sqrt(1 - c * c)) / c, 0, 0, 1], landmarkRotation, landmarkFlip),
        arrows: [[0, 0, c, Math.sqrt(2 - c * c - 2 * Math.sqrt(1 - c * c))]],
        description: "Fold from the " + rotateCornerDescription(3, landmarkRotation, landmarkFlip) + " corner|| so that the " + rotateCornerDescription(0, landmarkRotation, landmarkFlip) + " corner||lies on the crease you just made",
        points: [[0, 1], [0, 0], [c, Math.sqrt(2 - c * c - 2 * Math.sqrt(1 - c * c)), Math.PI / 2]]
    };
    return {newLandmark, elements: [fold1, fold2], resultFlip: (operationNum + landmarkFlip) % 2, resultRotation: landmarkRotation};
  } else if (operationNum < 14) {
    const newLandmark = flipLandmark(Math.sqrt(1 - c * c) / (c + 1), operationNum);
    const fold1: FoldDrawingElements = {
      line: rotateLine([c, 0, c, 1], landmarkRotation, landmarkFlip),
      arrows: c < 0.5 ? [[0, 0.5, 2 * c, 0.5]] : [[1, 0.5, 2*c-1, 0.5]],
      description: "Fold perpendicular to the edge from the landmark",
      points: [[c, 0], [c, 1]]
    };
    const fold2: FoldDrawingElements = {
      line: rotateLine([1, 1 - (Math.sqrt(1 - c * c) / (c + 1)), 0, 1], landmarkRotation, landmarkFlip),
      arrows: [[1, 1, c, Math.sqrt(2 - c * c - 2 * Math.sqrt(1 - c * c))]],
      description: "Fold from the " + rotateCornerDescription(3, landmarkRotation, landmarkFlip) + " corner|| so that the " + rotateCornerDescription(2, landmarkRotation, landmarkFlip) + " corner||lies on the crease you just made",
      points: [[c, 0], [c, 1], [1, 1], [c, Math.sqrt(2 - c * c - 2 * Math.sqrt(1 - c * c)), Math.PI / 2]]
    };
    return { newLandmark, elements: [fold1, fold2], resultFlip: (operationNum + 1 + landmarkFlip) % 2, resultRotation: landmarkRotation + (1 + 2 * (landmarkFlip % 2)) };
  } else if (operationNum < 16) {
    const newLandmark = flipLandmark((Math.sqrt(c * c + 1) - 1) / c, operationNum);
    const fold1: FoldDrawingElements = {
      line: rotateLine([c, 0, 0, 1], landmarkRotation, landmarkFlip),
      arrows: [[0, 0, 2 * c / (1 + c * c), 2 - 2 / (1 + c * c)]],
      description: "Fold from the " + rotateCornerDescription(3, landmarkRotation, landmarkFlip) + " corner to the landmark",
      points: [[0, 1], [c, 0]]
    };
    const fold2: FoldDrawingElements = {
      line: rotateLine([(Math.sqrt(c * c + 1) - 1) / c, 0, 0, 1], landmarkRotation, landmarkFlip),
      arrows: [[0, 1 / 3, 2 * c / 3, 1 / 3]],
      description: "Fold the " + rotateEdgeDescription(3, landmarkRotation, landmarkFlip) + " edge to the crease you just made",
      points: [[0, 1 / 3, Math.PI / 2], [2 * c / 3, 1 / 3, Math.atan(1 / c)]]
    };
    return { newLandmark, elements: [fold1, fold2], resultFlip: (operationNum + landmarkFlip) % 2, resultRotation: landmarkRotation };
  } else if (operationNum < 18) {
    const newLandmark = flipLandmark(Math.sqrt(c * c + 1) - c, operationNum);
    const fold1: FoldDrawingElements = {
        line: rotateLine([c, 0, 0, 1], landmarkRotation, landmarkFlip),
        arrows: [[0, 0, 2 * c / (1 + c * c), 2 - 2 / (1 + c * c)]],
        description: "Fold from the " + rotateCornerDescription(3, landmarkRotation, landmarkFlip) + " corner to the landmark",
        points: [[c, 0], [c, 1]]
    };
    const fold2: FoldDrawingElements = {
        line: rotateLine([1, 1 - Math.sqrt(c * c + 1) + c, 0, 1], landmarkRotation, landmarkFlip),
        arrows: [[1, 1, c, Math.sqrt(2 - c * c - 2 * Math.sqrt(1 - c * c))]],
        description: "Fold the " + rotateEdgeDescription(2, landmarkRotation, landmarkFlip) + " edge to the crease you just made",
        points: [[0, 1], [1, 1], [c, Math.sqrt(2 - c * c - 2 * Math.sqrt(1 - c * c)), Math.PI / 2]]
    };
    return {
        newLandmark,
        elements: [fold1, fold2],
        resultFlip: (landmarkFlip + operationNum + 1) % 2,
        resultRotation: landmarkRotation + (1 + 2 * (landmarkFlip % 2))
    };
  } else if (operationNum < 20) {
    const newLandmark = flipLandmark((Math.sqrt(c * c + 1) - c) * c, operationNum);
    const fold1: FoldDrawingElements = {
        line: rotateLine([c, 0, 0, 1], landmarkRotation, landmarkFlip),
        arrows: [[0, 0, 2 * c / (1 + c * c), 2 - 2 / (1 + c * c)]],
        description: "Fold from the " + rotateCornerDescription(3, landmarkRotation, landmarkFlip) + " corner to the landmark",
        points: [[c, 0], [c, 1]]
    };
    const fold2: FoldDrawingElements = {
        line: rotateLine([0, (Math.sqrt(c * c + 1) - c) * c, c, 0], landmarkRotation, landmarkFlip),
        arrows: [[0, 0, c - (c * c) / Math.sqrt(1 + c * c), c / Math.sqrt(1 + c * c)]],
        description: "Fold the " + rotateEdgeDescription(0, landmarkRotation, landmarkFlip) + " edge to the crease you just made so that the " + rotateCornerDescription(0, landmarkRotation, landmarkFlip) + " corner||lies on that crease",
        points: [[0, 0], [c, 0], [c - (c * c) / Math.sqrt(1 + c * c), c / Math.sqrt(1 + c * c), Math.atan(1 / c)]]
    };
    return {
        newLandmark,
        elements: [fold1, fold2],
        resultFlip: (landmarkFlip + operationNum + 1) % 2,
        resultRotation: landmarkRotation + (3 - 2 * (landmarkFlip % 2))
    };
} else if (operationNum < 22) {
    const newLandmark = flipLandmark((Math.sqrt(c * c + 1) + c) * (1 - c), operationNum);
    const fold1: FoldDrawingElements = {
        line: rotateLine([c, 0, 0, 1], landmarkRotation, landmarkFlip),
        arrows: [[0, 0, 2 * c / (1 + c * c), 2 - 2 / (1 + c * c)]],
        description: "Fold from the " + rotateCornerDescription(3, landmarkRotation, landmarkFlip) + " corner to the landmark",
        points: [[c, 0], [c, 1]]
    };
    const fold2: FoldDrawingElements = {
        line: rotateLine([1, (Math.sqrt(c * c + 1) + c) * (1 - c), c, 0], landmarkRotation, landmarkFlip),
        arrows: [[1, 0, c - (c - c * c) / Math.sqrt(1 + c * c), (1 - c) / Math.sqrt(1 + c * c)]],
        description: "Fold the " + rotateEdgeDescription(0, landmarkRotation, landmarkFlip) + " edge to the crease you just made so that the " + rotateCornerDescription(1, landmarkRotation, landmarkFlip) + " corner||lies on that crease",
        points: [[1, 0], [c, 0], [c - (c - c * c) / Math.sqrt(1 + c * c), (1 - c) / Math.sqrt(1 + c * c), Math.atan(1 / c)]]
    };
    return {
        newLandmark,
        elements: [fold1, fold2],
        resultFlip: (landmarkFlip + operationNum) % 2,
        resultRotation: landmarkRotation + (1 + 2 * (landmarkFlip % 2))
    };
} else if (operationNum < 24) {
    const newLandmark = flipLandmark((2 * c * c) / Math.pow(c + 1, 2), operationNum);
    const fold: FoldDrawingElements = {
        line: rotateLine([(2 * c * c) / Math.pow(c + 1, 2), 0, 1 - ((2 * c) / Math.pow(c + 1, 2)), 1], landmarkRotation, landmarkFlip),
        arrows: [[0, c * (1 - c) / (c + 1), c, 0], [0, 1, 1, 2 * c / (c + 1)]],
        description: "Fold the " + rotateEdgeDescription(3, landmarkRotation, landmarkFlip) + " edge to the landmark you just made so that the " + rotateCornerDescription(3, landmarkRotation, landmarkFlip) + " corner lies on the " + rotateEdgeDescription(1, landmarkRotation, landmarkFlip) + " edge",
        points: [[0, c * (1 - c) / (c + 1), Math.PI / 2], [c, 0], [0, 1], [1, 2 * c / (c + 1), Math.PI / 2]]
    };
    return {
        newLandmark,
        elements: [fold],
        resultFlip: (landmarkFlip + operationNum) % 2,
        resultRotation: landmarkRotation
    };
} else if (operationNum < 26) {
    const newLandmark = flipLandmark((2 * c) / Math.pow(c + 1, 2), operationNum);
    const fold1: FoldDrawingElements = {
        line: rotateLine([(2 * c * c) / Math.pow(c + 1, 2), 0, 1 - ((2 * c) / Math.pow(c + 1, 2)), 1], landmarkRotation, landmarkFlip),
        arrows: [[0, c * (1 - c) / (c + 1), c, 0], [0, 1, 1, 2 * c / (c + 1)]],
        description: "Fold the " + rotateEdgeDescription(3, landmarkRotation, landmarkFlip) + " edge to the landmark you just made so that the " + rotateCornerDescription(3, landmarkRotation, landmarkFlip) + " corner lies on the " + rotateEdgeDescription(1, landmarkRotation, landmarkFlip) + " edge",
        points: [[0, c * (1 - c) / (c + 1), Math.PI / 2], [c, 0], [0, 1], [1, 2 * c / (c + 1), Math.PI / 2]]
    };
    return {
        newLandmark,
        elements: [fold1],
        resultFlip: (landmarkFlip + operationNum) % 2,
        resultRotation: (landmarkRotation + 2) % 4
    };
} else if (operationNum < 28) {
    const newLandmark = flipLandmark(1 / (c + 1), operationNum);
    const fold1: FoldDrawingElements = {
        line: rotateLine([0, 0, 1, 1], landmarkRotation, landmarkFlip),
        arrows: [[0, 1, 1, 0]],
        description: "Fold the diagonal",
        points: [[0, 0], [1, 1]]
    };
    const fold2: FoldDrawingElements = {
        line: rotateLine([c, 0, 0, 1], landmarkRotation, landmarkFlip),
        arrows: [[0, 0, 2 * c / (1 + c * c), 2 - 2 / (1 + c * c)]],
        description: "Fold from the " + rotateCornerDescription(3, landmarkRotation, landmarkFlip) + " corner to the landmark",
        points: [[0, 1], [c, 0]]
    };
    const fold3: FoldDrawingElements = {
        line: rotateLine([0, 1 - (1 / c) - c, 0, 1], landmarkRotation, landmarkFlip),
        arrows: [[1, 0, c, Math.sqrt(2 - c * c - 2 * Math.sqrt(1 - c * c))]],
        description: "Fold from the " + rotateEdgeDescription(2, landmarkRotation, landmarkFlip) + " edge to the crease you just made",
        points: [[0, 1], [1, 0], [c, Math.sqrt(2 - c * c - 2 * Math.sqrt(1 - c * c)), Math.PI / 2]]
    };
    return {
        newLandmark,
        elements: [fold1, fold2, fold3],
        resultFlip: (landmarkFlip + operationNum) % 2,
        resultRotation: landmarkRotation + (3 - 2 * (landmarkFlip % 2))
    };
} else if (operationNum < 30) {
    const newLandmark = flipLandmark(1/(2-c), operationNum);
    const fold1: FoldDrawingElements = {
        line: rotateLine([0,1,1,0], landmarkRotation, landmarkFlip),
        arrows: [[0,1,1,0]],
        description: "Fold the diagonal",
        points: [[0,0],[1,1]]
    };
    const fold2: FoldDrawingElements = {
      line: rotateLine([c,0,1,1], landmarkRotation, landmarkFlip),
      arrows: [[0,0,2*c/(1+c*c),2-2/(1+c*c)]],
      description: "Fold from the " + rotateCornerDescription(2, landmarkRotation, landmarkFlip) + " corner to the landmark",
      points: [[0,1],[c,0]]
    };
    const fold3: FoldDrawingElements = {
      line: rotateLine([0,1-(1/(2-c)),1,1-(1/(2-c))], landmarkRotation, landmarkFlip),
      arrows: [[c/(c+1),0,c/(c+1),2*c/(c+1)]],
      description: "Fold perpendicular to the " + rotateEdgeDescription(3, landmarkRotation, landmarkFlip) + " edge||from the intersection of the crease you||just made and the diagonal",
      points: [[c/(c+1),c/(c+1)]]
    };
    return {
        newLandmark,
        elements: [fold1, fold2, fold3],
        resultFlip: (landmarkFlip + operationNum) % 2,
        resultRotation: landmarkRotation + (3 - 2 * (landmarkFlip % 2))
    };
  } else {
    if (c <= 0.5){
      const newLandmark = flipLandmark(Math.sqrt(c*2) - c, operationNum);
      const fold: FoldDrawingElements = {
        line: rotateLine([c,0,1 - Math.sqrt(c*2) + c,1], landmarkRotation, landmarkFlip),
        arrows: [[0,1,1,Math.sqrt(2*c)]],
        description: "Fold from the landmark so that the||" + rotateCornerDescription(3, landmarkRotation, landmarkFlip) + " corner lies on the " + rotateEdgeDescription(1, landmarkRotation, landmarkFlip) + " edge",
        points: [[c,0],[0,1],[1,Math.sqrt(2*c),Math.PI/2]]
      };
      return {
        newLandmark,
        elements: [fold],
        resultFlip: (landmarkFlip + operationNum) % 2,
        resultRotation: (landmarkRotation + 2) % 2
      };
    } else {
      const newLandmark = flipLandmark(c - Math.sqrt(c*2 - 1), operationNum);
      const fold: FoldDrawingElements = {
        line: rotateLine([c,0,c - Math.sqrt(c*2 - 1),1], landmarkRotation, landmarkFlip),
        arrows: [[0,0,1,Math.sqrt(2*c-1)]],
        description: "Fold from the landmark so that the||" + rotateCornerDescription(0, landmarkRotation, landmarkFlip) + " corner lies on the " + rotateEdgeDescription(1, landmarkRotation, landmarkFlip) + " edge",
        points: [[c,0],[0,0],[1,Math.sqrt(2*c-1),Math.PI/2]]
      };
      return {
        newLandmark,
        elements: [fold],
        resultFlip: (landmarkFlip + operationNum + 1) % 2,
        resultRotation: (landmarkRotation + 2) % 2
      };
    }
  }
}