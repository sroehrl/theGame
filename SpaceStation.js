import Random from "./Random.js";
import GameEvent from "./GameEvent.js";
import Ship from "./Ship.js";
export default class SpaceStation{
    constructor() {
        const rnd = new Random();
        this.coords = [rnd.rnd(30,70),rnd.rnd(30,70)];
        this.fuelTank = 1000;
        this.hud = null;
        this.resources = {
            iron: 0,
            o3:0,
            water:0
        }
        this.events = {
            cargoAccepted: function (){},
            refueledShip: function (){},
            builtShip: function (){}
        }
        this.init();
    }
    init(){
        if(this.hud){
            return;
        }
        this.stationElement = document.createElement('div');
        this.stationElement.className = 'position-absolute station';
        this.stationElement.style.left = this.coords[0]+'%';
        this.stationElement.style.top = this.coords[1]+'%';
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
                if(ship.position[0] !== this.coords[0] || ship.position[1] !== this.coords[1] || ship.cargo.amount < 1){
                    reject(false);
                }
                this.resources[ship.cargo.type] += ship.cargo.amount;
                ship.cargo.type = null;
                ship.cargo.amount = 0;
                this.events.cargoAccepted(this);
                resolve('cargoAccepted')
            }, ship.cargo.amount * 5)

        }))
    }
    buildShip(){
        return new Promise((resolve, reject) => {
            setTimeout(()=>{
                if(this.resources.o3 < 500 || this.resources.water < 1000 || this.resources.iron < 5000 || this.fuelTank < 500){
                    reject('insufficient resources!')
                }
                this.fuelTank -= 500;
                this.resources.o3 -= 500;
                this.resources.water -= 1000;
                this.resources.iron -= 5000;
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
            const amount = this.resources.o3 / 3;
            setTimeout(()=>{
                if(amount <= 0){
                    reject(amount)
                }
                this.fuelTank += amount;
                this.resources.o3 = 0;
                resolve(amount)
            }, amount * 100)
        })

    }
    refuelMe(ship){
        return new Promise((resolve,reject)=>{
            setTimeout(()=>{
                if(ship.position[0] !== this.coords[0] || ship.position[1] !== this.coords[1] || this.fuelTank < 1){
                    reject(false);
                }
                const rest = 500 - ship.fuel;
                if(this.fuelTank < rest){
                    const result = this.fuelTank;
                    this.fuelTank = 0;
                    ship.fuel += result;
                    resolve(result);
                } else {
                    this.fuelTank = this.fuelTank - rest;
                    ship.fuel += rest;
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