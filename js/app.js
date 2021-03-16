const users = 'https://randomuser.me/api/?nat=us&inc=picture,name,email,location,cell,address,dob&results=12'
const gallery = document.getElementById('gallery');
let personList = [];
/*  
    Data Wrangling Functions
    */

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
    .then(data => buildCards(data.results))
    .then(buildSearch)
    .then(handleSearch)
    .then(data => {
        personList = [...data]
    })
    .catch(err => console.log(err))

/* Helper Functions  */
function checkStatus(res) {
    if (res.ok) {
        return Promise.resolve(res);
    } else {
        return Promise.reject(new Error(res.statusText));
    }
}

// Remove the modal div
function closeModal() {
    document.getElementById('modal').remove();
}
/*
    S E A R C H

    */

function buildSearch(list) {
    const searchContainer = document.querySelector('.search-container');
    const searchHtml = `<form action="#" method="get">
        <input type="search" id="search-input" class="search-input" placeholder="Search...">
        <input type="submit" value="&#x1F50D;" id="search-submit" class="search-submit">
        </form>`;
    searchContainer.insertAdjacentHTML('beforeend', searchHtml);
    return Promise.resolve(list);
};

function handleSearch(list) {
    const searchBtn = document.querySelector('#search-submit');
    const searchInput = document.querySelector('#search-input');
    function searchEvent(e) {
        e.preventDefault();
        let searchResults = searchPeople(list, searchInput);
        buildCards(searchResults)
    } 
    searchBtn.addEventListener('click', searchEvent);
    searchInput.addEventListener('keyup', searchEvent);
    return Promise.resolve(list);
}

/***
 * `searchPeople` takes input field and a list,
 * returns: array of search results
 ***/
function searchPeople(list, input) {
    return searchList = filterItems(list, input.value)
    // Adapeted from MDN filter documentation
    // https://developer.mozilla.org/en-US/docs/web/javascript/reference/global_objects/array/filter
    function filterItems(arr, query) {
        return arr.filter(function(el) {
            return el.name.first.toLowerCase().indexOf(query.toLowerCase()) !== -1
                || el.name.last.toLowerCase().indexOf(query.toLowerCase()) !== -1
        })
    }
}
// Handle search submit


// Build the modal for a person
function buildHTML(person) {
    return `
    <div class="modal-container">
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

// Populate Modal //

function showModal(list, index) {
    // Gallery is our target html container
    const perPage = 1;
    const prevIndex = (index * perPage) - perPage;
    const nextIndex = (index * perPage) + 1;
    const modalDiv = document.createElement('div');

    modalDiv.id = 'modal';
    gallery.appendChild(modalDiv);

    list.forEach((person, i) => {
        if (i > prevIndex && i < nextIndex) {
            modalDiv.insertAdjacentHTML('beforeend', buildHTML(person));
        }
    })

    // Initialize modalBtns
    modalBtns(list, prevIndex, nextIndex);
}

function modalBtns(list, prevIndex, nextIndex) {
    const btnContainer = document.querySelector('.modal-btn-container');
    const modalCloseBtn = document.getElementById('modal-close-btn');

    // Close modal button
    modalCloseBtn.addEventListener('click', (e) => {
        closeModal();
    });

    // Next and Prev Buttons
    btnContainer.addEventListener('click', (e) => {
        // Close currently open modal
        closeModal();
        // Handle next and prev logic
        if (prevIndex === -1) {
            prevIndex += 1;
        }
        if (nextIndex > list.length - 1) {
            nextIndex -= 1;
        }
        if (e.target.textContent === 'Prev') {
            showModal(list, prevIndex);
        } else {
            showModal(list, nextIndex);
        }
    })
}

/*  
    Build Cards for Gallery
    Takes an array and populates html cards with each array items data 
*/
function buildCards(data) {
    gallery.innerHTML = '';

    data.map(person => {
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
    addCardEventHandler(data);
    return Promise.resolve(data);
}

// Add Event Listeners to Cards
function addCardEventHandler(list) {
    const cards = document.querySelectorAll('.card')
    cards.forEach(card => {
        card.addEventListener('click', (e) => {
            let clickedPerson = card.dataset.person;
            let person = list.filter(x => x.email === clickedPerson);
            showModal(list, list.indexOf(person[0]));
        })
    })
}
