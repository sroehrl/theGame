import Planet from "./Planet.js";
import Random from "./Random.js";
import Ship from "./Ship.js";
import SpaceStation from "./SpaceStation.js";
import Sun from "./Sun.js";


export const spaceStation = new SpaceStation();

class Game {
    #tick=0;
    constructor(containerElement, controlElement) {
        let gameRunning = true;
        this.canvas = containerElement;
        this.control = controlElement;
        this.random = new Random();
        this.system = this.random.rnd(30, 1000) + '-Zn3';
        this.planets = [];
        this.ships = [];
        this.spaceStation = spaceStation;
        this.hudInterval = setInterval(() => {}, 100000)
        this.init();
        setInterval(()=>{
            const lastRun = localStorage.lastRun ? JSON.parse(localStorage.lastRun) : [];
            spaceStation.receiveRadiation(this.sun.getIntensity());
            spaceStation.stationElement.classList.add('healthy');
            const total = spaceStation.getLevel();
            lastRun.push({
                minute: this.#tick,
                resourceLevel: total,
                ships: this.ships.length,
                shield: spaceStation.getShield() < 0 ? 0 : spaceStation.getShield()
            })
            localStorage.lastRun = JSON.stringify(lastRun)
            this.#tick++;
            if(total > 1000000){
                this.sun.addIntensity(.7)
            } else if(total > 500000){
                this.sun.addIntensity(.1)
            } else if(total > 150000){
                this.sun.addIntensity(.01)
            }
            if(spaceStation.getShield() < 50){
                spaceStation.stationElement.classList.remove('healthy');
            }
            if(spaceStation.getShield()<0.1 && gameRunning){
                gameRunning = false;
                window.location.href = 'game-over.html'
            }
        },60000);
    }

    init() {
        delete localStorage.lastRun;
        if (this.planets.length > 0) {
            return;
        }
        ['water', 'iron', 'o3'].forEach(type => {
            const planet = new Planet(this.random.planetPosition(), type);
            planet.registerListener(this.control)
            this.planets.push(planet)
        });
        this.sun = new Sun([2,2], this.spaceStation);
        this.sun.registerListener(this.control);

        this.spaceStation.registerListener(this.control);

        ['sun', 'planet', 'station'].forEach(what => {
            this.control.addEventListener(what, ev => {
                this.controlDetails(what, ev.detail)
            })
        })
        this.control.addEventListener('newShip', ev => this.registerShip(ev.detail))

    }

    registerShip(ship) {
        ship.registerListener(this.control);
        this.control.addEventListener('ship', ev => {
            this.controlDetails('ship', ev.detail)
        })
        // ship.on('click', ship => this.controlDetails('ship', ship))
        this.ships.push(ship);
        this.render()
    }

    controlDetails(template, detail) {
        clearInterval(this.hudInterval)
        let intervalLength = 60000;
        const display = () => {
            switch (template) {
                case 'sun':
                    this.control.innerHTML = `
                        <h1>Dying star</h1>
                        <p>This sun is unstable. The last sun-flare destroyed your uncle's business.</p>
                        <p>You have a shield against that, but depending on the sun's intensity, it will deplete faster and faster!</p>
                        <h3>Intensity: ${detail.getIntensity().toFixed(2)}</h3>  
                        <p>Your station will have a shield indicator once a certain threshold is met. Cooling the shiled down will require water (and the right method!).</p>
                    `;
                    break;
                case 'ship':
                    intervalLength = 1000;
                    this.control.innerHTML = `
                    <h3>Ship ${detail.name}</h3>
                    <p>Fuel: ${detail.getFuel()}</p>
                    <p>Position: ${this.system}-${detail.getPosition()[0].toFixed(2)} | ${this.system}-${detail.getPosition()[1].toFixed(2)}</p>
                    <p>Miming efficiency: <strong>${detail.getBeamStrength()}</strong></p>
                    <h4>Cargo</h4>
                    <div class="m-1 p-3 b-2 b-primary b-rounded-2">
                        <p>Capacity: ${detail.getCapacity().toFixed(2)}</p>
                        
                    ${detail.getCargo().type ? (
                        `<p>${detail.getCargo().type}:${detail.getCargo().amount}</p>`
                    ) : (
                        `<p>none</p>`
                    )}
                    </div>
                    <h4>Activity: ${detail.activity}</h4>
                    `;
                    break;
                case 'planet':
                    const planet = detail.element.cloneNode(true);
                    planet.classList.remove('position-absolute')
                    planet.classList.add('position-relative')
                   /* planet.style.marginTop = '20%';
                    planet.style.marginLeft = 'calc(50% - 150px)';*/
                    planet.style.transform = 'scale(1.5) rotateZ(-20deg)';
                    planet.style.left = '0';
                    planet.style.rigth = '0';
                    planet.style.margin = '50px auto 0';
                    this.control.innerHTML = `
                    <h3>Planet</h3>
                    <p>Type: ${detail.getType()}</p>
                    <p>Coordinates: ${this.system}-${detail.getCoords()[0]} | ${this.system}-${detail.getCoords()[1]}</p>
                    <p>Pressure: ${numeral(detail.getPressure()).format('00a')}</p>
                    `;
                    this.control.appendChild(planet)
                    break;
                case 'station':
                    intervalLength = 1000;
                    const totalResources = detail.getStats().o3Mined + detail.getStats().waterMined + detail.getStats().ironMined;
                    this.control.innerHTML = `
                    <h3>Space Station</h3>
                    ${detail.getShield() < 100 ? (
                        `<div class="p-2 b-rounded b-white b-1">
                            <p>Shield: ${detail.getShield().toFixed(1)}%</p>
                            <progress value="${detail.getShield()}" max="100"></progress>
                            <p>Water to cool 1%: ${numeral(detail.getCoolingCost()).format('000.0a')}</p>
                        </div>`
                    ) : ''}
                    
                    
                    <p class="font-strong">FuelTank: ${numeral(detail.getFuelTank()).format('00.00a')}</p>
                    <p>Coordinates: ${this.system}-${detail.getCoords()[0]} | ${this.system}-${detail.getCoords()[1]}</p>
                    <div class="m-1 p-3 b-2 b-primary b-rounded-2">
                        <div class="grid-6-6">
                            <p>Water</p>
                            <p>${numeral(detail.getResources().water).format('000.0a')}</p>
                            <p>Iron</p>
                            <p>${numeral(detail.getResources().iron).format('000.0a')}</p>
                            <p>O3</p>
                            <p>${numeral(detail.getResources().o3).format('000.0a')}</p>
                        </div>
                        <p>Beamer Modules:${detail.getModules().beamerModule}</p>
                        <p>Cargo Modules:${detail.getModules().cargoModule}</p>
                    </div>
                    <p>Resources mined: ${numeral(totalResources).format('000.0a')}</p>
                    <p>Ships built: ${detail.getStats().shipsBuilt}</p>
                    <h4>Level: <br> ${numeral(detail.getLevel()).format('000.00a')} resources/min</h4>
                    `;
                    break;
                default:
                    this.control.innerHTML = '';
            }
        }
        this.hudInterval = setInterval(() => {
            display();
        }, intervalLength)
        display()

    }

    render() {
        this.planets.forEach(planet => {
            this.canvas.appendChild(planet.bind())
        })
        this.canvas.appendChild(this.sun.bind())
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
/*setInterval(()=>{
    game.registerShip(new Ship(spaceStation, false, 'bar'))
},1000)*/


export const starShips = game.ships;
export const planets = game.planets;