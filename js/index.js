"use strict";
const searchInput = document.getElementById('searchInput');
const suggestionsDiv = document.getElementById('suggestions');
const searchResultsDiv = document.getElementById('searchResults');
const lastSearchList = document.getElementById('lastSearchList');
function debounce(func, timeout) {
    let timer;
    return function (...args) {
        clearTimeout(timer);
        timer = setTimeout(() => {
            func.apply(this, args);
        }, timeout);
    };
}
const handleInput = () => {
    const query = searchInput.value.trim();
    if (query) {
        searchSuggestions(query);
    }
    else {
        suggestionsDiv.innerHTML = '';
    }
};
searchInput.addEventListener('input', debounce(handleInput, 300));
function searchSuggestions(query) {
    suggestionsDiv.innerHTML = '';
    suggestionsDiv.classList.remove('visible');
    const previousSearches = getPreviousSearches();
    const filteredPreviousSearches = previousSearches
        .filter((previousQuery) => previousQuery.name.toLowerCase().includes(query.toLowerCase()))
        .slice(0, 5);
    fetch(`https://api.tvmaze.com/search/shows?q=${query}`)
        .then((response) => {
        if (!response.ok) {
            throw new Error('Network error');
        }
        return response.json();
    })
        .then((data) => {
        for (let i = 0; i < data.length && i < 10; i++) {
            const suggestionItem = document.createElement('div');
            suggestionItem.classList.add('suggestionsItem');
            suggestionItem.textContent = data[i].show.name;
            suggestionItem.addEventListener('click', () => {
                searchInput.value = data[i].show.name;
                showSearchResult(data[i].show);
            });
            if (filteredPreviousSearches.some((previousSearch) => previousSearch.name.toLowerCase() === data[i].show.name.toLowerCase())) {
                suggestionItem.classList.add('violet');
                suggestionsDiv.prepend(suggestionItem);
            }
            else {
                suggestionsDiv.append(suggestionItem);
            }
        }
    })
        .catch((error) => {
        console.error('Error fetching suggestions:', error);
    });
    suggestionsDiv.classList.add('visible');
}
function showSearchResult(showData) {
    searchResultsDiv.innerHTML = '';
    suggestionsDiv.innerHTML = '';
    suggestionsDiv.classList.remove('visible');
    const image = document.createElement('img');
    image.src = showData.image ? showData.image.medium : '';
    image.alt = showData.name;
    searchResultsDiv.appendChild(image);
    const title = document.createElement('h2');
    title.textContent = showData.name;
    searchResultsDiv.appendChild(title);
    const genres = document.createElement('p');
    genres.innerHTML = `<b>Genres:</b> ${showData.genres.join(', ')}`;
    searchResultsDiv.appendChild(genres);
    const premiered = document.createElement('p');
    premiered.innerHTML = `<b>Premiered:</b> ${showData.premiered}`;
    searchResultsDiv.appendChild(premiered);
    const summary = document.createElement('p');
    summary.innerHTML = showData.summary;
    searchResultsDiv.appendChild(summary);
    console.log("saveSearchQuery");
    saveSearchQuery(showData);
    console.log("updateLastSearches");
    updateLastSearches();
}
function getPreviousSearches() {
    const previousSearches = localStorage.getItem('previousSearches');
    try {
        return previousSearches ? JSON.parse(previousSearches) : [];
    }
    catch (error) {
        console.error('Error parsing previous searches:', error);
        return [];
    }
}
function saveSearchQuery(showData) {
    const previousSearches = getPreviousSearches();
    previousSearches.unshift(showData);
    try {
        localStorage.setItem('previousSearches', JSON.stringify(previousSearches));
        console.log('saveSearchQuery inside');
    }
    catch (error) {
        console.error('Error saving search:', error);
    }
}
function updateLastSearches() {
    const previousSearches = getPreviousSearches();
    lastSearchList.innerHTML = '';
    const displaySearches = previousSearches.slice(0, 3);
    for (let i = 0; i < displaySearches.length; i++) {
        const listItem = document.createElement('li');
        listItem.textContent = displaySearches[i].name;
        lastSearchList.appendChild(listItem);
    }
}
window.addEventListener('storage', (event) => {
    updateLastSearches();
});
