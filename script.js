document.addEventListener('DOMContentLoaded', () => {
    
    // --- KONFIGURASI ---
    const API_KEY = '28ace874'; 
    const ITEMS_PER_PAGE = 24; 
    
    // --- VARIABLES ---
    let allMovies = [];      
    let activeMovies = [];   
    let currentPage = 1;

    // --- LOGIKA HALAMAN UTAMA (INDEX) ---
    const grid = document.getElementById('movie-grid');
    
    if (grid) {
        fetch('movies.json')
            .then(res => res.json())
            .then(data => {
                allMovies = data;
                activeMovies = data; 
                renderPagination(); 
            });

        function renderPagination() {
            grid.innerHTML = '';
            const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
            const endIndex = startIndex + ITEMS_PER_PAGE;
            const moviesToShow = activeMovies.slice(startIndex, endIndex);

            moviesToShow.forEach(movie => {
                const card = document.createElement('div');
                card.className = 'movie-card';
                // PERUBAHAN PENTING: Menggunakan <a> tag agar SEO Friendly
                card.innerHTML = `
                    <a href="watch.html?id=${movie.id}" style="text-decoration:none; color:inherit;">
                        <img src="${movie.poster_url}" alt="${movie.title}" loading="lazy">
                        <div class="movie-info">
                            <h3>${movie.title}</h3>
                            <span style="font-size:12px; color:#aaa;">${movie.genre || 'Film'}</span>
                        </div>
                    </a>
                `;
                grid.appendChild(card);
            });
            updatePaginationButtons();
        }
        
        // ... (Fungsi updatePaginationButtons, changePage, filterCategory, searchInput TETAP SAMA seperti sebelumnya) ...
    }

    // --- LOGIKA HALAMAN NONTON (WATCH) ---
    const videoPlayer = document.getElementById('videoPlayer');
    
    if (videoPlayer) {
        // 1. Ambil ID dari URL (contoh: ?id=5)
        const urlParams = new URLSearchParams(window.location.search);
        const movieId = parseInt(urlParams.get('id'));

        if (!movieId) { window.location.href = 'index.html'; return; }

        // 2. Fetch data lagi (karena kita tidak pakai localStorage)
        fetch('movies.json')
            .then(res => res.json())
            .then(movies => {
                // Cari film yang ID-nya cocok
                const movie = movies.find(m => m.id === movieId);
                
                if (movie) {
                    loadMovieData(movie);
                } else {
                    document.getElementById('movieTitle').innerText = "Film tidak ditemukan";
                }
            });

        function loadMovieData(movie) {
            videoPlayer.src = movie.video_url;
            document.getElementById('movieTitle').innerText = movie.title;
            document.title = `Nonton ${movie.title} - Misbar21`;

            // Cek OMDb / Custom
            if (movie.imdb_id) {
                fetch(`https://www.omdbapi.com/?i=${movie.imdb_id}&apikey=${API_KEY}&plot=full`)
                    .then(res => res.json())
                    .then(data => {
                        if (data.Response === "True") {
                            document.getElementById('movieYear').innerText = data.Year;
                            document.getElementById('movieRating').innerText = data.imdbRating;
                            document.getElementById('movieRuntime').innerText = data.Runtime;
                            document.getElementById('movieGenre').innerText = data.Genre;
                            document.getElementById('moviePlot').innerText = data.Plot;
                            document.getElementById('movieActors').innerText = data.Actors;
                        }
                    });
            } else {
                document.getElementById('movieGenre').innerText = movie.genre;
                document.getElementById('moviePlot').innerText = "Deskripsi tidak tersedia.";
            }
        }
    }
});
