import { VirtualNode } from "./virtualDOM";

function isVirtualNode(node: any): node is VirtualNode {
  return typeof node !== "string";
}

export const diff = (
  oldNode: VirtualNode | string,
  newNode: VirtualNode | string
): any => {
  if (typeof newNode === "string") {
    if (oldNode !== newNode) {
      return { type: "TEXT", text: newNode };
    } else return null;
  }

  if (!oldNode) {
    return { type: "ADD", newNode };
  }

  if (!newNode) {
    return { type: "REMOVE", newNode };
  }

  if (
    !isVirtualNode(oldNode) ||
    !isVirtualNode(newNode) ||
    oldNode.type !== newNode.type
  ) {
    return { type: "REPLACE", newNode };
  }

  const propPatches = [];
  for (const key in newNode.props) {
    if (newNode.props[key] !== oldNode.props[key]) {
      propPatches.push({ key, value: newNode.props[key] });
    }
  }

  const childPatches = [];
  const max = Math.max(newNode.children.length, oldNode.children.length);
  for (let i = 0; i < max; i++) {
    if (newNode.children[i] !== oldNode.children[i]) {
      childPatches.push(diff(oldNode.children[i], newNode.children[i]) || null);
    }
  }

  return {
    type: "UPDATE",
    props: propPatches,
    children: childPatches,
  };
};

export function createElement(vNode: VirtualNode | string) {
  if (typeof vNode === "string") return document.createTextNode(vNode);

  const el = document.createElement(vNode.type);

  for (const [k, v] of Object.entries(vNode.props)) {
    (el as any)[k] = v;
  }

  vNode.children.forEach((child) => {
    const childEl =
      typeof child === "string"
        ? document.createTextNode(child)
        : createElement(child);
    el.appendChild(childEl);
  });

  return el;
}

export function patch(
  parent: HTMLElement | ChildNode,
  patches: any,
  index = 0
) {
  if (!patches) return;

  const el = parent.childNodes[index];

  switch (patches.type) {
    case "ADD":
      parent.appendChild(createElement(patches.newVNode));
      break;
    case "REMOVE":
      el.remove();
      break;
    case "REPLACE":
      parent.replaceChild(createElement(patches.newVNode), el);
      break;
    case "TEXT":
      el.textContent = patches.text;
      break;
    case "UPDATE":
      patches.props.forEach(
        ({ key, value }: { key: string; value: string }) => {
          (el as any)[key] = value;
        }
      );
      patches.children.forEach((p: any, i: number) => {
        if (p) patch(el, p, i);
      });
      break;
  }
}
