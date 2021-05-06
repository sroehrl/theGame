import GameEvent from "./GameEvent.js";

export default class Sun{
    #intensity;
    #position;
    #spaceStation;
    constructor(position, spaceStation) {
        this.#intensity = 0.01;
        this.#spaceStation = spaceStation;
        this.element = document.createElement('div');
        this.element.className = 'position-absolute sun';
        this.element.style.left = position[0]+'%';
        this.element.style.top = position[1]+'%';
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
        this.element.addEventListener('click',ev =>{
            const dispatch = new GameEvent('sun', this);
            elem.dispatchEvent(dispatch)
        })
    }
}