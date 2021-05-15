import GameEvent from "../Helpers/GameEvent.js";
import ShieldBar from "./ShieldBar.js";

export default class PhaserGame{
    constructor(ele) {
        this.game = new Phaser.Game(config(ele))
        this.game.events.on('loadcomplete',()=>{
            this.game.canvas.dispatchEvent(new GameEvent('canvas-loaded',null))

        })

    }
    createSun(x,y){
        const sun = this.game.scene.scenes[0].add.sprite(...positionConverter(x,y),'sun').setInteractive({cursor:'pointer'}).setScale(.5)
        sun.play('sun')
        return sun;
    }

    createStation(x,y){
        const station = this.game.scene.scenes[0].add.image(...positionConverter(x, y, -11, 36), 'station').setInteractive({cursor:'pointer'}).setScale(.25)
        station.shield = new ShieldBar(this.game.scene.scenes[0], ...positionConverter(x, y, -51,85));
        return station
    }
    createPlanet(x,y,type){
        const name = 'planet-'+type;
        const planet =  this.game.scene.scenes[0].add.sprite(...positionConverter(x, y, 30), name).setInteractive({cursor:'pointer'}).setScale(.3)
        planet.play(name);
        return planet;
    }
    createShip(x,y){
        return  this.game.scene.scenes[0].add.sprite(...positionConverter(x, y), 'ufoAnimated').setSize(100,40).setInteractive({cursor:'pointer'}).setScale(.4);
    }
    move(entity, coords, duration, cb){
        const position = positionConverter(...coords)
        const move = this.game.scene.scenes[0].tweens.add({
            targets: entity,
            x: position[0],
            y: position[1],
            duration: duration,
            ease: 'Linear'
        });
        move.once('complete', cb)
    }
}



function positionConverter(x,y, offset = 0, offsetY = null){
    return [
        920*x/100+offset,
        600*y/100+(offsetY !== null ? offsetY : offset)
    ];
}

function loadAssets (){
    this.load.image('sky', './assets/pexels-kai-pilger-1341279.jpg');
    this.load.image('station', './assets/space-station.png');
    this.load.spritesheet('sun', './assets/sun.png', {frameWidth: 426, frameHeight: 426});
    this.load.spritesheet('ufoAnimated', './assets/ufo-sprite.png', {frameWidth: 150, frameHeight: 100})
    this.load.spritesheet('planet-iron', './assets/planet-iron.png', {frameWidth: 500, frameHeight: 500});
    this.load.spritesheet('planet-o3', './assets/planet-o3.png', {frameWidth: 500, frameHeight: 500});
    this.load.spritesheet('planet-water', './assets/planet-water.png', {frameWidth: 500, frameHeight: 500});
}

function create(){
    // background
    // this.add.image(0, 0, 'sky').setSize(920, 600).setScale(.4);
    // ufo
    this.anims.create({
        key: 'beam',
        frames: this.anims.generateFrameNumbers('ufoAnimated'),
        frameRate: 12,
    });
    // planets
    ['water','iron','o3'].forEach(type=>{
        this.anims.create({
            key: 'planet-'+type,
            frames: this.anims.generateFrameNumbers('planet-'+type),
            frameRate: Math.floor(Math.random() * 29) + 18,
            repeat: -1
        })
    })
    // sun
    this.anims.create({
        key: 'sun',
        frames: this.anims.generateFrameNumbers('sun'),
        frameRate: 8,
        repeat: -1
    })
    this.game.domContainer.parentElement.dispatchEvent(new GameEvent('canvas-loaded',null))

}
function loaded(ele){
   ele.dispatchEvent(new GameEvent('canvas-loaded',null))
}

const config = (ele)=> ({
    type: Phaser.AUTO,
    transparent: true,
    parent: ele,
    width: 920,
    height: 600,
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    pixelArt: true,
    physics: {
        default: 'arcade',
        arcade: {
            // gravity: { y: 200 }
        }
    },
    dom: {
        createContainer: true,
    },
    scene: {
        preload: loadAssets,
        create: create,
    }
})


