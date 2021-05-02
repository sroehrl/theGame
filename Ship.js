import GameEvent from "./GameEvent.js";
export default class Ship{
    constructor(spaceStation, first=false) {
        this.spaceStation = spaceStation;
        this.fuel = 500;
        this.position = first ? [10,10] : spaceStation.coords;
        this.destination = [50,50];
        this.cargo = {
            type:null,
            amount:null
        }
        this.events = {
            idle: function (){},
            arrived: function(){},
            click: function(){},
        };

        this.init();
    }
    init(){
        this.shipElement = document.createElement('div');
        this.shipElement.className = 'position-absolute ship';
        this.shipElement.style.backgroundImage = "url('./assets/ufo-raw.png')"
        console.log(this.shipElement.style)
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
        return planet.mineMe(this)
    }
    unload(entity){
        return entity.acceptCargo(this);
    }
    fly(){
        this.shipElement.style.backgroundImage = "url('./assets/ufo-raw.png')"
        this.shipElement.style.transform = 'scale(1) rotate(0)';
        if(this.fuel <= 0){
            alert('out of fuel')
            return;
        }
        this.fuel--;
        let futurePos = [this.position[0], this.position[1]];
        let isMoving = [true,true];
        for(let i = 0; i<2; i++){

            if(Math.abs(this.position[i]-this.destination[i])>0){
                futurePos[i] > this.destination[i] ? futurePos[i]-- : futurePos[i]++
            } else {
                isMoving[i] = false;
            }
        }
        this.position = futurePos;
        this.updatePosition()

        if(isMoving[0] || isMoving[1]){
            setTimeout(()=>this.fly(),300);
        } else {
            this.shipElement.style.backgroundImage = "url('./assets/ufo.png')"
            this.shipElement.style.transform = 'scale(1.5) rotate(-40deg)';
            this.events.idle(this);
            this.events.arrived(this);
        }
    }

    on(name, cb){
        this.events[name] = cb;
    }
    refuel(){
        return this.spaceStation.refuelMe(this);
    }
    updatePosition(){
        this.shipElement.style.left = this.position[0] + '%';
        this.shipElement.style.top = this.position[1] + '%';
    }
    bind(){
        return this.shipElement;
    }

}