'use strict';

const API_URL = 'https://api.tvmaze.com/shows';

const movieListElement = document.getElementById('movieList');
const searchInput = document.getElementById('searchInput');
const sortSelect = document.getElementById('sortSelect');
const genreSelect = document.getElementById('genreSelect');
const errorMessageElement = document.getElementById('errorMessage');
const loadingMessageElement = document.querySelector('.loading-message');

let allMovies = []; 
let displayedMovies = [];

async function fetchMovies() {
    try {
        loadingMessageElement.style.display = 'block'; 
        errorMessageElement.style.display = 'none'; 

        const response = await fetch(API_URL);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        allMovies = data; 
        displayedMovies = [...allMovies]; 
        
        populateGenres(allMovies); 
        displayMovies(displayedMovies); 

    } catch (error) {
        console.error('Помилка при завантаженні даних:', error);
        loadingMessageElement.style.display = 'none'; 
        errorMessageElement.style.display = 'block'; 
        movieListElement.innerHTML = ''; 
    } finally {
        loadingMessageElement.style.display = 'none';
    }
}

function displayMovies(moviesToDisplay) {
    movieListElement.innerHTML = '';

    if (moviesToDisplay.length === 0) {
        movieListElement.innerHTML = '<p class="loading-message">Фільми не знайдено за вашим запитом.</p>';
        return;
    }

    moviesToDisplay.forEach(movie => {
    
        const { id, name, summary, genres, image, rating } = movie;
        const imageUrl = image ? image.medium : 'https://via.placeholder.com/250x350?text=No+Image'; // Placeholder if no image

        const genreTags = genres && genres.length > 0
            ? genres.map(genre => `<span class="genre-tag">${genre}</span>`).join('')
            : '<span class="genre-tag">Невідомо</span>';

        const movieRating = rating && rating.average ? rating.average : 'N/A';

        const movieCard = `
            <div class="movie-card" data-id="${id}">
                <img src="${imageUrl}" alt="${name} постер">
                <div class="movie-card-content">
                    <h2>${name}</h2>
                    <div class="genres">
                        ${genreTags}
                    </div>
                    <p class="summary">${summary ? summary.replace(/<[^>]*>/g, '') : 'Немає опису.'}</p>
                    <p class="rating">Рейтинг: ${movieRating} <span style="color: gold;">&#9733;</span></p>
                </div>
            </div>
        `;
        movieListElement.insertAdjacentHTML('beforeend', movieCard);
    });
}

function populateGenres(movies) {
    const allGenres = new Set();
    movies.forEach(movie => {
        if (movie.genres && movie.genres.length > 0) {
            movie.genres.forEach(genre => allGenres.add(genre));
        }
    });

    genreSelect.innerHTML = '<option value="all">Всі жанри</option>'; // Reset
    Array.from(allGenres).sort().forEach(genre => {
        const option = document.createElement('option');
        option.value = genre;
        option.textContent = genre;
        genreSelect.appendChild(option);
    });
}

function applyFiltersAndSort() {
    let filteredMovies = [...allMovies]; 

    const searchTerm = searchInput.value.toLowerCase().trim();
    if (searchTerm) {
        filteredMovies = filteredMovies.filter(movie =>
            movie.name.toLowerCase().includes(searchTerm)
        );
    }


    const selectedGenre = genreSelect.value;
    if (selectedGenre !== 'all') {
        filteredMovies = filteredMovies.filter(movie =>
            movie.genres && movie.genres.includes(selectedGenre)
        );
    }

    const sortOption = sortSelect.value;
    if (sortOption !== 'none') {
        filteredMovies.sort((a, b) => {
            const nameA = a.name.toLowerCase();
            const nameB = b.name.toLowerCase();
            const ratingA = a.rating && a.rating.average ? a.rating.average : 0; // Default to 0 for N/A
            const ratingB = b.rating && b.rating.average ? b.rating.average : 0;

            if (sortOption === 'name_asc') {
                return nameA.localeCompare(nameB);
            } else if (sortOption === 'name_desc') {
                return nameB.localeCompare(nameA);
            } else if (sortOption === 'rating_asc') {
                return ratingA - ratingB;
            } else if (sortOption === 'rating_desc') {
                return ratingB - ratingA;
            }
            return 0; 
        });
    }

    displayedMovies = filteredMovies;
    displayMovies(displayedMovies); 
}

searchInput.addEventListener('input', applyFiltersAndSort);
sortSelect.addEventListener('change', applyFiltersAndSort);
genreSelect.addEventListener('change', applyFiltersAndSort);


document.addEventListener('DOMContentLoaded', fetchMovies);
