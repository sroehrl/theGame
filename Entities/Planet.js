import GameEvent from "../Helpers/GameEvent.js";
import Random from "../Helpers/Random.js";
import Helper from "../Helpers/Helper.js";
export default class Planet{
    #coords;
    #type;
    #pressure;
    constructor(phaserGame, position, type = 'water') {
        const rand = new Random();
        this.#type = type;
        this.#pressure = rand.rnd(10000, 400000);
        this.#coords = position;
        this.element = phaserGame.createPlanet(...this.#coords, type)
        this.events = {
            click: function (){},
            cargoAccepted: function (){},
            mined: function (){}
        }
    }
    getCoords(){
        return this.#coords;
    }
    getType(){
        return this.#type;
    }
    getPressure(){
        return this.#pressure;
    }
    mineMe(ship){
        return new Promise((resolve, reject)=>{
            if(!Helper.proximity(this,ship) || ship.getCargo().amount >= 500 || (ship.getCargo().amount > 0 && ship.getCargo().type !== this.#type)){
                reject(false)
                return;
            }
            setTimeout(()=>{
                ship.setCargo(this.#type, ship.getCapacity(), this)
                this.events.mined(ship);
                resolve(ship.getCapacity());
            },this.#pressure / (10 * ship.getBeamStrength()))
        })

    }
    registerListener(elem){
        this.element.on('pointerdown',ev =>{
            const dispatch = new GameEvent('planet', this);
            elem.dispatchEvent(dispatch)
        })
    }
    acceptCargo(ship){
        return new Promise(((resolve, reject) => {
            setTimeout(()=>{
                if(!Helper.proximity(ship,this) || ship.getCargo().amount < 1){
                    reject(false);
                    return;
                }
                ship.resetCargo();
                this.events.cargoAccepted(this);
                resolve('cargoAccepted')
            }, ship.getCargo().amount * 5)

        }))
    }
    on(name, cb){
        this.events[name] = cb;
    }
    bind(){
        return this.element;
    }
}