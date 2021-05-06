export default class Random{
    constructor() {
        this.planetPositions = [];
    }
    planetPosition(){
        const pos = [this.rnd(2,80),this.rnd(2,80)];
        let positionOk = true;
        this.planetPositions.forEach(coords =>{
            if(Math.abs(pos[0]-coords[0]) < 11 || Math.abs(pos[1]-coords[1]) < 11){
                console.log()
                positionOk = false;
            }
        })
        if(positionOk){
            this.planetPositions.push(pos);
            return pos;
        }
        return this.planetPosition();
    }
    rnd(min,max){
        return Math.floor(Math.random() * max) + min
    }
    string(length =6){
        return Math.random().toString(16).substr(2, length);
    }

}