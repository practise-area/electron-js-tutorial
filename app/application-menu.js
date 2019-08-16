const { app, BrowserWindow, Menu, shell } = require('electron');
const mainProcess = require('./main');

//blueprint for the menu
const template = [{
    label: 'Edit',
    submenu: [
        //menu items given keyboard shortcuts called accelerators
        {
            label: 'Copy',
            accelerator: 'CommandOrControl+C',
            role: 'copy'
        },{
            label: 'Paste',
            accelerator: 'CommandOrControl+V',
            role: 'paste'
        }
    ]
}];

if(process.platform === 'darwin'){
    const name = 'Fire Wall';
    template.unshift({
        label: none
    })
}

module.exports = Menu.buildFromTemplate(template);