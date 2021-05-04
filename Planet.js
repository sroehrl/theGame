import GameEvent from "./GameEvent.js";
import Random from "./Random.js";
import Helper from "./Helper.js";
export default class Planet{
    #coords;
    constructor(position, type = 'water') {
        const rand = new Random();
        this.type = type;
        this.pressure = rand.rnd(10000, 500000);
        this.#coords = position;
        this.element = document.createElement('div');
        this.element.style.left = position[0]+'%';
        this.element.style.top = position[1]+'%';
        this.element.className = `position-absolute planet ${this.type}`;
        this.events = {
            click: function (){},
            cargoAccepted: function (){},
            mined: function (){}
        }
    }
    getCoords(){
        return this.#coords;
    }
    mineMe(ship){
        return new Promise((resolve, reject)=>{
            if(!Helper.proximity(this,ship) || ship.getCargo().amount >= 500 || (ship.getCargo().amount > 0 && ship.getCargo().type !== this.type)){
                reject(false)
                return;
            }
            setTimeout(()=>{
                ship.setCargo(this.type, 500, this)
                this.events.mined(ship);
                resolve(500);
            },this.pressure / 10 * ship.getBeamStrength())
        })

    }
    registerListener(elem){
        this.element.addEventListener('click',ev =>{
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