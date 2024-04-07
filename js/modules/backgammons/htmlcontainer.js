/**
 *
 * @param {string} tag
 * @param {string[]} classList
 * @param {{$attrname:string}[]} attributes
 * @param {{$dataname:string}[]} dataset
 * @param {{$eventname:Function}[]} events
 * @returns
 */
export function htmlelement(tag, classList, attributes, dataset, events, components) {
  const el = document.createElement(tag);
  classList && (typeof classList === 'string')
    ? el.classList.add(...classList.split(' '))
    : el.classList.add(...classList);
  attributes && Object.entries(attributes).map(([name, value]) => el[name] = value);
  dataset && Object.entries(dataset).map(([name, value]) => el.dataset[name] = value);
  events && Object.entries(events).map(([name, callback]) => el.addEventListener(name, callback));
  components && components.map(constructor=>constructor(el));
  return el;
}
/**
 *
 * @param {string} tag
 * @param {string[]} classList
 * @param {string} innerHTML
 * @param {{$attrname:string}[]} attributes
 * @param {{$dataname:string}[]} dataset
 * @param {{$eventname:Function}[]} events
 * @returns
 */
export function htmltext(tag, classList, innerHTML, attributes, dataset, events) {
  const el = htmlelement(tag, classList, attributes, dataset, events);
  el.innerHTML = innerHTML;
  return el;
}
/**
 *
 * @param {HTMLElement} element
 * @param {{$tag:{classList:string[], attributes:{$attrname:string}[], dataset:{$dataname:string}[], events:{$eventname:Function}[]}}[]} contains
 */
function __htmlcontainer(element, contains) {
  for (const [tag, elinfo] of contains) {
    /** @type {{classList:string[], attributes:{$attrname:string}[], dataset:{$dataname:string}[], events:{$eventname:Function}[]}} */
    const { classList, attributes, dataset, events } = elinfo;
    element.appendChild(htmlelement(tag, classList, attributes, dataset, events));
  }
  return element;
}
/**
 *
 * @param {HTMLElement} element
 * @param {HTMLElement[]} contains
 */
export function htmlcontainer(element, contains) {
  contains.map(child => element.appendChild(child));
  return element;
}
