export interface AgentChartPoint {
  label: string;
  value: number;
}

export interface AgentChartDemo {
  title: string;
  description: string;
  unit: string;
  values: AgentChartPoint[];
}

export function getAgentChartDemo(): AgentChartDemo {
  return {
    title: "Agent readiness by surface",
    description: "Hard-coded demo data for testing component-owned agent Markdown output.",
    unit: "score",
    values: [
      { label: "Raw Markdown", value: 96 },
      { label: "Copy Page", value: 94 },
      { label: "LLMs Index", value: 91 },
    ],
  };
}
