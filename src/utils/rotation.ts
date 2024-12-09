import type { Arrow, Point, Line, LineSection } from "@/types/types";

export function rotatePoint (x: number, y: number, r: number, f: number): Point { // r is the number of clockwise rotations
  let p: Point | undefined
  if (r % 4 == 0) {
    p = [x, y];
  } else if (r % 4 == 1) {
    p = [1 - y, x];
  } else if (r % 4 == 2) {
    p = [1 - x, 1 - y];
  } else {
    p = [y, 1 - x];
  }
  if (f % 2 == 1) {
    if (r % 2 == 1) {
      return [p[0], 1 - p[1]]
    } else {
      return [1 - p[0], p[1]]
    }
  }
  return p;
};

export function rotateLine (li: Line, r: number, f: number): Line {
  var p1 = rotatePoint(li[0], li[1], r, f);
  var p2 = rotatePoint(li[2], li[3], r, f);
  return [p1[0], p1[1], p2[0], p2[1]];
};
export function flipLandmark (p: number, f: number ) {
  return f%2 == 0 ? p : 1 - p;
};
export function rotateCornerDescription (p: number, landmarkRotation: number, landmarkFlip: number): string {
  const cornerNames = ["top left", "top right", "bottom right", "bottom left"];
  if (landmarkFlip % 2 == 1) {
    if (landmarkRotation % 2 == 1) {
      return cornerNames[(p + landmarkRotation + 2 * (p % 2) + 3) % 4];
    } else {
      return cornerNames[(p + landmarkRotation - 2 * (p % 2) + 1) % 4];
    }
  }
  return cornerNames[(p + landmarkRotation) % 4];
};
export function rotateEdgeDescription (e: number, landmarkRotation: number, landmarkFlip: number): string {
  const edgeNames = ["top", "right", "bottom", "left"];
  if (landmarkFlip % 2 == 1) {
    if (landmarkRotation % 2 == 1) {
      return edgeNames[(e + landmarkRotation + 2 * ((e + 1) % 2)) % 4];
    } else {
      return edgeNames[(e + landmarkRotation + 2 * (e % 2)) % 4];
    }
  }
  return edgeNames[(e + landmarkRotation) % 4];
};