export default class AudioFx{
    constructor(name) {
        this.name = name;
        switch(name){
            case 'flying':
                this.fileName = './assets/158866__stoltingmediagroup__futuresoundfx-740.mp3';
                break;
            case 'beam':
                this.fileName = './assets/169991__peepholecircus__laser-beam.mp3';
                break;
            case 'refuel':
                this.fileName = './assets/214049__taira-komori__strange-beam.mp3';
                break;
            default:
                this.fileName = './assets/AnalogueCabin - Noir Et Blanc Vie.mp3';
        }
        this.audioContainer = document.getElementById('audios');
        this.audioElement = document.createElement('audio');
        this.audioElement.volume = .5;
        this.audioElement.loop = true;
        this.audioElement.preload;
        this.audioElement.src = this.fileName;
        this.audioContainer.appendChild(this.audioElement);
        this.isPlaying = false;
    }
    playMusic(){
        if(!this.isPlaying && global.music){
            this.audioElement.play();
            this.isPlaying = true;
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