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
    },
    distance(coords1, coords2){
        // pythagoras
      return Math.ceil(Math.sqrt(Math.pow(Math.abs(coords1[0] - coords2[0]),2) + Math.pow(Math.abs(coords1[1] - coords2[1]),2)));
    },
    achievableDestination(position, destination, percent){
        const difference = [
            Math.abs(position[0] - destination[0]),
            Math.abs(position[1] - destination[1]),
        ]
        const moveBy = [
            difference[0] * percent,
            difference[1] * percent,
        ]

        return [
            destination[0] > position[0] ? (position[0] + moveBy[0]) : (position[0] - moveBy[0]),
            destination[1] > position[1] ? (position[1] + moveBy[1]) : (position[1] - moveBy[1])
        ];
    }
}