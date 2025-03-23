import { dividers } from "./functions.ts";

export class BEM {
  mainClass: string;
  subClass: string;
  state: Object;
  className: string;

  constructor(mainClass = "", subClass = "", state = {}) {
    if (!mainClass) throw new Error("Missing main class");

    this.mainClass = mainClass;
    this.subClass = subClass;
    this.state = state;
    this.className = this.generateClass();
  }

  generateClass() {
    const base = this.subClass
      ? this.mainClass + dividers.sub + this.subClass
      : this.mainClass;

    if (!Object.keys(this.state).length) return base;

    const classes = [base];
    for (const [key, val] of Object.entries(this.state)) {
      if (val) classes.push(`${base}${dividers.state}${key}`);
    }

    return classes.join(" ");
  }

  toString() {
    return this.className;
  }
}
