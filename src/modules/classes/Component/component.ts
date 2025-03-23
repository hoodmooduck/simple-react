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
        const oldVal = target[key];

        // Если новое значение отличается от старого
        if (oldVal !== val) {
          target[replaceDomProp(key)] = val; // Обновляем свойство
          this.rerender(); // Вызываем перерисовку компонента
        }

        return true; // Успешно обновлено
      },
    });

    this.children = new Proxy<(Component | string)[]>(children, {
      set: (target, prop: string, val: Component | string) => {
        if (prop === "length" || !isNaN(Number(prop))) {
          target[prop as any] = val;
          this.rerender(); // Вызываем перерисовку при изменении дочерних элементов
          return true;
        }
        return false; // Не обновляем другие свойства
      },
    });

    this.type = type;
    this.key = key;
    this.component = null;

    this.init(); // Инициализация компонента
  }

  init(): void {
    this.render(); // Начальная отрисовка компонента
  }

  render(): HTMLElement {
    const _el = document.createElement(this.type);
    this.component = _el;

    // Применяем свойства
    Object.entries(this.props).forEach(([key, el]) => {
      (_el as any)[replaceDomProp(key)] = el;
    });

    // Добавляем дочерние элементы
    addChildren(this.children, _el);
    return _el;
  }

  rerender(): void {
    const newComponent = this.render(); // Создаем новый элемент на основе обновленных свойств
    if (this.component?.parentElement) {
      this.component.replaceWith(newComponent); // Заменяем старый элемент новым
    }
    this.component = newComponent; // Обновляем компонент
  }

  mount(parent: string): void {
    const _el = document.querySelector(parent);
    if (_el instanceof Element && this.component) {
      _el.appendChild(this.component); // Добавляем компонент на страницу
    } else {
      console.warn(`Can't mount to ${parent}, selector not found.`);
    }
  }

  unmount(): void {
    this.component?.remove(); // Удаляем компонент из DOM
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
