"use strict";
const searchInput = document.getElementById('searchInput');
const suggestionsDiv = document.getElementById('suggestions');
const searchResultsDiv = document.getElementById('searchResults');
const lastSearchList = document.getElementById('lastSearchList');
searchInput.addEventListener('input', () => {
    const query = searchInput.value.trim();
    if (query) {
        searchSuggestions(query);
    }
    else {
        suggestionsDiv.innerHTML = '';
    }
});
function searchSuggestions(query) {
    suggestionsDiv.innerHTML = '';
    suggestionsDiv.classList.remove('visible');
    const previousSearches = getPreviousSearches();
    console.log('previousSearches ', previousSearches);
    const filteredPreviousSearches = previousSearches.filter((previousQuery) => previousQuery.name.toLowerCase().includes(query.toLowerCase()));
    for (let i = 0; i < filteredPreviousSearches.length && i < 5; i++) {
        const suggestionItem = document.createElement('div');
        suggestionItem.classList.add('suggestionsItem');
        suggestionItem.classList.add('violet');
        suggestionItem.textContent = filteredPreviousSearches[i].name;
        suggestionItem.addEventListener('click', () => {
            searchInput.value = filteredPreviousSearches[i].name;
            showSearchResult(filteredPreviousSearches[i]);
        });
        suggestionsDiv.appendChild(suggestionItem);
    }
    const countApiSuggestions = 10 - suggestionsDiv.childElementCount;
    console.log('suggestionsDiv.count ', suggestionsDiv.childElementCount);
    fetch(`https://api.tvmaze.com/search/shows?q=${query}`)
        .then((response) => response.json())
        .then((data) => {
        for (let i = 0; i < data.length && i < countApiSuggestions; i++) {
            const suggestionItem = document.createElement('div');
            suggestionItem.classList.add('suggestionsItem');
            suggestionItem.textContent = data[i].show.name;
            suggestionItem.addEventListener('click', () => {
                searchInput.value = data[i].show.name;
                showSearchResult(data[i].show);
            });
            suggestionsDiv.appendChild(suggestionItem);
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
    genres.innerHTML = `<b>Жанры:</b> ${showData.genres.join(', ')}`;
    searchResultsDiv.appendChild(genres);
    const premiered = document.createElement('p');
    premiered.innerHTML = `<b>Премьера:</b> ${showData.premiered}`;
    searchResultsDiv.appendChild(premiered);
    const summary = document.createElement('p');
    summary.innerHTML = showData.summary;
    searchResultsDiv.appendChild(summary);
    saveSearchQuery(showData);
    updateLastSearches();
}
function getPreviousSearches() {
    const previousSearches = localStorage.getItem('previousSearches');
    return previousSearches ? JSON.parse(previousSearches) : [];
}
function saveSearchQuery(showData) {
    const previousSearches = getPreviousSearches();
    previousSearches.unshift(showData);
    localStorage.setItem('previousSearches', JSON.stringify(previousSearches));
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
updateLastSearches();
