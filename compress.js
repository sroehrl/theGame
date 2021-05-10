import * as fs from 'fs';
import CleanCSS from 'clean-css'
// const cleanCSS = require('clean-css');

new CleanCSS({
    inline: ['all'],
    sourceMap: true,
    level: {
        1: {
            all: true,
            normalizeUrls: false
        },
        2: {
            restructureRules: true
        }
    }

}).minify(fs.readFileSync('./style.css','utf8'), (err, output)=>{
    if(err){
        console.log(err)
    }
    fs.writeFileSync('./style.min.css', output.styles, 'utf8')
})