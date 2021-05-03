import GameEvent from "./GameEvent.js";
import Helper from "./Helper.js";
import AudioFx from "./AudioFx.js";
import Random from "./Random.js";
export default class Ship{
    #fuel = 500;
    #cargo;
    #position;
    constructor(spaceStation, first=false) {
        this.spaceStation = spaceStation;
        this.audioFxFly = new AudioFx('flying');
        this.audioFxBeam = new AudioFx('beam');
        this.audioFxRefuel = new AudioFx('refuel');
        const random = new Random()
        this.name = 'DSS-'+random.string(4);
        this.#fuel = 500;
        if(first){
            this.#position = [50,50];
        } else {
            this.#position = spaceStation.getCoords();
        }
        this.destination = [50,50];
        this.resetCargo()

        this.events = {
            idle: function (){},
            arrived: function(){},
            click: function(){},
            cargoAccepted: function (){},
            isMining: function(){}
        };

        this.init();
    }
    getPosition(){
        return this.#position;
    }
    getFuel(){
        return this.#fuel;
    }
    getCargo(){
        return this.#cargo;
    }
    setCargo(cargoType, cargoAmount, byEntity){
        if(Helper.proximity(this, byEntity)){
            this.#cargo.type = cargoType;
            this.#cargo.amount = cargoAmount;
        }
    }
    resetCargo(){
        this.#cargo = {
            type:null,
            amount:null
        }
    }
    setFuel(addAmount, byEntity){
        if(Helper.proximity(byEntity,this)){
            this.#fuel += addAmount;
        }
    }
    init(){
        this.shipElement = document.createElement('div');
        this.shipElement.className = 'position-absolute ship';
        this.shipElement.style.backgroundImage = "url('./assets/ufo-raw.png')"
        this.updatePosition();
    }
    registerListener(elem){
        this.shipElement.addEventListener('click',ev =>{
            const dispatch = new GameEvent('ship', this);
            elem.dispatchEvent(dispatch)
        })
    }
    setDestination(x,y){
        this.destination = [x,y];
    }
    extract(planet){
        this.audioFxBeam.start();
        this.events.isMining(this);

        return planet.mineMe(this).finally(()=>this.audioFxBeam.stop())
    }
    unload(entity){
        this.audioFxBeam.start();
        return entity.acceptCargo(this).finally(()=>this.audioFxBeam.stop());

    }
    fly(){
        this.audioFxFly.start();
        this.shipElement.style.backgroundImage = "url('./assets/ufo-raw.png')"
        this.shipElement.style.transform = 'scale(1) rotate(0)';
        if(this.#fuel <= 0){
            this.audioFxFly.stop();
            alert(this.name + ' is out of fuel!')
            return;
        }
        this.#fuel--;
        let futurePos = [this.#position[0], this.#position[1]];
        let isMoving = [true,true];
        for(let i = 0; i<2; i++){

            if(Math.abs(this.#position[i]-this.destination[i])>0){
                futurePos[i] > this.destination[i] ? futurePos[i]-- : futurePos[i]++
            } else {
                isMoving[i] = false;
            }
        }
        this.#position = futurePos;
        this.updatePosition()

        if(isMoving[0] || isMoving[1]){
            setTimeout(()=>this.fly(),300);
        } else {
            this.audioFxFly.stop();
            this.shipElement.style.backgroundImage = "url('./assets/ufo.png')"
            this.shipElement.style.transform = 'scale(1.5) rotate(-40deg)';
            this.events.idle(this);
            this.events.arrived(this);
        }
    }

    on(name, cb){
        this.events[name] = cb;
    }
    refuel(entity = null){
        this.audioFxRefuel.start();
        if(entity){
            return entity.refuelRequest(this).finally(()=>this.audioFxRefuel.stop());
        }
        return this.spaceStation.refuelRequest(this).finally(()=>this.audioFxRefuel.stop());
    }
    refuelRequest(ship){
        return new Promise((resolve, reject) => {
            const amount = this.#fuel / 2;
            setTimeout(()=>{
                ship.setFuel(amount, this)
                this.#fuel -= amount;
                if(amount<=0){
                    reject(amount)
                }
                resolve(amount)
            }, amount * 70)
        })
    }
    acceptCargo(ship){
        return new Promise(((resolve, reject) => {
            setTimeout(()=>{
                const mySpace = 500 - this.#cargo.amount;
                if(!Helper.proximity(ship,this) || ship.getCargo().amount < 1 || (this.#cargo.type && this.#cargo.type !== ship.getCargo().type)){
                    reject(false);
                }
                if(mySpace < ship.getCargo().amount){
                    this.#cargo.amount = 500;
                } else {
                    this.#cargo.amount += ship.getCargo().amount;
                }
                ship.resetCargo();
                this.events.cargoAccepted(this);
                resolve('cargoAccepted')
            }, ship.getCargo().amount * 5)

        }))
    }
    updatePosition(){
        this.shipElement.style.left = this.#position[0] + '%';
        this.shipElement.style.top = this.#position[1] + '%';
    }
    bind(){
        return this.shipElement;
    }

}