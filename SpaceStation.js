import Random from "./Random.js";
import GameEvent from "./GameEvent.js";
import Ship from "./Ship.js";
import Helper from "./Helper.js";
export default class SpaceStation{
    #resources;
    #fuelTank;
    #coords;
    constructor() {
        const rnd = new Random();
        this.#coords = [rnd.rnd(30,70),rnd.rnd(30,70)];
        this.#fuelTank = 1000;
        this.hud = null;
        this.#resources = {
            iron: 100,
            o3:321,
            water:0
        }
        this.events = {
            cargoAccepted: function (){},
            refueledShip: function (){},
            builtShip: function (){},
            refinedFuel: function(){}
        }
        this.init();
    }
    getFuelTank(){
        return this.#fuelTank;
    }
    getCoords(){
        return this.#coords;
    }
    getResources(){
        return this.#resources;
    }
    init(){
        if(this.hud){
            return;
        }
        this.stationElement = document.createElement('div');
        this.stationElement.className = 'position-absolute station';
        this.stationElement.style.left = this.#coords[0]+'%';
        this.stationElement.style.top = this.#coords[1]+'%';
    }
    registerListener(elem){
        this.hud = elem;
        this.stationElement.addEventListener('click',ev =>{
            const dispatch = new GameEvent('station', this);
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
                this.#resources[ship.getCargo().type] += ship.getCargo().amount;
                ship.resetCargo();
                this.events.cargoAccepted(this);
                resolve('cargoAccepted')
            }, ship.getCargo().amount * 5)

        }))
    }
    buildShip(){
        return new Promise((resolve, reject) => {
            setTimeout(()=>{
                if(this.#resources.o3 < 500 || this.#resources.water < 1000 || this.#resources.iron < 5000 || this.#fuelTank < 500){
                    reject('insufficient resources!')
                    return;
                }
                this.#fuelTank -= 500;
                this.#resources.o3 -= 500;
                this.#resources.water -= 1000;
                this.#resources.iron -= 5000;
                const newShip = new Ship(this);
                const dispatch = new GameEvent('newShip',newShip);
                this.events.builtShip(newShip);
                this.hud.dispatchEvent(dispatch);
                resolve(newShip)
            }, 30000)
        })

    }
    on(name, cb){
        this.events[name] = cb;
    }
    refineFuel(){
        return new Promise((resolve, reject) => {
            const amount = Math.floor(this.#resources.o3 / 2.2);
            setTimeout(()=>{
                if(amount <= 0){
                    reject(amount)
                    return;
                }
                this.#fuelTank += amount;
                this.#resources.o3 = 0;
                this.events.refinedFuel(this)
                resolve(amount)
            }, amount * 100)
        })

    }
    refuelRequest(ship){
        return new Promise((resolve,reject)=>{
            setTimeout(()=>{
                if(!Helper.proximity(ship,this) || this.#fuelTank < 1){
                    console.log('rejected')
                    reject(false);
                    return;
                }
                const rest = 500 - ship.getFuel();
                if(this.#fuelTank < rest){
                    const result = this.getFuelTank();
                    this.#fuelTank = 0;
                    ship.setFuel(result, this);
                    resolve(result);
                } else {
                    this.#fuelTank = this.#fuelTank - rest;
                    ship.setFuel(rest, this);
                    this.events.refueledShip(this)
                    resolve(rest);
                }
            },4000)
        })

    }
    bind(){
        return this.stationElement;
    }
}