const marked = require('marked');
const { remote, ipcRenderer } = require('electron');
const { Menu } =remote;
const mainProcess = remote.require('./main.js');
const currentWindow = remote.getCurrentWindow();
const path = require('path');

let filePath=null;
let originalContent = '0';

const markdownView = document.querySelector('#markdown');
const htmlView = document.querySelector('#html');
const newFileButton = document.querySelector('#new-file');
const openFileButton = document.querySelector('#open-file');
const saveMarkdownButton = document.querySelector('#save-markdown');
const revertButton = document.querySelector('#revert');
const saveHtmlButton = document.querySelector('save-html');
const showFileButton = document.querySelector('#show-file');
const openInDefaultButton = document.querySelector('#open-in-default');

const renderMarkdownToHtml = (markdown) => {
    htmlView.innerHTML = marked(markdown, { sanitize: true});
};

markdownView.addEventListener('keyup', (event)=>{
    const currentContent = event.target.value;
    renderMarkdownToHtml(currentContent);
    updateUserInterface(currentContent !== originalContent);
});

openFileButton.addEventListener('click', ()=>{
    mainProcess.getFileFromUser(currentWindow);
});

ipcRenderer.on('file-opened', (event, file, content)=>{
    filePath = file; //updates the path of the currently openend file stored in the top-level scope
    originalContent = content; //updates the original content to determine if the file has unsaved changes

    markdownView.value = content;
    renderMarkdownToHtml(content);

    updateUserInterface();
});

ipcRenderer.on('file-opened', (event, file, content)=>{
    if(currentWindow.isDocumentEdited()){
        const result = remote.dialog.showMessageBox(currentWindow, {
            type: 'warning',
            title: 'Overwrite Current Unsaved Changes?',
            message: 'Opening a new file in this window will overwrite your unsaved changes. Open this file anyway?',
            buttons: [
                'Yes',
                'Cancel',
            ],
            defaultId: 0,
            cancelId: 1
        });

        if(result === 1) { return ;}
    }

    renderFile(file, content);
});

ipcRenderer.on('file-changed', (event, file, content)=>{
    const result = remote.dialog.showMessageBox(currentWindow, {
        type: 'warning',
        title: 'Overwrite Current Unsaved Changes?',
        message: 'Another application has changed this file. Load changes?',
        buttons: [
            'Yes',
            'Cancel'
        ],
        defaultId: 0,
        cancelId: 1
    });

    renderFile(file, content);
})
newFileButton.addEventListener('click', ()=>{
    mainProcess.createWindow();
});

const updateUserInterface = (isEdited)=> {
    let title = 'Fire Sale';

    if(filePath){
        title = `${path.basename(filePath)} - ${title}`;
    }

    if(isEdited){
        title = `${title} (Edited)`;
    }
    currentWindow.setTitle(title);
    currentWindow.setDocumentEdited(isEdited);

    saveMarkdownButton.disabled = !isEdited;
    revertButton.disabled = !isEdited;
};

saveHtmlButton.addEventListener('click', ()=>{
    mainProcess.saveHTML(currentWindow, filePath, markdownView.view);
})

revertButton.addEventListener('click', ()=>{
    markdownView.value = originalContent;
    renderMarkdownToHtml(originalContent);
})

/* prevent default behaviour */
document.addEventListener('dragstart', event => event.preventDefault());
document.addEventListener('dragover', event => event.preventDefault());
document.addEventListener('dragleave', event => event.preventDefault());
document.addEventListener('drop', event => event.preventDefault());

/* helper methods */
const getDraggedFile = (event) => event.dataTransfer.items[0];
const getDroppedFile = (event) => event.dataTransfer.files[0];

const fileTypeIsSupported = (file) => {
    return ['text/plain', 'text/markdown'].includes(file.type);
};

markdownView.addEventListener('dragover', (event) => {
    const file = getDraggedFile(event);

    if(fileTypeIsSupported(file)){
        markdownView.classList.add('drag-over');
    }else{
        markdownView.classList.add('drag-error');
    }
});

markdownView.addEventListener('dragleave', (event) => {
    markdownView.classList.remove('drag-over');
    markdownView.classList.remove('drag-error');
})

markdownView.addEventListener('drop', (event) => {
    const file = getDroppedFile(event);

    if(fileTypeIsSupported(file)){
        mainProcess.openFile(currentWindow, file.path);
    }else{
        alert('That file type is not supported');
    }

    markdownView.classList.remove('drag-over');
    markdownView.classList.remove('drag-error');
});

const renderFile = (file, content) => {
    filePath = file;
    originalContent = content;

    markdownView.value = content;
    renderMarkdownToHtml(content);

    showFileButton.disabled = false;
    openInDefaultButton.disabled = false;
    
    updateUserInterface(false);
}

ipcRenderer.on('save-markdown', ()=>{
    mainProcess.saveMarkdown(currentWindow, filePath, markdownView.value);
});

ipcRenderer.on('save-html', ()=>{
    mainProcess.saveHTML(currentWindow, filePath, markdownView.value);
});


markdownView.addEventListener('contextmenu', (event)=>{
    event.preventDefault();
    markdownContexBtMenu.popup();
});

const markdownContextMenu = Menu.buildFromTemplate([
    { label: 'Open File', click(){ mainProcess.getFileFromUser(); }},
    { type: 'separator' },
    { label: 'Cut', role: 'cut' },
    { label: 'Copy', role: 'copy'},
    { label: 'Paste', role: 'paste' },
    { label: 'Select All', role: 'selectall'},
]);