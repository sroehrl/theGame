import Planet from "./Entities/Planet.js";
import Random from "./Helpers/Random.js";
import Ship from "./Entities/Ship.js";
import SpaceStation from "./Entities/SpaceStation.js";
import Sun from "./Entities/Sun.js";
import PhaserGame from './GameClasses/Phaser.js';
import ControlHud from "./GameClasses/ControlHud.js";

const phaserGame = new PhaserGame(document.getElementById('phaser'))


class Game {
    #tick=0;
    constructor(containerElement, controlElement) {

        let gameRunning = true;
        this.stations = [];
        this.phaserGame = phaserGame;
        this.canvas = containerElement;
        this.control = controlElement;
        this.random = new Random();
        this.system = this.random.rnd(30, 1000) + '-Zn3';
        this.planets = [];
        this.ships = [];

        this.hudInterval = setInterval(() => {}, 100000)
        this.canvas.addEventListener('canvas-loaded',()=>{
            console.log('loaded')
            this.init();
        })

        setInterval(()=>{
            const lastRun = localStorage.lastRun ? JSON.parse(localStorage.lastRun) : [];
            this.spaceStation.receiveRadiation(this.sun.getIntensity());
            const total = this.spaceStation.getLevel();
            lastRun.push({
                minute: this.#tick,
                resourceLevel: total,
                ships: this.ships.length,
                total: this.spaceStation.getStats(),
                sun: this.sun.getIntensity(),
                shield: this.spaceStation.getShield() < 0 ? 0 : this.spaceStation.getShield()
            })
            localStorage.lastRun = JSON.stringify(lastRun)
            this.#tick++;
            if(total > 1000000){
                this.sun.addIntensity(.7)
            } else if(total > 500000){
                this.sun.addIntensity(.1)
            } else if(total > 150000){
                this.sun.addIntensity(.02)
            }
            if(this.spaceStation.getShield()<0.1 && gameRunning){
                gameRunning = false;
                window.location.href = 'game-over.html'
            }
            let fuelLeft = 0;
            this.ships.forEach(ship =>{
                fuelLeft += ship.getFuel()
            })
            if(fuelLeft<1){
                gameRunning = false;
                window.location.href = 'game-over.html'
            }
        },60000);
    }

    init() {
        if (this.planets.length > 0) {
            return;
        }
        this.sun = new Sun(phaserGame,[10,17], this.spaceStation);
        this.sun.registerListener(this.control);

        ['water', 'iron', 'o3'].forEach(type => {
            const planet = new Planet(phaserGame, this.random.planetPosition(), type);
            planet.registerListener(this.control)
            this.planets.push(planet)
        });
        this.spaceStation = new SpaceStation(phaserGame);
        this.stations.push(this.spaceStation);

        this.registerShip(new Ship(phaserGame, this.spaceStation, true))
        delete localStorage.lastRun;


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
        this.ships.push(ship);
    }

    controlDetails(template, detail) {
        clearInterval(this.hudInterval)
        let intervalLength = 5000;
        const display = () => {
            ControlHud(this.control, detail, template)
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
        // this.canvas.appendChild(this.spaceStation.bind())
    }
}

const container = document.getElementById('phaser')
const controlElement = document.getElementById('control')
// container.innerHTML = '';
const game = new Game(container, controlElement);
// export const starShips = [new Ship(spaceStation)]
// game.registerShip(new Ship(game.spaceStation, true))
/*setInterval(()=>{
    game.registerShip(new Ship(spaceStation, false, 'bar'))
},1000)*/


export const starShips = game.ships;
export const planets = game.planets;
export const stations = game.stations;