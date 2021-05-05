import GameEvent from "./GameEvent.js";
import Helper from "./Helper.js";
import AudioFx from "./AudioFx.js";
import Random from "./Random.js";
export default class Ship{
    #fuel = 500;
    #cargo;
    #position;
    #capacity;
    #stopped;
    #burnRate;
    #moveStepper = 0;
    #beamStrength = 1;
    #spaceStation;
    constructor(spaceStation, first=false, mode = 'default') {
        this.#spaceStation = spaceStation;
        this.#stopped = false;
        this.#burnRate = 1;
        this.audioFxFly = new AudioFx('flying');
        this.audioFxBeam = new AudioFx('beam');
        this.audioFxRefuel = new AudioFx('refuel');
        const random = new Random()
        this.name = 'DSS-'+random.string(4);
        this.#capacity = 500;
        this.#fuel = 500;
        this.activity = 'idle';
        this.mode = mode;
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

        this.init(this.mode);
    }
    setBurnRate(to){
        if( isNaN(to) || to < 1){
            this.#burnRate = 1;
            return;
        } else if(to>10){
            this.#burnRate = 1;
            return;
        }
        this.#burnRate = to;
    }
    getBeamStrength(){
        return this.#beamStrength;
    }
    getCapacity(){
        return this.#capacity;
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
    addBeamStrength(){
        if(Helper.proximity(this, this.#spaceStation)){
            this.#spaceStation.equip(this, 'beamerModule')
                .then(res => this.#beamStrength += res)
                .catch(()=>{
                    this.#beamStrength = .5;
                })
        }
    }
    addCapacity(){
        if(Helper.proximity(this, this.#spaceStation)){
            this.#spaceStation.equip(this, 'cargoModule')
                .then(res => this.#capacity += res)
                .catch(()=>{
                    this.#capacity = 300;
                })
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
    init(mode = 'default'){
        this.mode = mode;
        if(!this.shipElement){
            this.shipElement = document.createElement('div');
        }
        switch(mode){
            case 'bar':
                this.shipElement.className = 'position-absolute bar';
                this.shipElement.style.top = 'calc(var(--barWidth) * ' + (this.#spaceStation.getStats().shipsBuilt/100) + ')';
                this.shipElement.style.left = 'calc(var(--barWidth) * ' + this.#spaceStation.getStats().shipsBuilt + ')';
                break;
            case 'dot':
                this.shipElement.className = 'position-absolute dot';
                break;
            default:
                this.shipElement.className = 'position-absolute ship';
                this.shipElement.style.backgroundImage = "url('./assets/ufo-raw.png')"
        }

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
        this.activity = 'extracting';
        this.audioFxBeam.start();
        this.events.isMining(this);

        return planet.mineMe(this).finally(()=>{
            this.activity = 'idle';
            this.audioFxBeam.stop()
        })
    }
    unload(entity){
        this.activity = 'unloading';
        this.audioFxBeam.start();
        return entity.acceptCargo(this).finally(()=>{
            this.activity = 'idle';
            this.audioFxBeam.stop()
        });

    }
    stop(){
        this.#stopped = true;
        this.#moveStepper = 0;
    }
    resume(){
        this.#stopped = false;
    }

    fly(){
        if(this.#stopped){
            return;
        }

        const moveAmount = this.#burnRate * 1.3 - Math.log(this.#burnRate);

        this.activity = 'flying';
        this.audioFxFly.start();
        this.animate('beam');

        if(this.#fuel <= this.#burnRate){
            this.audioFxFly.stop();
            this.activity = 'idle';
            alert(this.name + ' is out of fuel!');
            return;
        }
        this.#fuel-= this.#burnRate+this.#moveStepper;
        this.#moveStepper++;
        let futurePos = [this.#position[0], this.#position[1]];
        let isMoving = [true,true];
        for(let i = 0; i<2; i++){

            if(Math.abs(this.#position[i]-this.destination[i])>moveAmount){
                if(futurePos[i] > this.destination[i]){
                    futurePos[i] -= moveAmount;
                } else {
                    futurePos[i] += moveAmount;
                }
            } else {
                futurePos[i] = this.destination[i];
                isMoving[i] = false;
            }
        }
        this.#position = futurePos;
        this.updatePosition()

        if(isMoving[0] || isMoving[1]){
            setTimeout(()=>{
                this.#moveStepper = this.#moveStepper > 1 ? this.#moveStepper+1 : 0;
                this.fly()
            },300);
        } else {
            this.#moveStepper = 0;
            this.activity = 'idle';
            this.audioFxFly.stop();
            this.animate('idle')

            this.events.idle(this);
            this.events.arrived(this);
        }
    }

    on(name, cb){
        this.events[name] = cb;
    }
    refuel(entity = null){
        this.activity = 'refueling';
        this.audioFxRefuel.start();
        if(entity){
            return entity.refuelRequest(this).finally(()=>{
                this.audioFxRefuel.stop();
                this.activity = 'idle';
            });
        }
        return this.#spaceStation.refuelRequest(this).finally(()=>{
            this.activity = 'idle';
            this.audioFxRefuel.stop()
        });
    }
    animate(change){
        if(this.mode === 'default'){
            switch (change){
                case 'idle':
                    this.shipElement.style.backgroundImage = "url('./assets/ufo.png')"
                    this.shipElement.style.transform = 'scale(1.5) rotate(-40deg)';
                    break;
                case 'beam':
                    this.shipElement.style.backgroundImage = "url('./assets/ufo-raw.png')"
                    this.shipElement.style.transform = 'scale(1) rotate(0)';
                    break;
            }
        }
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
        this.activity = 'acceptCargo';
        return new Promise(((resolve, reject) => {
            setTimeout(()=>{
                this.activity = 'idle';
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
        if(this.mode === 'default' || this.mode === 'dot'){
            this.shipElement.style.left = this.#position[0] + '%';
            this.shipElement.style.top = this.#position[1] + '%';
        }
    }
    bind(){
        return this.shipElement;
    }

}