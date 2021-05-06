const instructions = {
    spaceStation: {
        description: 'At the center of your operation is your space station. Located between three planets of interest, this is where\n' +
            '        things come together.',
        methods: [
            {
                name: 'cool()',
                timing: 'asynchronous',
                description: 'cools the shields down by 1% (requires needed amount in milliseconds)'
            },
            {
                name: 'getFuelTank()',
                timing: 'synchronous',
                description: 'Returns the amount of fuel stored. As the station has external tanks, the capacity is virtually unlimited.'
            },
            {
                name: 'getCoords()',
                timing: 'synchronous',
                description: 'Returns the coordinates as an array of two values.'
            },
            {
                name: 'getResources()',
                timing: 'synchronous',
                description: 'Returns an object showing current resource levels (e.g. {water:50, o3:100, iron:111})'
            },
            {
                name: 'getModules()',
                timing: 'synchronous',
                description: 'Returns the station\'s stored modules'
            },
            {
                name: 'getModuleRequirements()',
                timing: 'synchronous',
                description: 'Returns the requirements to build modules. Depends on the system!'
            },
            {
                name: 'buildShip()',
                timing: 'asynchronous / 30 seconds',
                description: 'Builds a ship and places it in its hangar. This requires:\n' +
                    'fuel: 500\n' +
                    'o3: 500\n' +
                    'water: 1000\n' +
                    'iron: 5000\n' +
                    'If any of the prerequisites aren\'t met, the built fails.'
            },
            {
                name: 'buildModule(\'cargoModule\'|\'beamerModule\')',
                timing: 'asynchronous / 25 seconds',
                description: 'Builds a module and places it in its hangar. The requirements can be get through "getModuleRequirements()":\n' +
                    'If any of the prerequisites aren\'t met, the built fails.'
            },
            {
                name: 'refineFuel()',
                timing: 'asynchronous / depending on amount of o3',
                description: 'It requires 2.2 o3 to refine one unit of fuel. Needless to say, this will likely be your biggest challenge.'
            },
            {
                name: 'getStats()',
                timing: 'synchronous',
                description: 'Retrieve your achievements!'
            },
            {
                name: 'getShield()',
                timing: 'synchronous',
                description: 'This is important to start cooling when necessary.'
            },
            {
                name: 'getCoolingCost()',
                timing: 'synchronous',
                description: 'Cooling becomes more and more expensive. In order to fight the sun, you need a good strategy.'
            }
        ],
        events:[
            {
                name: 'cargoAccepted',
                returns: 'instance',
                description: 'Fired when a ship unloaded cargo successfully.'
            },{
                name: 'refueledShip',
                returns: 'instance',
                description: 'Fired when a ship was refueled successfully.'
            },
            {
                name: 'builtShip',
                returns: 'new starShip instance',
                description: 'Fired when a ship was successfully built. Caution: The new ship is already placed in the global starShips-array. Don\'t add it again!'
            },
            {
                name: 'builtModule',
                returns: 'stored Modules',
                description: 'Fired when a module was successfully built. In order to equip a ship, you must invoke the ship\'s methods accordingly'
            },
            {
                name: 'refinedFuel',
                returns: 'instance',
                description: 'Fired when o3 was converted to fuel.'
            }
        ]
    },
    starShip: {
        description: 'A starShip requires fuel to do its duty! Make sure to supply it with enough before sending into into space.',
        methods: [
            {
                name: 'getPosition()',
                timing: 'synchronous',
                description: 'returns current coordinates as an array with two values'
            },{
                name: 'getBeamStrength()',
                timing: 'synchronous',
                description: 'returns strength of beam'
            },
            {
                name: 'getFuel()',
                timing: 'synchronous',
                description: 'returns current fuel-level of ship'
            },
            {
                name: 'getCoolingCost()',
                timing: 'synchronous',
                description: 'returns units of water currently needed to cool the station\'s shields by 1%'
            },
            {
                name: 'getCargo()',
                timing: 'synchronous',
                description: 'returns an object (e.g. {type: \'water\', amount: 300}) indicating current cargo'
            },
            {
                name: 'setBurnRate(num)',
                timing: 'synchronous',
                description: 'Default/Minimum:1, Max: 10. Sets a ship\'s fuel burn rate. You are in space, so efficiency penalties aren\'t that high.'
            },
            {
                name: 'setDestination(x,y)',
                timing: 'synchronous',
                description: 'sets autopilot to coordinates (does not start flight!)'
            },
            {
                name: 'addBeamStrength()',
                timing: 'asynchronous / void',
                description: 'equips the ship with a beamerModule to enhance efficiency. Ship needs to be in hangar. When this operations fails, your beamer might break!'
            },
            {
                name: 'addCapacity()',
                timing: 'asynchronous / void',
                description: 'equips the ship with a cargoModule to enhance efficiency. Ship needs to be in hangar. When this operations fails, your cargo capacity is reset!'
            },
            {
                name: 'extract(Planet)',
                timing: 'asynchronous (depending on pressure)',
                description: 'expects an instance of a planet and mines its resource'
            },
            {
                name: 'unload(SpaceStation|Ship)',
                timing: 'asynchronous (depending on various factors)',
                description: 'You can unload at the station, other ships or planets. Cargo dumped at a planet will be lost and other ships might have limited capacity! Example: starShips[0].unload(spaceStation)'
            },
            {
                name: 'fly()',
                timing: 'asynchronous / void (time depending on distance)',
                description: 'Executes the autopilot and flies to defined destination.'
            },
            {
                name: 'refuel(SpaceStation(default)|Ship)',
                timing: 'asynchronous (depending on amount refueling)',
                description: 'Requires an entity able of refueling (e.g. starShips[0].refuel(spaceStation))'
            }
        ],
        events: [
            {
                name: 'idle',
                returns: 'instance',
                description: 'Fired when ship is not moving (anymore)'
            },
            {
                name: 'arrived',
                returns: 'instance',
                description: 'Fired when destination is reached'
            },
            {
                name: 'cargoAccepted',
                returns: 'instance',
                description: 'Fired when cargo was successfully received (by another ship, not through mining)'
            },
            {
                name: 'isMining',
                returns: 'instance',
                description: 'Fired when ship started extracting'
            }
        ]
    },
    planet:{
        description: 'There are three planets in your area. They contain water, iron and o3. Mining them will keep you afloat.',
        methods:[
            {
                name: 'getCoords()',
                timing: 'synchronous',
                description: 'Returns the coordinates as an array of two values.'
            },
            {
                name: 'getType()',
                timing: 'synchronous',
                description: 'Returns resource available.'
            },
            {
                name: 'getPressure()',
                timing: 'synchronous',
                description: 'Returns pressure of planet (influences mining speed).'
            }
        ],
        events:[
            {
                name: 'cargoAccepted',
                returns: 'instance',
                description: 'Fired when a ship dumped cargo. Other than the ship loosing its cargo, this has no effect on the planet and is probably done in an emergency.'
            },
            {
                name: 'mined',
                returns: 'instance of mining entity (ship)!',
                description: 'Fired when a beam successfully extracted resources until the cargo bay was full.'
            }
        ]
    }
}