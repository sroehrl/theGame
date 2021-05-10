<?php
$highScore = json_decode(file_get_contents('highscore.json'),true);
$json = file_get_contents('php://input');
$data = json_decode($json, true);
if(isset($data['name'])){
    $highScore[] = $data;
    usort($highScore, "byScore");
    $highScore = array_slice($highScore,0,10);
    file_put_contents('highscore.json', json_encode($highScore));
}
function byScore($a, $b){
    return $a['score'] < $b['score'];
}

header('application/json');
echo json_encode($highScore);
