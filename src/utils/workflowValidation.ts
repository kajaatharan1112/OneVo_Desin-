import type { Workflow, WorkflowEdge, WorkflowNode } from '../types/workflow';

export interface ValidationIssue {
  id: string;
  severity: 'error' | 'warning';
  message: string;
}

const TERMINAL_TYPES = new Set(['end']);
const TERMINAL_ACTIONS = new Set(['End Workflow']);

function isTerminalNode(node: WorkflowNode): boolean {
  if (TERMINAL_TYPES.has(node.type)) return true;
  if (node.type === 'action' && TERMINAL_ACTIONS.has(node.config.actionType ?? node.label)) return true;
  return false;
}

function getOutgoingEdges(nodeId: string, edges: WorkflowEdge[]): WorkflowEdge[] {
  return edges.filter(e => e.source === nodeId);
}

function getIncomingEdges(nodeId: string, edges: WorkflowEdge[]): WorkflowEdge[] {
  return edges.filter(e => e.target === nodeId);
}

function hasBranch(edges: WorkflowEdge[], types: string[]): boolean {
  return types.every(t => edges.some(e => e.conditionType === t));
}

export function validateWorkflow(workflow: Workflow): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const { nodes, edges } = workflow;

  const triggers = nodes.filter(n => n.type === 'trigger');
  const terminals = nodes.filter(isTerminalNode);

  if (triggers.length === 0) {
    issues.push({ id: 'no-trigger', severity: 'error', message: 'Workflow must have exactly one trigger node.' });
  } else if (triggers.length > 1) {
    issues.push({ id: 'multi-trigger', severity: 'error', message: 'Workflow must have exactly one trigger node.' });
  }

  if (terminals.length === 0) {
    issues.push({ id: 'no-terminal', severity: 'error', message: 'Workflow must have at least one end node or terminal action.' });
  }

  for (const node of nodes) {
    if (node.type === 'trigger') continue;

    const incoming = getIncomingEdges(node.id, edges);
    if (incoming.length === 0) {
      issues.push({ id: `no-in-${node.id}`, severity: 'error', message: `"${node.label}" has no incoming connection.` });
    }
  }

  for (const node of nodes) {
    if (isTerminalNode(node)) continue;

    const outgoing = getOutgoingEdges(node.id, edges);
    if (outgoing.length === 0) {
      issues.push({ id: `no-out-${node.id}`, severity: 'error', message: `"${node.label}" has no outgoing connection.` });
    }

    if (node.type === 'condition') {
      if (!hasBranch(outgoing, ['yes', 'no'])) {
        issues.push({ id: `cond-branch-${node.id}`, severity: 'error', message: `"${node.label}" must have yes and no branches.` });
      }
    }

    if (node.type === 'approval') {
      if (!hasBranch(outgoing, ['approved', 'rejected'])) {
        issues.push({ id: `appr-branch-${node.id}`, severity: 'error', message: `"${node.label}" must have approved and rejected branches.` });
      }
    }

    if (node.type === 'alert' && !node.config.severity) {
      issues.push({ id: `alert-sev-${node.id}`, severity: 'error', message: `"${node.label}" requires alert severity.` });
    }
  }

  if (!workflow.name.trim()) {
    issues.push({ id: 'no-name', severity: 'error', message: 'Workflow name is required.' });
  }

  return issues;
}

export function canActivate(workflow: Workflow): boolean {
  return validateWorkflow(workflow).filter(i => i.severity === 'error').length === 0;
}
