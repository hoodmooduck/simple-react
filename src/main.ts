import { Component } from "./modules/classes/Component/component";
import { createElement } from "./modules/classes/VirtualDOM/functions";
import { VirtualDOM } from "./modules/classes/VirtualDOM/virtualDOM";

// Создание компонента Header
const Header = new Component(
  "header",
  {
    className: "header",
    style:
      "width: 100%; background: #000; position: fixed; top: 0; color: #fff",
    onclick: () => {
      // Изменение стиля
      Header.props.style =
        "width: 100%; background: rgb(201, 85, 85); position: fixed; top: 0; color: #fff";
    },
  },
  ["Header"]
);

// Создание основного компонента App
const App = new Component(
  "div",
  {
    className: "app",
    style:
      "display: flex; flex-direction: column; align-items: center; justify-content: center; height: 97.5vh;",
  },
  [Header]
);

const root = document.getElementById("app");

function renderApp() {
  const newVNode = App.getVirtualDOM; // Получаем обновленный виртуальный DOM
  console.log(newVNode);
  
  const appElement = createElement(newVNode); // Создаем реальный DOM
  if (root) {
    root.innerHTML = ""; // Очищаем старый DOM
    root.appendChild(appElement); // Добавляем новый
  }
}

// Инициализация виртуального DOM с Proxy
const main = new VirtualDOM(App);
let _target = main.buildVirtualDOM(App);

let appElement;
const vDom =
  typeof _target === "string"
    ? _target
    : new Proxy(_target, {
        set: (target, key: string, val: any) => {
          const result = Reflect.set(target, key, val);
          
          // Вызываем перерисовку при изменении данных
          renderApp();

          return result;
        },
      });

// Инициализация отображения первого рендера
if (root) {
  appElement = createElement(vDom);
  root.appendChild(appElement);
}

renderApp();
