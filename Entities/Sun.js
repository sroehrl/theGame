import GameEvent from "../Helpers/GameEvent.js";

export default class Sun{
    #intensity;
    #position;
    #spaceStation;
    constructor(phaserGame, position, spaceStation) {
        this.#intensity = 0.01;
        this.#spaceStation = spaceStation;
        this.element = phaserGame.createSun(...position)
        this.#position = position;
        this.init()
    }
    init(){

        // setInterval()
    }
    addIntensity(add){
        this.#intensity += add;
    }
    getIntensity(){
        return this.#intensity;
    }
    bind(){
        return this.element;
    }

    registerListener(elem) {
        this.element.on('pointerdown',ev =>{
            const dispatch = new GameEvent('sun', this);
            elem.dispatchEvent(dispatch)
        })
    }
}