const users = 'https://randomuser.me/api/?nat=us&inc=picture,name,email,location,cell,address,dob&results=12'
const gallery = document.getElementById('gallery');
let personList = [];
/*  Data Wrangling Functions    */

// Async/Await Version of Fetch
async function asyncJSON(url) {
    try {
        const response = await fetch(url);
        return response.json();
    }
    catch (err) {
        console.log('there was an error getting data: ', err)
    }
}

// Fetch API Version
function fetchJSON(url) {
    return fetch(url)
        .then(checkStatus)
        .then(res => res.json())
        .catch(err => console.log('There was a problem fetching from the API ', err))
}

// XHR Version of API Request
function xhrJSON(url) {
    const xhr = new XMLHttpRequest();
    xhr.onreadystatechange = () => {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                const data = JSON.parse(xhr.responseText);
                console.log(data.results)
            } else {
                console.log('An error occured: ', xhr.statusText)
            }
        }
    };
    xhr.open('GET', url);
    xhr.send();
}

// Operations
fetchJSON(users)
    .then(buildCards)
    .then(data => {
        personList = [...data.results]
    })
    .then(addCardEventHandler)
    .catch(err => console.log(err))


/* Helper Functions  */
function checkStatus(res) {
    if (res.ok) {
        return Promise.resolve(res);
    } else {
        return Promise.reject(new Error(res.statusText));
    }
}

// Populate Modal //
function showModal(email) {
    let person = personList.filter(x => x.email === email);
    
    console.log(personList.indexOf(person[0]));
    
    let html = buildHTML(person[0]);
    gallery.insertAdjacentHTML('beforeend', html);

    // Initialize modalBtns
    checkIndex(personList.indexOf(person[0]));
    
    // Close modal switch
    const modalCloseBtn = document.getElementById('modal-close-btn');
    modalCloseBtn.addEventListener('click', closeModal);
}

function checkIndex(index) {
    if (index - 1 < 0) {
        modalBtns(0, 1);
    } else if (index + 1 > personList.length-1) {
        modalBtns(index - 1, index)
    } else {
        modalBtns(index - 1, index + 1);
    }
}

function modalBtns(prevIndex, nextIndex) {
    // Setup prev/next btns
    const prev = document.getElementById('modal-prev');
    const next = document.getElementById('modal-next');
    
    // next.style = "background: rgba(255, 255, 255, 1); color: rgba(25, 25, 25, 1);";
    
    prev.addEventListener('click', (e) =>{
        closeModal();
        showModal(personList[prevIndex].email);
    })
    next.addEventListener('click', (e) =>{
        closeModal();
        showModal(personList[nextIndex].email);
    })
}

function closeModal() {
    document.getElementById('modal').remove()
}

function buildHTML(person) {
    return `
    <div class="modal-container" id="modal">
        <div class="modal">
            <button type="button" id="modal-close-btn" class="modal-close-btn"><strong>X</strong></button>
            <div class="modal-info-container">
            <img class="modal-img" src="${person.picture.large}" alt="${person.name.first} ${person.name.last} from ${person.location.state}">
            <h3 id="name" class="modal-name cap">${person.name.first} ${person.name.last}</h3>
            <p class="modal-text">${person.email}</p>
            <p class="modal-text cap">${person.location.city}</p>
            <hr>
            <p class="modal-text">${person.cell}</p>
            <p class="modal-text">${person.location.street.number} ${person.location.street.name}, ${person.location.city}, ${person.location.state.slice(0, 2).toUpperCase()} ${person.location.postcode}</p>
            <p class="modal-text">Birthday: ${person.dob.date}</p>
            </div>
        </div>
        <div class="modal-btn-container">
        <button type="button" id="modal-prev" class="modal-prev btn">Prev</button>
        <button type="button" id="modal-next" class="modal-next btn">Next</button>
    </div>
    </div>`
}


/*  Build Cards for Gallery
    Takes an array of people objects and populates html cards 
*/
function buildCards(data) {
    data.results.map(person => {
        html = `
        <div class="card" data-person="${person.email}">
                <div class="card-img-container">
                    <img class="card-img" src="${person.picture.large}" alt="${person.name.first} ${person.name.last} from ${person.location.state}">
                </div>
            <div class="card-info-container">
                <h3 id="name" class="card-name cap">${person.name.first} ${person.name.last}</h3>
                <p class="card-text">${person.email}</p>
                <p class="card-text cap">${person.location.city}, ${person.location.state}</p>
            </div>
        </div>`

        // Insert Gallery HTML
        gallery.insertAdjacentHTML('beforeend', html);
    });
    return Promise.resolve(data);
}


// Event Listeners
function addCardEventHandler() {
    const cards = document.querySelectorAll('.card') 
    cards.forEach(card => {
        card.addEventListener('click', (e) => {
            let person = card.dataset.person;
            showModal(person)
        })
    })    
}
