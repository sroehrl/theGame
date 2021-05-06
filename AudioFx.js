import SoundPlayer from "./Sound.js";

export default class AudioFx{
    constructor(name) {
        this.name = name;
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        const audio = new AudioContext();
        this.player = new SoundPlayer(audio)
        this.trueAudio = false;
        switch(name){

            case 'flying':
                this.sequence = [440.0, 0.1, "sine"];
                break;
            case 'beam':
                this.sequence = [261.626, 0.1, "sine"];
                break;
            case 'refuel':
                this.sequence = [200.0, 0.1, "sine"];
                break;
            default:
                this.trueAudio = true;
                this.fileName = './assets/AnalogueCabin - Noir Et Blanc Vie.mp3';
                this.audioContainer = document.getElementById('audios');
                this.audioElement = document.createElement('audio');
                this.audioElement.volume = .5;
                this.audioElement.loop = true;
                this.audioElement.preload;
                this.audioElement.src = this.fileName;
                this.audioContainer.appendChild(this.audioElement);
                this.isPlaying = false;
                break;
        }

    }
    playMusic(){
        if(!this.isPlaying && global.music){
            this.audioElement.play();
            this.isPlaying = true;
        }
    }
    play(duration=null){
        if(duration){
            this.player.play(...this.sequence).stop(duration)
        } else {
            this.player.play(...this.sequence)
        }
    }

    start() {
        if(!this.isPlaying && global.soundFx){
            this.audioElement.play();
            this.isPlaying = true;
        }

    }
    stop(){
        this.audioElement.volume = 0;
        setTimeout(()=>{
            this.audioElement.pause();
            this.audioElement.currentTime = 0;
            this.isPlaying = false;
            this.audioElement.volume = .5;
        },100)


    }

}