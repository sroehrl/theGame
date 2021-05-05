import Random from "./Random.js";
import GameEvent from "./GameEvent.js";
import Ship from "./Ship.js";
import Helper from "./Helper.js";
export default class SpaceStation{
    #resources;
    #fuelTank;
    #coords;
    #modules;
    #moduleRequirements;
    #stats;
    #lastTotal=0;
    constructor() {
        const rnd = new Random();
        this.#coords = [rnd.rnd(30,70),rnd.rnd(30,70)];
        this.#fuelTank = 1000;
        this.hud = null;
        this.#modules = {
            cargoModule: 0,
            beamerModule: 0
        }
        this.#stats = {
            shipsBuilt: 0,
            waterMined:0,
            ironMined:0,
            o3Mined:0,
            modulesBuilt:0,
        }
        this.#moduleRequirements = {
            cargoModule: {
                water: rnd.rnd(2000, 6000),
                iron: rnd.rnd(1000, 2000),
                o3: rnd.rnd(600, 2000)
            },
            beamerModule: {
                water: rnd.rnd(1000, 8000),
                iron: rnd.rnd(1000, 8000),
                o3: rnd.rnd(1000, 3000)
            }
        }
        this.#resources = {
            iron: 100,
            o3:321,
            water:210
        }
        this.events = {
            cargoAccepted: function (){},
            refueledShip: function (){},
            builtShip: function (){},
            refinedFuel: function(){},
            builtModule: function (){}
        }
        setInterval(()=>{
            const total = this.#stats.waterMined + this.#stats.ironMined + this.#stats.o3Mined;
            this.#lastTotal = total - this.#lastTotal;
        },60000)
        this.init();
    }
    getLevel(){
        return this.#lastTotal;
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
    getModules(){
        return this.#modules;
    }
    getModuleRequirements(){
        return this.#moduleRequirements;
    }
    getStats(){
        return this.#stats;
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
    cheat(){
        if(location.hostname === "localhost"){
            this.#modules.cargoModule = 50;
            this.#modules.beamerModule = 50;
            this.#resources.o3 = 100000;
            this.#resources.iron = 100000;
            this.#resources.water = 100000;
            this.#fuelTank = 100000;
        }
    }
    equip(ship, moduleString){
        return new Promise((resolve, reject) => {

            if(!Helper.proximity(this, ship) || typeof this.#modules[moduleString] === 'undefined' || this.#modules[moduleString] < 1){
                reject('failed to equip ship');
                return;
            }
            switch(moduleString){
                case 'cargoModule':
                    this.#modules[moduleString]--;
                    resolve(500/(ship.getCapacity()/500))
                    break;
                case 'beamerModule':
                    this.#modules[moduleString]--;
                    resolve(1/(ship.getBeamStrength()/1))
                    break;
            }
        })

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
                this.#stats[ship.getCargo().type+'Mined'] += ship.getCargo().amount;
                ship.resetCargo();
                this.events.cargoAccepted(this);
                resolve('cargoAccepted')
            }, ship.getCargo().amount * 5)

        }))
    }
    buildModule(moduleString) {
        return new Promise((resolve, reject) => {
            if(typeof this.#moduleRequirements[moduleString] === 'undefined'){
                reject('unknown module');
                return;
            }
            const requirements = this.getModuleRequirements()[moduleString];
            if(Object.keys(requirements).filter(key=>this.getResources()[key]< requirements[key]).length > 0){
                reject('insufficient resources');
                return;
            }
            Object.keys(requirements).forEach(key=>{
                this.#resources[key] -= requirements[key];
            })
            setTimeout(()=>{
                this.#modules[moduleString]++;
                this.#stats.modulesBuilt++;
                this.events.builtModule(this.getModules())
                resolve(this.getModules())
            }, 25000)
        })
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
                this.#stats.shipsBuilt++
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
            this.#resources.o3 -= amount;
            setTimeout(()=>{
                if(amount <= 0){
                    reject(amount)
                    return;
                }
                this.#fuelTank += amount;
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