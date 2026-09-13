function nC2(n) {
  return (n * (n - 1)) / 2;
}

export function countGridRectangles(rows, cols) {
  return nC2(rows + 1) * nC2(cols + 1);
}

export function countFanTriangles(n) {
  return (n * (n + 1)) / 2;
}

export function buildGridFigure(rows, cols, { width = 220, height = 220, stroke = "#25233a" } = {}) {
  const shapes = [];
  for (let r = 0; r <= rows; r++) {
    const y = (height / rows) * r;
    shapes.push({ type: "line", x1: 0, y1: y, x2: width, y2: y, stroke, strokeWidth: 2 });
  }
  for (let c = 0; c <= cols; c++) {
    const x = (width / cols) * c;
    shapes.push({ type: "line", x1: x, y1: 0, x2: x, y2: height, stroke, strokeWidth: 2 });
  }
  return { width, height, shapes };
}

export function buildFanFigure(n, { width = 220, height = 220, stroke = "#25233a" } = {}) {
  const apex = { x: width / 2, y: 10 };
  const baseY = height - 10;
  const shapes = [];
  const basePoints = [];
  for (let i = 0; i <= n; i++) {
    basePoints.push({ x: 10 + ((width - 20) / n) * i, y: baseY });
  }
  // outer two sides
  shapes.push({ type: "line", x1: apex.x, y1: apex.y, x2: basePoints[0].x, y2: basePoints[0].y, stroke, strokeWidth: 2 });
  shapes.push({ type: "line", x1: apex.x, y1: apex.y, x2: basePoints[n].x, y2: basePoints[n].y, stroke, strokeWidth: 2 });
  // internal cevians (n-1 of them) + the base line itself
  for (let i = 1; i < n; i++) {
    shapes.push({ type: "line", x1: apex.x, y1: apex.y, x2: basePoints[i].x, y2: basePoints[i].y, stroke, strokeWidth: 2 });
  }
  shapes.push({ type: "line", x1: basePoints[0].x, y1: baseY, x2: basePoints[n].x, y2: baseY, stroke, strokeWidth: 2 });
  return { width, height, shapes };
}

export function buildDiffPair(baseShapes, changes) {
  const before = baseShapes.map(s => ({ ...s }));
  const after = baseShapes.map(s => ({ ...s }));
  for (const change of changes) {
    if (change.remove !== undefined) {
      after[change.remove] = null;
    } else if (change.add) {
      after.push({ ...change.add });
    } else {
      after[change.index] = { ...after[change.index], ...change.patch };
    }
  }
  return { before, after: after.filter(Boolean) };
}
