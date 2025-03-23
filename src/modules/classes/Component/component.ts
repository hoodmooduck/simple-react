import { replaceDomProp, addChildren } from "./functions.ts";

type Props = {
  [key: string]: any;
};

export class Component {
  type: string;
  key: string;
  props: Props;
  children: (Component | string)[];
  component: HTMLElement | null;

  constructor(
    type: string,
    props: Props = {},
    children: (Component | string)[] = [],
    key: string = ""
  ) {
    this.props = new Proxy<Props>(props, {
      set: (target, key: string, val: any) => {
        target[replaceDomProp(key)] = val;
        this.rerender();
        return true;
      },
    });

    this.children = new Proxy<(Component | string)[]>(children, {
      set: (target, prop: string, val: Component | string) => {
        if (prop === "length" || !isNaN(Number(prop))) {
          target[prop as any] = val;
          this.rerender();
          return true;
        }
        return false;
      },
    });

    this.type = type;
    this.key = key;
    this.component = null;

    this.init();
  }

  init(): void {
    this.render();
  }

  render(): HTMLElement {
    const _el = document.createElement(this.type);
    this.component = _el;

    Object.entries(this.props).forEach(([key, el]) => {
      (_el as any)[replaceDomProp(key)] = el;
    });

    addChildren(this.children, _el);
    return _el;
  }

  rerender(): void {
    const newComponent = this.render();
    if (this.component?.parentElement) {
      this.component.replaceWith(newComponent);
    }
    this.component = newComponent;
  }

  mount(parent: string): void {
    const _el = document.querySelector(parent);
    if (_el instanceof Element && this.component) {
      _el.appendChild(this.component);
    } else {
      console.warn(`Can't mount to ${parent}, selector not found.`);
    }
  }

  unmount(): void {
    this.component?.remove();
    this.component = null;
  }

  get getComponent(): HTMLElement | null {
    return this.component;
  }

  get getVirtualDOM() {
    return {
      type: this.type,
      key: this.key,
      props: { ...this.props },
      children: [...this.children],
    };
  }

  toString(): string {
    return JSON.stringify(this.getVirtualDOM);
  }
}
