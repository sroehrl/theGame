import Ship from "./Ship.js";
import Helper from "./Helper.js";
import SpaceStation from "./SpaceStation.js";



const station = new SpaceStation();
const ship = new Ship(station, false);
console.log(Helper.proximity(station,ship))