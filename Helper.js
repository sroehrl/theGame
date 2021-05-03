export default {
    proximity(entity1, entity2){
        const positions = [];
        [entity1, entity2].forEach(entity =>{
            let coords;
            if(typeof entity.getCoords === 'function'){
                coords = entity.getCoords();
            } else {
                coords = entity.getPosition();
            }
            positions.push(coords);
        })
        return (positions[0][0] === positions[1][0] && positions[0][1] === positions[1][1])
    }
}