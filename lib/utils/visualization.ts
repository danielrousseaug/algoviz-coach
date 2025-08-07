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
  } else if (Array.isArray((data as Record<string, unknown>).array as unknown[])) {
    elements = ((data as Record<string, unknown>).array as unknown[]) || [];
  } else if (typeof data === 'object' && data) {
    // Try values field as a fallback
    if (Array.isArray((data as Record<string, unknown>).values as unknown[])) {
      elements = ((data as Record<string, unknown>).values as unknown[]) || [];
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
      if (typeof h === 'number') return String(h);
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
  const record = data as Record<string, unknown>;
  const rawTree =
    (record.tree as Record<string, unknown> | null | undefined) ??
    (record.root as Record<string, unknown> | null | undefined) ??
    null;
  if (!rawTree) return { ...step, type: 'custom', data, annotations: sanitizeAnnotations(step.annotations) };

  const assignIds = (
    node: Record<string, unknown> | null
  ): Record<string, unknown> | null => {
    if (!node) return null;
    const id = toStringId(node.id ?? node.value ?? Math.random());
    return {
      id,
      value: node.value ?? id,
      left: assignIds((node.left as Record<string, unknown> | null) ?? (node.leftChild as Record<string, unknown> | null) ?? null),
      right: assignIds((node.right as Record<string, unknown> | null) ?? (node.rightChild as Record<string, unknown> | null) ?? null),
    };
  };

  const treeWithIds = assignIds(rawTree);
  return { ...step, data: { tree: treeWithIds }, annotations: sanitizeAnnotations(step.annotations) };
}

function sanitizeGraphStep(step: VisualizationStep): VisualizationStep {
  const data = step.data || {};
  const rec = data as Record<string, unknown>;
  let nodes = Array.isArray(rec.nodes as unknown[]) ? ((rec.nodes as unknown[]) as Array<Record<string, unknown>>) : [];
  let edges = Array.isArray(rec.edges as unknown[]) ? ((rec.edges as unknown[]) as Array<Record<string, unknown>>) : [];

  nodes = nodes.map((n, i: number) => ({
    id: toStringId(n.id ?? i),
    label: String((n.label as unknown) ?? (n.id as unknown) ?? i),
    x: typeof n.x === 'number' ? (n.x as number) : undefined,
    y: typeof n.y === 'number' ? (n.y as number) : undefined,
  }));

  edges = edges.map((e) => ({
    source: toStringId((e.source as unknown) ?? (e.from as unknown)),
    target: toStringId((e.target as unknown) ?? (e.to as unknown)),
    weight: typeof e.weight === 'number' ? (e.weight as number) : undefined,
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
  const initialState = plan.initialState ?? {};
  const finalState = plan.finalState ?? {};

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


