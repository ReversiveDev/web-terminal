
export class Folder {

    name;
    parent;
    archives = [];

    get path() {
        return this.parent ? `${this.parent.path}/${this.name}` : this.name;
    }

    constructor(name, parent) {
        this.name = name;
        this.parent = parent;
    }

    addArchive(archive) {
        this.archives.push(archive);
    }

    getChild(path) {
        return this.archives.find(archive => archive.name === path);
    }

}

export class Terminal {

    static buffer;
    static cursor = 0;
    static cursorBlinkTime = 1000;
    static color = "white";
    static lastInput = "";
    static environmentVariables = {};
    static username;
    static commands = {};
    static context;
    static canvas;
    static header;
    static currentDirectory;
    
    static initialize() {
        Terminal.username = window.prompt("What is your username?") || "user";
        Terminal.canvas = document.createElement("canvas");
        Terminal.canvas.style.background = "black";
        Terminal.canvas.width = innerWidth;
        Terminal.canvas.height = innerHeight;
        Terminal.header = `root@${Terminal.username}:~$ `

        Terminal.currentDirectory = new Folder("~", null);
        
        Terminal.context = Terminal.canvas.getContext("2d");
        Terminal.buffer = Terminal.header;
        document.body.appendChild(Terminal.canvas);
        Terminal.registerEvents();
        Terminal.draw();
    }
    
    static draw() {
        Terminal.context.clearRect(0, 0, Terminal.canvas.width, Terminal.canvas.height);
        Terminal.context.fillStyle = Terminal.color;
        Terminal.context.font = "20px Monospace";
        let letterWidth = Terminal.context.measureText("a").width;

        let buffer = Terminal.buffer;
        let lines = (Terminal.buffer).split("\n");
        for(let i = 0; i < lines.length; i++) {
            let line = lines[i];
            Terminal.context.fillText(line, 5, 20 + i * 20);
            if(i == lines.length - 1) {
                Terminal.context.fillText("_", 5 + (9 + Terminal.username.length + Terminal.cursor) * letterWidth, 20 + i * 20);
            }
        }

        window.requestAnimationFrame(Terminal.draw);
    }

    static registerCommand(command, callback) {
        Terminal.commands[command] = callback;
    }

    static registerEvents() {
        document.addEventListener("keydown", e => {
            let lines = Terminal.buffer.split("\n");
            let lastLine = lines[lines.length - 1];
        
            if(e.key == "Backspace" && Terminal.cursor > 0) {
                let initialPos = Terminal.buffer.length - lastLine.length;
                let bufferLeft = Terminal.buffer.substring(0, initialPos + Terminal.header.length + Terminal.cursor - 1);
                let bufferRight = Terminal.buffer.substring(initialPos + Terminal.header.length + Terminal.cursor);
                Terminal.buffer = bufferLeft + bufferRight;
                Terminal.cursor--; 
            }
            
            if(e.key == "ArrowRight") {
                if(Terminal.cursor < lastLine.length - Terminal.header.length) {
                    Terminal.cursor++;
                }
            } else if(e.key == "ArrowLeft") {
                if(Terminal.cursor > 0) { 
                    Terminal.cursor--;
                }
            } else if(e.key == "ArrowUp") {
                Terminal.cursor = Terminal.lastInput.length;
                Terminal.buffer = lines.slice(0, lines.length - 1).join("\n") + `${lines.length > 1 ? "\n" : ""}root@${Terminal.username}:~$ ` + Terminal.lastInput;
            } else if(e.keyCode >= 33 && e.keyCode <= 191 || e.key == " ") {
                let buffer = Terminal.buffer.split("")
                buffer.splice(buffer.length - lastLine.length + Terminal.header.length + Terminal.cursor, 0, e.key)
                Terminal.buffer = buffer.join("")
                Terminal.cursor++;
            }
        
            if(e.key == "Enter") {
                Terminal.cursor = 0;
        
                let userInput = lastLine.substring(Terminal.header.length, lastLine.length);
                Terminal.lastInput = userInput;
                let argv = userInput.split(" ");
                if(Terminal.commands.hasOwnProperty(argv[0])) {
                    Terminal.commands[argv[0]](argv);
                    lines = Terminal.buffer.split("\n");
                    if(lines.length > 1 || lines[0] != Terminal.header){
                        Terminal.buffer += `\n${Terminal.header}`;
                    }
                } else if(argv[0]) {
                    Terminal.buffer += `\nCommand '${argv[0]}' not found!\n${Terminal.header}`;
                } else {
                    Terminal.buffer += `\n${Terminal.header}`;
                }
            }
        });
    }

}
