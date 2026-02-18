document.addEventListener('DOMContentLoaded', () => {
    
    // --- KONFIGURASI ---
    const API_KEY = '28ace874'; // API Key Anda sudah terpasang
    
    // --- LOGIKA HALAMAN UTAMA (INDEX) ---
    const grid = document.getElementById('movie-grid');
    const searchInput = document.getElementById('searchInput');

    if (grid) {
        let allMovies = [];

        // Fetch data dari JSON lokal
        fetch('movies.json')
            .then(res => res.json())
            .then(data => {
                allMovies = data;
                renderMovies(allMovies);
                document.getElementById('loadingText').style.display = 'none';
            })
            .catch(err => console.error("Gagal memuat JSON:", err));

        // Render Film
        function renderMovies(movies) {
            grid.innerHTML = '';
            movies.forEach(movie => {
                const card = document.createElement('div');
                card.className = 'movie-card';
                card.innerHTML = `
                    <img src="${movie.poster_url}" alt="${movie.title}" loading="lazy">
                    <div class="movie-info">
                        <h3>${movie.title}</h3>
                    </div>
                `;
                // Saat diklik, simpan data film ke memori browser dan pindah halaman
                card.addEventListener('click', () => {
                    localStorage.setItem('activeMovie', JSON.stringify(movie));
                    window.location.href = 'watch.html';
                });
                grid.appendChild(card);
            });
        }

        // Fitur Pencarian
        searchInput.addEventListener('input', (e) => {
            const keyword = e.target.value.toLowerCase();
            const filtered = allMovies.filter(m => m.title.toLowerCase().includes(keyword));
            renderMovies(filtered);
        });
    }

    // --- LOGIKA HALAMAN NONTON (WATCH) ---
    const videoPlayer = document.getElementById('videoPlayer');
    
    if (videoPlayer) {
        // Ambil data dari LocalStorage
        const movie = JSON.parse(localStorage.getItem('activeMovie'));

        if (!movie) {
            window.location.href = 'index.html'; // Balik ke home jika tidak ada data
            return;
        }

        // Set Video Player dan Judul Dasar
        videoPlayer.src = movie.video_url;
        document.getElementById('movieTitle').innerText = movie.title;
        document.title = `Nonton ${movie.title} - Misbar21`;

        // Ambil Detail Tambahan dari OMDb API
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
                })
                .catch(err => console.log("Gagal ambil data API:", err));
        }
    }
});