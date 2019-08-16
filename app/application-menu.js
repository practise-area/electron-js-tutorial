const { app, BrowserWindow, Menu, MenuItem, shell } = require('electron');
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
        label: none, 
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
        ]
            
    })
}


const copyMenuItem = new MenuItem({
    label: 'Copy',
    accelerator: 'CommandOrControl+c',
    role: 'copy'
})
module.exports = Menu.buildFromTemplate(template);