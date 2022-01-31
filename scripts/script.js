import { Terminal, Folder } from "./terminal.js";

Terminal.initialize();
Terminal.registerCommand("clear", function(argv) {
    Terminal.buffer = `${Terminal.header}`;
});

Terminal.registerCommand("help", function(argv) {
    let result = "";
    for(let command in Terminal.commands){
        result += `\n- ${command}`;
    }
    Terminal.buffer += result;
    // TODO -> Command description
});

Terminal.registerCommand("about", function(argv) {
    window.open("about.html", "_blank");
});

Terminal.registerCommand("notes", function(argv) {
    var size = 0.5;
    var myWindow = window.open("web-notes.html", "Web Notes", `width=${innerWidth * size}, height=${innerHeight * size}`);
});

Terminal.registerCommand("color", function(argv) {
    argv.shift(); // remove "color"
    Terminal.color = argv[0];
});

Terminal.registerCommand("echo", function(argv) {
    argv.shift(); // remove "echo"
    let text = argv.map(x => {
        return x.startsWith("$") ? Terminal.environmentVariables[x.substring(1)] : x;
    }).join(" ");
    Terminal.buffer += `\n${text}`;
});

Terminal.registerCommand("set", function(argv) {
    argv.shift(); // remove "set"
    let variable = argv.shift();
    let value = argv.join(" ");
    Terminal.environmentVariables[variable] = value;
});

Terminal.registerCommand("get", function(argv) {
    argv.shift(); // remove "get"
    let variable = argv.shift();
    Terminal.buffer += `\n${Terminal.environmentVariables[variable]}`;
});

Terminal.registerCommand("cd", function(argv) {
    argv.shift(); // remove "cd"
    let path = argv.join(" ");
    if(path == "..") {
        Terminal.currentDirectory = Terminal.currentDirectory.parent;
    } else {
        let folder = Terminal.currentDirectory.getChild(path);
        if(folder instanceof Folder) {
            Terminal.currentDirectory = folder;
        } else {
            Terminal.buffer += `\n${path} is not a folder`;
        }
    }
});

Terminal.registerCommand("mkdir", function(argv) {
    argv.shift(); // remove "mkdir"
    let folderName = argv.join(" ");
    let folder = new Folder(folderName, Terminal.currentDirectory);
    Terminal.currentDirectory.addArchive(folder);
});

Terminal.registerCommand("ls", function(argv) {
    argv.shift(); // remove "ls"
    for(let i = 0; i < Terminal.currentDirectory.archives.length; i++){
        if(i == 0){
            Terminal.buffer += "\n";
        }
        if(i == 4){
            Terminal.buffer += "\n";
        }
        let archive = Terminal.currentDirectory.archives[i];
        Terminal.buffer += `${archive.name}  `;
    }
});

Terminal.registerCommand("pwd", function(argv) {
    argv.shift(); // remove "pwd"
    Terminal.buffer += `\n${Terminal.currentDirectory.path}`;
});
