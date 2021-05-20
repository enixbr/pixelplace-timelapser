const fileSystem = require('fs');
const download = require('image-downloader');
const input = require('input');

let cfg = {
    "boardId": 7, // ID Of the canvas
    "name": "FirstTimelapse",
    "mode": "default", 
    /*
     default = the bot will download the /canvas/id.png (updates only each 1-2 minutes), the timelapse will be a litte shittier.
     advanced = the bot will join the canvas and get all the pixels each frame, so the timelapse will be neat. (not available yet)
     ^
     --- just discovered that you can't get canvas pixels without being logged into a real account, so no neat timelapse.
    */
    "cooldown": 72000, // Cooldown in miliscfg.time.seconds.

    "frames": 0, // Counter of frames catched.
    "maxFrames": Infinity, // Infinity = no limit.
}

print = function(m) {
    addz = function(n) {
        if (n < 10) return "0"+n;
        return n;
    }

    let date = new Date();
    console.log(`[${addz(date.getHours())}:${addz(date.getMinutes())}:${addz(date.getSeconds())}] : `+m);
}

async function setConfig() {
    cfg.boardId = await input.text(`Canvas ID`, {default: '7'});
    cfg.boardId = Number(cfg.boardId)

    cfg.name = await input.text(`Timelapse Name`)

    cfg.mode = 'default'

    cfg.cooldown = await input.text(`Cooldown for each frame in seconds`, {default: '72'});

    cfg.cooldown = Number(cfg.cooldown)*1000;

    if (cfg.cooldown < 72000) {
        print(`You specified an cooldown minor than 72s, changing cooldown to 72s...`)
        cfg.cooldown = 72000;
    }

    let frameLimit = await input.text(`Set an limit for downloading frames (y|n)`, {default: 'n'})
    if (frameLimit === 'y') cfg.maxFrames = Number(await (input.text(`Max Frames Limit`, {default: '100'})))
    else cfg.maxFrames = Infinity;

    if (cfg.boardId === '' || cfg.name === '' || cfg.mode === '' || cfg.cooldown === '') {
        print("You didn't specified an argument.")
        return process.exit();
    }

    console.clear();
    print('Timelapser configured succesfully.')
}

async function downloadCanvas() {
    if (!fileSystem.existsSync('./timelapses/'+cfg.name)){
        fileSystem.mkdirSync('./timelapses/'+cfg.name);
    }

    options = {
        url: 'https://pixelplace.io/canvas/'+cfg.boardId+'.png',
        dest: './timelapses/'+cfg.name+'/'+cfg.frames+'.png'
    }

    await download.image(options)
}

async function start() {
    await setConfig(); // Sets the config for the timelapser.

    setInterval(async() => {
        if (Number(cfg.frames) >= Number(cfg.maxFrames)) {
            print("Finished downloading frames. - "+cfg.frames+"/"+cfg.maxFrames)
            return process.exit();
        }

        try { 
            await downloadCanvas()
            cfg.frames++;
            print('New frame from Board '+cfg.boardId+' | '+cfg.frames+'/'+cfg.maxFrames+' - '+(cfg.maxFrames-cfg.frames)+' lasting.')
        } catch (e) {
            print('Failed to download frame from Board '+cfg.boardId+' | '+cfg.frames+'/'+cfg.maxFrames+' - '+(cfg.maxFrames-cfg.frames)+' lasting.')
        };
    },Number(cfg.cooldown))
}

start() // You know what this does, don't you?