import { Component } from "./component.js";

export function replaceDomProp(key: string): string {
  const map: Record<string, string> = { class: "className" };
  return map[key] || key;
}

type getTypeProps = "array" | "Component" | "string" | "unknown"

function getType(child: unknown): getTypeProps {
  if (Array.isArray(child)) return "array";
  if (child instanceof Component) return "Component";
  if (typeof child === "string") return "string";
  return "unknown";
}

type Child = string | Component | Child[];

export function addChildren(
  ch: Child,
  target: HTMLElement | null
): void {
  if (!target) return;

  const type = getType(ch);

  switch (type) {
    case "string":
      target.innerHTML = ch as string;
      break;
    case "array":
      (ch as Child[]).forEach((el) => addChildren(el, target));
      break;
    case "Component":
      target.appendChild((ch as Component).render());
      break;
    default:
      console.error("Child not supported:", ch);
  }
}
