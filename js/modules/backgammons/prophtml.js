import { range } from "./Utilities.js";
/** @typedef {Array.<string> & { raw:string[] }} stringLiteralArgs */
/** 
 * @callback stringToStringLiteral
 * @param {Array.<string> & { raw:string[] }} param0
 * @returns {string}
 */
/** @type {stringToStringLiteral} */
export const html = (htmls)=>htmls.join('');
/** 
* @callback rangedFooLit
* @param {number|Array} len
* @returns {stringToStringLiteral}
*/
/** @type {rangedFooLit} */
export const ranged = len=>(htmls)=>range(1, typeof len === 'number' ? len : len.length).map(x=>htmls.join('')).join(' ');