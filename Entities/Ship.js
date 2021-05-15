import GameEvent from "../Helpers/GameEvent.js";
import Helper from "../Helpers/Helper.js";
import AudioFx from "../Helpers/AudioFx.js";
import Random from "../Helpers/Random.js";
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
    #phaserGame;
    constructor(phaserGame, spaceStation, first=false, mode = 'default') {
        this.#phaserGame = phaserGame;
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
        this.init(phaserGame);
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
    init(phaserGame){
        this.shipElement = phaserGame.createShip(...this.#spaceStation.getCoords())
        this.updatePosition();
    }
    registerListener(elem){
        this.shipElement.on('pointerdown',ev =>{
            const dispatch = new GameEvent('ship', this);
            elem.dispatchEvent(dispatch)
        })
    }
    setDestination(x,y){
        this.destination = [x,y];
    }
    extract(planet){
        this.activity = 'extracting';
        this.audioFxBeam.play();
        this.events.isMining(this);
        this.shipElement.play('beam')
        return planet.mineMe(this).finally(()=>{
            this.activity = 'idle';
            this.audioFxBeam.player.stop()
            this.shipElement.playReverse('beam')
        })
    }
    unload(entity){
        this.activity = 'unloading';
        this.audioFxBeam.play();
        return entity.acceptCargo(this).finally(()=>{
            this.activity = 'idle';
            this.audioFxBeam.player.stop()
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
        this.audioFxFly.play(0.3);

        let distance = Helper.distance(this.#position, this.destination)
        const fuelRequirement = distance * (Math.log(this.#burnRate)+1);
        if(fuelRequirement > this.#fuel){
            // movable distance
            console.log({
                distance:distance,
                fuel:this.#fuel,
                fuelRequirement,
                burnRate:this.#burnRate,
                destination:this.destination
            })
            this.setDestination(...Helper.achievableDestination(this.#position, this.destination,this.#fuel/fuelRequirement))

            this.#fuel = 0;
            distance = Helper.distance(this.#position, this.destination)
        } else {
            this.#fuel -= fuelRequirement;

        }


        this.#phaserGame.move(this.shipElement,this.destination,distance*100/moveAmount,res=>{
            this.#position = this.destination;
            this.events.arrived(this);
            this.events.idle(this);
        });

    }

    on(name, cb){
        this.events[name] = cb;
    }
    refuel(entity = null){
        this.activity = 'refueling';
        this.audioFxRefuel.play(4);
        if(entity){
            return entity.refuelRequest(this).finally(()=>{
                this.activity = 'idle';
            });
        }
        return this.#spaceStation.refuelRequest(this).finally(()=>{
            this.activity = 'idle';
        });
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
                const mySpace = this.#capacity - this.#cargo.amount;
                if(!Helper.proximity(ship,this) || ship.getCargo().amount < 1 || (this.#cargo.type !== null && this.#cargo.type !== ship.getCargo().type)){
                    reject(false);
                }
                this.#cargo.type = ship.getCargo().type;
                if(mySpace < ship.getCargo().amount){
                    this.#cargo.amount = this.#capacity;
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
        this.#phaserGame.move(this.shipElement,this.#position,300,res=>{
            // console.log(this.#position)
        });
    }
}