const apiKey = '119f871c033ce6326e9cb92a03c3c33b'; // Replace with your TMDB API key
const searchBar = document.querySelector('.search-bar');
const moviesSection = document.querySelector('.movies-section');
const watchlistSection = document.querySelector('.watchlist-section');
const emptyWatchlistMsg = document.querySelector('.empty-watchlist');
const suggestionsBox = document.querySelector('.suggestions');
let watchlist = [];
let genreList = [];



// Fetch genre list
async function fetchGenres() {
    const url = `https://api.themoviedb.org/3/genre/movie/list?api_key=${apiKey}`;
    try {
        const response = await fetch(url);
        const data = await response.json();
        genreList = data.genres; // Store genres data globally
    } catch (error) {
        console.error('Error fetching genres:', error);
    }
}

// Map genre IDs to names
function getGenreNamesByIds(genreIds) {
    return genreIds.map(id => {
        const genre = genreList.find(g => g.id === id);
        return genre ? genre.name : 'Unknown';
    }).join(', ');
}

// Search for movies
document.querySelector('.search-button').addEventListener('click', () => {
    fetchMovies();
    clearSuggestions();
});

async function fetchMovies() {
    const query = searchBar.value.trim();
    const url = `https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&query=${query}`;
    try {
        const response = await fetch(url);
        const data = await response.json();
        displayMovies(data.results);
        console.log(data);
    } catch (error) {
        console.error('Error fetching movies:', error);
    }
}

function displayMovies(movies) {
    moviesSection.innerHTML = ''; // Clear previous results
    movies.forEach(movie => {
        const movieCard = document.createElement('div');
        movieCard.classList.add('movie-card');
        
        movieCard.innerHTML = `
            <img src="https://image.tmdb.org/t/p/w500/${movie.poster_path}" alt="${movie.title}" class="movie-poster">
            <h2 class="movie-title">${movie.title}</h2>
            <p class="movie-release-date">${movie.release_date}</p>
            <button class="watchlist-button" onclick="addToWatchlist('${movie.id}', '${movie.title}', '${movie.poster_path}')">Add to Watchlist</button>
        `;

        // Open the modal when the movie card is clicked
        movieCard.addEventListener('click', () => openModal(movie));
        
        if(movie.poster_path !== null) {
            moviesSection.appendChild(movieCard); // Append to the movies section
        }
    });
}


// Event listener for typing in the search bar
searchBar.addEventListener('input', () => {
    const query = searchBar.value.trim();
    if (query.length > 1) { // Start suggesting after 2 characters
        fetchMovieSuggestions(query);
    } else {
        suggestionsBox.innerHTML = ''; // Clear suggestions if less than 2 characters
    }
});

// Fetch movie suggestions based on input
async function fetchMovieSuggestions(query) {
    const url = `https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&query=${query}`;
    try {
        const response = await fetch(url);
        const data = await response.json();
        displaySuggestions(data.results);
    } catch (error) {
        console.error('Error fetching movie suggestions:', error);
    }
}

// Display suggestions in the suggestions box
function displaySuggestions(movies) {
    suggestionsBox.innerHTML = ''; // Clear previous suggestions

    // Limit to 5 suggestions
    movies.slice(0, 5).forEach(movie => {
        const suggestionItem = document.createElement('div');
        suggestionItem.classList.add('suggestion-item');
        suggestionItem.innerHTML = `
            <img src="https://image.tmdb.org/t/p/w500/${movie.poster_path}" alt="${movie.title}" class="suggestion-img">
            <h3 class="suggestion-text">${movie.title}</h3>
        `;

        // Click event for suggestion item to auto-fill search bar
        suggestionItem.addEventListener('click', () => {
            searchBar.value = movie.title;
            suggestionsBox.innerHTML = ''; // Clear suggestions on selection
            fetchMovies(); // Trigger the search
        });

        suggestionsBox.appendChild(suggestionItem);
    });
}

// Clear suggestions after clicking search button 
function clearSuggestions(){
    suggestionsBox.innerHTML = '';
}

// Close suggestions when clicking outside
document.addEventListener('click', (event) => {
    if (!event.target.closest('.search-container')) {
        suggestionsBox.innerHTML = '';
    }
});

// Open Modal with movie details
function openModal(movie) {
    const modal = document.getElementById('movieModal');
    const modalPoster = document.getElementById('modalPoster');
    const modalTitle = document.getElementById('modalTitle');
    const modalOverview = document.getElementById('modalOverview');
    const modalRating = document.getElementById('modalRating');
    const modalDuration = document.getElementById('modalDuration');
    const modalGenres = document.getElementById('modalGenres');

    // Set modal content based on initial movie data
    modalPoster.src = `https://image.tmdb.org/t/p/w500/${movie.poster_path}`;
    modalTitle.textContent = movie.title;
    modalOverview.textContent = "Loading additional details...";
    modalGenres.textContent = getGenreNamesByIds(movie.genre_ids);

    // Fetch and update additional details
    fetchMovieDetails(movie.id).then(movieInfo => {
        // Update the modal content with the detailed data
        modalDuration.textContent += ` (${movieInfo.runtime} mins)`;
        modalOverview.textContent = movieInfo.synopsis;
        modalRating.textContent = ` ⭐ ${movieInfo.rating} `;

        // Display top cast members
        const castNames = movieInfo.cast.map(member => member.name).join(', ');
        const crewNames = movieInfo.crew.map(member => `${member.job}: ${member.name}`).join(', ');
        modalOverview.textContent += `\n\nCast: ${castNames}\n\nCrew: ${crewNames}`;
       
    });

    // Show the modal
    modal.style.display = 'block';
}

// Close the modal when the user clicks on <span> (x)
document.getElementById('closeModal').addEventListener('click', () => {
    const modal = document.getElementById('movieModal');
    modal.style.display = 'none'; // Close the modal
});

// Close the modal if the user clicks outside of it
window.addEventListener('click', (event) => {
    const modal = document.getElementById('movieModal');
    if (event.target === modal) {
        modal.style.display = 'none';
    }
});

async function fetchMovieDetails(movieId) {
    const detailsUrl = `https://api.themoviedb.org/3/movie/${movieId}?api_key=${apiKey}`;
    const creditsUrl = `https://api.themoviedb.org/3/movie/${movieId}/credits?api_key=${apiKey}`;

    try {
        // Fetch all data concurrently
        const [detailsResponse, creditsResponse, reviewsResponse, videosResponse] = await Promise.all([
            fetch(detailsUrl),
            fetch(creditsUrl)
        ]);

        // Parse JSON responses
        const detailsData = await detailsResponse.json();
        const creditsData = await creditsResponse.json();

        // Extract necessary information
        const movieInfo = {
            title: detailsData.title,
            synopsis: detailsData.overview,
            rating: detailsData.vote_average,
            runtime: detailsData.runtime,
            cast: creditsData.cast.slice(0, 10), // Get top 10 cast members
            crew: creditsData.crew.slice(0, 5), // Get top 5 crew members
        };

        return movieInfo;

    } catch (error) {
        console.error('Error fetching movie details:', error);
    }
}

// Initialize genre data
fetchGenres();
