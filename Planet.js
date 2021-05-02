import GameEvent from "./GameEvent.js";
import Random from "./Random.js";
export default class Planet{
    constructor(position, type = 'water') {
        const rand = new Random();
        this.type = type;
        this.pressure = rand.rnd(10000, 500000);
        this.coords = position;
        this.element = document.createElement('div');
        this.element.style.left = position[0]+'%';
        this.element.style.top = position[1]+'%';
        this.element.className = `position-absolute planet ${this.type}`;
        this.events = {
            click: function (){}
        }
    }
    mineMe(ship){
        return new Promise((resolve, reject)=>{
            if(ship.position[0] !== this.coords[0] || ship.position[1] !== this.coords[1] || ship.cargo.amount >= 500 || (ship.cargo.amount > 0 && ship.cargo.type !== this.type)){
                reject(false)
            }
            setTimeout(()=>{
                ship.cargo.type = this.type;
                ship.cargo.amount = 500;
                resolve(500);
            },1500)
        })

    }
    registerListener(elem){
        this.element.addEventListener('click',ev =>{
            const dispatch = new GameEvent('planet', {
                type: this.type,
                pressure: this.pressure,
                coords: this.coords
            });
            elem.dispatchEvent(dispatch)
        })
    }
    on(name, cb){
        this.events[name] = cb;
    }
    bind(){

        return this.element;
    }
}