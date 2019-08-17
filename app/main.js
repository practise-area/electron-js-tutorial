const { app, BrowserWindow, dialog, Menu } = require('electron');
const applicationMenu = require('./application-menu');
const fs = require('fs');

let mainWindow = null;

app.on('ready', ()=>{
    // mainWindow = new BrowserWindow({ show: false, webPreferences: { nodeIntegration: true} });
    // mainWindow.loadFile(__dirname+'/index.html');

    // mainWindow.once('ready-to-show', ()=>{
    //     mainWindow.show();
    //     getFileFromUser();
    // });
    
    // mainWindow.on('closed', ()=>{
    //     mainWindow = null;
    // });

    createWindow();
})

const getFileFromUser = exports.getFileFromUser=()=>{
    const files = dialog.showOpenDialog({
        properties: ['openFile'],
        filters: [
            { name: 'Text Files', extensions: ['txt'] },
            { name: 'Markdow Files', extensions: ['md', 'markdown']}
        ]
    });

    if(files) {openFile(files[0]); }
};

const openFile = exports.openFile = (targetWindow, file)=>{
    const content = fs.readFileSync(file).toString();
    app.addRecentDocument(file);
    targetWindow.setRepresentedFilename(file);
    targetWindow.webContents.send('file-opened', file, content);
};

const windows = new Set();

const createWindow = exports.createWindow = ()=>{
    let x,y;
    const currentWindow = BrowserWindow.getFocusedWindow();
    
    if(currentWindow){
        const [currentWindowX, currentWindowY] = currentWindow.getPosition();
        x = currentWindowX + 10;
        y = currentWindowY + 10;
    }

    let newWindow = new BrowserWindow({
        x,
        y,
        show: false,
        webPreferences: {
            nodeIntegration: true
        }
    });

    newWindow.loadFile(__dirname+'/index.html');

    newWindow.once('ready-to-show', ()=>{
        newWindow.show();
    });

    newWindow.on('closed', ()=>{
        //removes referrence when window is closed
        windows.delete(newWindow);
        stopWatchingFile(newWindow); //stop watching file for closed window
        newWindow = null;
    });

    newWindow.on('close', (event)=>{
        if(newWindow.isDocumentEdited()){
            event.preventDefault();
    
            const result = dialog.showMessageBox(newWindow, {
                type: 'warning',
                title: 'Quit with Unsaved Changes?',
                message: 'Your changes will be lost if you do not save',
                buttons: [ //provides a list of labels
                    'Quit Anyway',
                    'Cancel'
                ],
                defaultId: 0, //sets the first option as default if return key pressed
                cancelId: 1 //sets second button as the main button if user dissmisses the box
            });
    
            if(result === 0) newWindow.destroy();
        }
    })

    //adds new window when opeed
    windows.add(newWindow);
    return newWindow;
};

//keep alive when all windows are closed...on mac OS
app.on('window-all-closed', ()=>{
    if(process.platform === 'darwin'){
        return false;
    }

    app.quit();
});

//only on macOS
app.on('activate', (event, hasVisibleWindows)=>{
    if(!hasVisibleWindows){
        createWindow();
    }
});

app.on('will-finish-launching', ()=>{
    app.on('open-file', (event, file) => {
        const win = createWindow();
        win.once('ready-to-show', ()=>{
            openFile(win, file);
        })
    })
});

const saveHTML = exports.saveHTML = (targetWindow, content) => {
    const file = dialog.showSaveDialog(targetWindow, {
        title: 'Save HTML',
        defaultPath: app.getPath('documents'),
        filters: [
            {name: 'HTML files', extensions: ['html', 'htm']}
        ]
    });

    if(!file) return;

    fs.writeFileSync(file, content);
}

const saveMarkdown = exports.saveMarkdown = (targetWindow, file, content) => {
    if(!file){
        file = dialog.showSaveDialog(targetWindow, {
            title: 'Save Markdown',
            defaultPath: app.getPath('documents'),
            filters: [
                { name: 'Markdown files', extensions: ['md', 'markdown']}
            ]
        });
    }

    if(!file) return;

    fs.writeFileSync(file, content);
    openFile(targetWindow, file);
}

const openFiles = new Map();

const startWatchingFile = (targetWindow, file) => {
    stopWatchingFile(targetWindow);

    const watcher = fs.watchFile(file, event => {
        if(event === 'change'){
            const content = fs.readFileSync(file);

            //send message to the renderer process
            targetWindow.webContents.send('file-changed', file, content);
        }
    });

    openFiles.set(targetWindow, watcher);
};

const stopWatchingFile = (targetWindow) => {
    if(openFiles.has(targetWindow)){ //checks if watcheris running fo this window
        openFiles.get(targetWindow).stop();
        openFiles.delete(targetWindow);
    }
};



//sets application menu as defaut app when it lauches
app.on('ready', ()=>{
    Menu.setApplicationMenu(applicationMenu);
    createWindow();
})