import { Component } from "../Component/component.js";

export type Props = {
  [key: string]: any;
};

export type VirtualNode = {
  type: string;
  key: string;
  props: Props;
  children: (VirtualNode | string)[];
};

export class VirtualDOM {
  app: Component;
  virtualDOM: VirtualNode | string | null;

  constructor(app: Component) {
    this.app = app;
    this.virtualDOM = null;
  }

  buildVirtualDOM(component: Component): VirtualNode | string {
    if (typeof component === "string") return component;

    const vdom: VirtualNode | string = {
      type: component.type,
      key: component.key,
      props: { ...component.props },
      children: [],
    };

    for (const child of component.children) {
      if (typeof child === "string") {
        vdom.children.push(child);
      } else {
        vdom.children.push(this.buildVirtualDOM(child));
      }
    }

    return vdom;
  }
}
