import Planet from "./Planet.js";
import Random from "./Random.js";
import Ship from "./Ship.js";
import SpaceStation from "./SpaceStation.js";


export const spaceStation = new SpaceStation();
class Game{
    constructor(containerElement, controlElement) {
        this.canvas = containerElement;
        this.control = controlElement;
        this.random = new Random();
        this.system = this.random.rnd(30,1000) + '-Zn3';
        this.planets = [];
        this.ships = [];
        this.spaceStation = spaceStation;
        this.init();
    }
    init(){
        if(this.planets.length > 0){
            return;
        }
        ['water','iron','o3'].forEach(type => {
            const planet = new Planet(this.random.planetPosition(),type);
            planet.registerListener(this.control)
            this.planets.push(planet)
        });
        this.spaceStation.registerListener(this.control);

        this.control.addEventListener('station', ev=>{
            this.controlDetails('station', ev.detail)
        })
        this.control.addEventListener('planet', ev=>{
            this.controlDetails('planet', ev.detail)
        })
        this.control.addEventListener('newShip', ev => this.registerShip(ev.detail))

    }
    registerShip(ship){
        ship.registerListener(this.control);
        this.control.addEventListener('ship', ev=>{
            this.controlDetails('ship', ev.detail)
        })
        // ship.on('click', ship => this.controlDetails('ship', ship))
        this.ships.push(ship);
        this.render()
    }

    controlDetails(template, detail){
        switch (template){
            case 'ship':
                this.control.innerHTML = `
                    <h3>Ship</h3>
                    <p>Fuel: ${detail.getFuel()}</p>
                    <p>Position: ${this.system}-${detail.getPosition()[0]} | ${this.system}-${detail.getPosition()[1]}</p>
                    <h4>Cargo</h4>
                    <div class="m-1 p-3 b-2 b-primary b-rounded-2">
                        <p>${detail.getCargo().type}:${detail.getCargo().amount}</p>
                    </div>`;
                break;
            case 'planet':
                this.control.innerHTML = `
                    <h3>Planet</h3>
                    <p>Type: ${detail.type}</p>
                    <p>Coordinates: ${this.system}-${detail.getCoords()[0]} | ${this.system}-${detail.getCoords()[1]}</p>
                    <p>Pressure: ${detail.pressure}</p>
                    `;
                break;
            case 'station':
                this.control.innerHTML = `
                    <h3>Space Station</h3>
                    <p>FuelTank: ${detail.getFuelTank()}</p>
                    <p>Coordinates: ${this.system}-${detail.getCoords()[0]} | ${this.system}-${detail.getCoords()[1]}</p>
                    <div class="m-1 p-3 b-2 b-primary b-rounded-2">
                        <p>Water:${detail.getResources().water}</p>
                        <p>Iron:${detail.getResources().iron}</p>
                        <p>O3:${detail.getResources().o3}</p>
                    </div>
                    `;
                break;
            default: this.control.innerHTML = '';
        }

    }
    render(){
        this.planets.forEach(planet => {
            this.canvas.appendChild(planet.bind())
        })
        this.ships.forEach(ship => {
            this.canvas.appendChild(ship.bind())
        })
        this.canvas.appendChild(this.spaceStation.bind())
    }
}

const container = document.getElementById('game')
const controlElement = document.getElementById('control')
container.innerHTML = '';
const game = new Game(container, controlElement);
// export const starShips = [new Ship(spaceStation)]
game.registerShip(new Ship(spaceStation, true))

export const starShips = game.ships;
export const planets = game.planets;