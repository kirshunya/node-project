import { BoardConstants } from "./__BoardConstants"

class shadowPropertiesRecord {
    htmlcolour = '#FFFFFF'
    _radius = '25px'
    _left = '0px'
    _top = '0px'
    constructor(htmlcolour, radius, left, top) {
        this.htmlcolour = htmlcolour || '#FFFFFF'
        this._radius = radius || '25px'
        this._left = left || '0px'
        this._top = top || '0px'
    }
    toString() {
        return `${this.htmlcolour} ${this._left} ${this._top} ${this._radius}`
    }
}
export const CONFIGS = new class {
    CANVAS = new class {
        selectionedCheckerLightning= new class {
            TeamToggling = false//as default -- WhiteLightning
            WhiteLightning = new shadowPropertiesRecord('#FFFFFF', 35)
            BlackLightning = new shadowPropertiesRecord('#000000', 35)
            /**
             * 
             * @param {int} colour 
             * @returns {string}
             */
            getShadowByTeam(colour) {
                return (this.TeamToggling?colour===BoardConstants.BLACK.id?this.BlackLightning:this.WhiteLightning:this.WhiteLightning).toString()
            }
        }
        accessibleToMoveCheckersLightning = new class {
            htmlcolour = 'yellow'
        }
        
    }
}