const logger = function (print){
    let text = print.toString();
    if(text === '[object Object]'){
        text = "{\n";
        Object.keys(print).forEach(key=> {
            text += key + ': ' + print[key].toString() + ",\n"
        })
        text += '}';
    }
    let ele = document.createElement('p');
    const time = ((new Date().getTime() - startTime.getTime())/1000).toFixed(2);
    ele.innerText = time + ': ' + text;
    const logEle = document.getElementById('logger');
    logEle.insertBefore(ele, logEle.childNodes[0])
    setTimeout(()=>{
        ele.parentNode.removeChild(ele);
    },45000);
}
window.onerror = function(message, url, linenumber) {
    logger("JavaScript error: " + message + " on line " +
        linenumber + " for " + url);
}
let userCode = localStorage.myCode || "global.music = false;\n" +
    "global.soundFx = true;\n" +
    "\n" +
    "const myShip = starShips[0];\n" +
    "\n" +
    "\n" +
    "myShip.on(\"isMining\", ()=> logger(\"Ship tries to mine planet\"))\n" +
    "myShip.on('arrived', ship => {\n" +
    "  logger(\"Arrived at station: refueling\")\n" +
    "  myShip.refuel();\n" +
    "  \n" +
    "})\n" +
    "\n" +
    "spaceStation.on(\"cargoAccepted\", ()=> logger(\"New resources at station!\"));\n" +
    "spaceStation.on(\"refueledShip\", ()=> {\n" +
    "  logger(\"A ship was refueled. Monitor the station's fuel tank!\")\n" +
    "  // mineO3()\n" +
    "});\n" +
    "\n" +
    "/*\n" +
    "*  This should get us home...\n" +
    "*/\n" +
    "\n" +
    "logger('Adventure started!')\n" +
    "myShip.setDestination(...spaceStation.getCoords());\n" +
    "myShip.fly();\n" +
    "\n" +
    "\n" +
    "/*\n" +
    "*  Try mining! Uncomment the function call in the \"refueledShip\" listener\n" +
    "*/\n" +
    "\n" +
    "\n" +
    "function mineO3(){\n" +
    "    planets[2].on(\"mined\", () => logger(\"Planet was mined successfully\"))\n" +
    "\tmyShip.setDestination(...planets[2].getCoords());\n" +
    "    myShip.fly();\n" +
    "    myShip.on(\"arrived\", () => {\n" +
    "        logger(\"Arrived at planet, let's start mining!\")\n" +
    "    \tmyShip.extract(planets[2])\n" +
    "    })\n" +
    "}";