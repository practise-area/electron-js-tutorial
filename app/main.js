const { app, BrowserWindow, dialog } = require('electron');
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
        newWindow = null;
    });

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
})