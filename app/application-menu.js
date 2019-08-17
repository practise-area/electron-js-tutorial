const { app, dialog, Menu, MenuItem, shell } = require('electron');
const mainProcess = require('./main');

//blueprint for the menu
const template = [
    {
        label: 'File',
        submenu: [
            {
                label: 'New File',
                accelerator: 'CommandOrControl+N',
                click(){
                    mainProcess.createWindow();
                }
            },
            {
                label: 'Open File',
                accelerator: 'CommandOrControl+O',
                click(item, focusedWindow){
                    if(focusedWindow){
                        return mainProcess.getFileFromUser(focusedWindow);
                    }
                    
                    const newWindow = mainProcess.createWindow();

                    newWindow.on('show', ()=>{
                        mainProcess.getFileFromUser(newWindow);
                    });
                }
            },
            {
                label: 'Save File',
                accelerator: 'CommandOrControl+S',
                click(item, focusedWindow){
                    if(!focusedWindow){
                        return dialog.showErrorBox(
                            'Cannot Save or Export',
                            'There is currently no active document to save or export.'
                        );
                    }
                    focusedWindow.webContents.send('save-markdown');
                }
            },
            {
                label: 'Export HTML',
                accelerator: 'Shift+CommandOrControl+S',
                click(item, focusedWindow){
                    if(!focusedWindow){
                        return dialog.showErrorBox(
                            'Cannot Save or Export',
                            'There is currently no active document to save or export.'
                        );
                    }
                    focusedWindow.webContents.send('save-html');
                }
            },
        ]
    },
    {
    label: 'Edit',
    submenu: [
        //menu items given keyboard shortcuts called accelerators
        {
            label: 'Undo',
            accelerator: 'CommandOrControl+Z',
            role:'undo'
        },{
            label: 'Redo',
            accelerator: 'Shift+CommandOrControl+Z',
            role:'redo'
        },
        {type: 'separator'},
        {
            label: 'Cut',
            accelerator: 'CommandOrControl+X',
            role:'cut'
        },
        {
            label: 'Copy',
            accelerator: 'CommandOrControl+C',
            role: 'copy'
        },{
            label: 'Paste',
            accelerator: 'CommandOrControl+V',
            role: 'paste'
        },{
            label: 'select All',
            accelerator: 'CommandOrControl+Z',
            role:'selectall'
        },
    ]
}, {
    label: 'Window',
    role: 'window', 
    submenu: [
        {
            label: 'Minimize',
            accelerator: 'CommandOrControl+M',
            role:'minimize'
        },
            {
                label: 'Close',
                accelerator: 'CommandOrControl+W',
                role:'close'
            }
    ]
}, {
    label: 'Help',
    role: 'help',
    submenu: [
        {
            label: 'Visit Website',
            click(){ /* to be implemented */}
        },
        {
            label: 'Toggle Developer Tools',
            click(item, focusedWindow){
                if(focusedWindow) focusedWindow.webContents.toggleDevTools();
            }
        }
    ]
}];

if(process.platform === 'darwin'){
    const name = app.getName();
    template.unshift({
        label: name, 
        submenu: [
            { 
                label: `About ${name}`,
                role: 'about',
            },
            { type: 'separator'},
            {
                label: 'Services',
                role: 'services',
                submenu: [],
            }, {
                type: 'separator'
            },{
                label: `Hide ${name}`,
                accelerator: 'Command+H',
                role: 'hide',
            },{
                label: 'Hide Others',
                accelerator: 'Command-Alt+H',
                role: 'hideothers',
            }, {
                label: 'Show All',
                role: 'unhide',
            }, {
                type: 'separator',
            }, {
                label: `Quit ${name}`,
                accelerator: 'Command+Q',
                click(){ app.quit(); } //no built in role for quitting application
            }
        ],
            
    });

    const windowMenu = template.find(item => item.label === 'Window');
    windowMenu.role = 'window';
    windowMenu.submenu.push({
        type: 'separator'
    }, {
        label: 'Bring All to Front',
        role: 'front'
    })
}


const copyMenuItem = new MenuItem({
    label: 'Copy',
    accelerator: 'CommandOrControl+c',
    role: 'copy'
})
module.exports = Menu.buildFromTemplate(template);