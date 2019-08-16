const { app, BrowserWindow, Menu, shell } = require('electron');
const mainProcess = require('./main');

//blueprint for the menu
const template = [{
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
    label: 'window', 
    subment: [
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
}];

if(process.platform === 'darwin'){
    const name = app.getName();
    template.unshift({
        label: none
    })
}

module.exports = Menu.buildFromTemplate(template);