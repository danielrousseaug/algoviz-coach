import type { VisualizationPlan, VisualizationStep } from '@/lib/schemas/visualization';

function toStringId(value: unknown): string {
  try {
    const s = String(value ?? '');
    return s.length > 0 ? s : Math.random().toString(36).slice(2);
  } catch {
    return Math.random().toString(36).slice(2);
  }
}

function sanitizeAnnotations(annotations: VisualizationStep['annotations']): VisualizationStep['annotations'] {
  if (!annotations || !Array.isArray(annotations)) return [];
  return annotations
    .filter((a) => a && typeof a.text === 'string' && a.position)
    .map((a) => ({
      text: a.text,
      position: {
        x: Number(a.position.x ?? 10) || 10,
        y: Number(a.position.y ?? 20) || 20,
      },
      style: a.style || {},
    }));
}

function sanitizeArrayStep(step: VisualizationStep): VisualizationStep {
  const data = step.data || {};
  let elements: unknown[] = [];
  if (Array.isArray(data.elements)) {
    elements = data.elements;
  } else if (Array.isArray((data as any).array)) {
    elements = (data as any).array;
  } else if (typeof data === 'object' && data) {
    // Try values field as a fallback
    if (Array.isArray((data as any).values)) {
      elements = (data as any).values;
    }
  }

  // Coerce to primitives for rendering
  elements = elements.map((e) => (typeof e === 'object' ? JSON.stringify(e) : e));

  // Normalize highlights: allow numbers or strings; output strings matching element index
  const highlightsRaw = step.highlights || [];
  const valueToIndex = new Map<string, number>();
  elements.forEach((el, idx) => {
    valueToIndex.set(String(el), idx);
  });
  const highlights: string[] = highlightsRaw
    .map((h) => {
      if (typeof (h as any) === 'number') return String(h);
      const idx = valueToIndex.get(String(h));
      return idx !== undefined ? String(idx) : String(h);
    })
    .map(String);

  return {
    ...step,
    data: { elements },
    highlights,
    annotations: sanitizeAnnotations(step.annotations),
  };
}

function sanitizeTreeStep(step: VisualizationStep): VisualizationStep {
  const data = step.data || {};
  let tree = (data as any).tree ?? (data as any).root ?? null;
  if (!tree) return { ...step, type: 'custom', data, annotations: sanitizeAnnotations(step.annotations) };

  const assignIds = (node: any): any => {
    if (!node) return null;
    const id = toStringId(node.id ?? node.value ?? Math.random());
    return {
      id,
      value: node.value ?? id,
      left: assignIds(node.left ?? node.leftChild ?? null),
      right: assignIds(node.right ?? node.rightChild ?? null),
    };
  };

  tree = assignIds(tree);
  return { ...step, data: { tree }, annotations: sanitizeAnnotations(step.annotations) };
}

function sanitizeGraphStep(step: VisualizationStep): VisualizationStep {
  const data = step.data || {};
  let nodes = Array.isArray((data as any).nodes) ? (data as any).nodes : [];
  let edges = Array.isArray((data as any).edges) ? (data as any).edges : [];

  nodes = nodes.map((n: any, i: number) => ({
    id: toStringId(n.id ?? i),
    label: String(n.label ?? n.id ?? i),
    x: typeof n.x === 'number' ? n.x : undefined,
    y: typeof n.y === 'number' ? n.y : undefined,
  }));

  edges = edges.map((e: any) => ({
    source: toStringId(e.source ?? e.from),
    target: toStringId(e.target ?? e.to),
    weight: typeof e.weight === 'number' ? e.weight : undefined,
  }));

  return { ...step, data: { nodes, edges }, annotations: sanitizeAnnotations(step.annotations) };
}

function sanitizeStep(step: VisualizationStep, index: number): VisualizationStep {
  const id = step.id || toStringId(index);
  const description = step.description || `Step ${index + 1}`;
  const base: VisualizationStep = { ...step, id, description };
  try {
    switch (step.type) {
      case 'array':
        return sanitizeArrayStep(base);
      case 'tree':
        return sanitizeTreeStep(base);
      case 'graph':
        return sanitizeGraphStep(base);
      default:
        return { ...base, annotations: sanitizeAnnotations(step.annotations) };
    }
  } catch {
    return { ...base, type: 'custom', data: step.data || {}, annotations: sanitizeAnnotations(step.annotations) };
  }
}

export function prepareVisualizationPlan(plan: VisualizationPlan): VisualizationPlan {
  const safeSteps = Array.isArray(plan.steps) ? plan.steps : [];
  const normalizedSteps = safeSteps.map((s, i) => sanitizeStep(s, i));

  const title = plan.title || 'Visualization';
  const description = plan.description || '';
  const complexity = plan.complexity || { time: '—', space: '—' };
  const initialState = (plan as any).initialState ?? {};
  const finalState = (plan as any).finalState ?? {};

  return {
    title,
    description,
    algorithmType: plan.algorithmType || 'generic',
    complexity,
    steps: normalizedSteps,
    initialState,
    finalState,
  };
}


