const { shell } = require('electron');

const parser = new DOMParser();

const linkSection = document.querySelector('.links');
const errorMessage = document.querySelector('.error-message');
const newLinkForm = document.querySelector('.new-link-form');
const newLinkUrl = document.querySelector('.new-link-url');
const newLinkSubmit = document.querySelector('.new-link-submit');
const clearStorageButton = document.querySelector('.clear-storage');


newLinkUrl.addEventListener('keyup', ()=>{
    newLinkSubmit.disabled = !newLinkUrl.validity.valid;
    console.log(!newLinkUrl.validity.valid);
})

const clearForm = ()=>{
    newLinkUrl.value = null;
};

newLinkForm.addEventListener('submit', (event)=>{
    event.preventDefault();

    const url = newLinkUrl.value;

    fetch(url)
        .then(validateResponse)
        .then(response => response.text())           
        .then(parseResponse)
        .then(findTitle)
        .then(title => storeLink(title, url))
        .then(clearForm)
        .then(renderLinks)
        .catch(error => handleError(error, url));
    
});

const parseResponse = (text) => {
    return parser.parseFromString(text, 'text/html');
}

const findTitle = (nodes)=>{
    return nodes.querySelector('title').innerText;
}

const storeLink = (title, url) => {
    localStorage.setItem(url, JSON.stringify({
        title: title,
        url: url
    }));
}

const getLinks = () => {
    return Object.keys(localStorage)
        .map(key => JSON.parse(localStorage.getItem(key)));
}

const convertToElement = (link) => {
    return `
        <div class="link">
            <h3>${link.title}</h3>
            <p>
                <a href="${link.url}">${link.url}</a>
            </p>
    `;
}

const renderLinks = ()=> {
    const linkElements = getLinks().map(convertToElement).join('');
    linkSection.innerHTML = linkElements;
}

clearStorageButton.addEventListener('click', ()=>{
    localStorage.clear();
    linkSection.innerHTML = '';
});

const handleError = (error, url) => {
    errorMessage.innerHTML =   `
        There was an issue adding "${url}": ${error.message}
    `.trim();
    setTimeout(()=> errorMessage.innerText = null, 5000);
}

const validateResponse = (response) => {
    if(response.ok){
        return response;
    } throw new Error(`Status code of ${response.status} ${response.statusText}`);
}

linkSection.addEventListener('click', (event)=>{
    if(event.target.href){
        event.preventDefault();
        shell.openExternal(event.target.href);
    }
});
renderLinks();