document.addEventListener('DOMContentLoaded', () => {
    
    // --- KONFIGURASI ---
    const API_KEY = '28ace874'; 
    const ITEMS_PER_PAGE = 24; // Ubah angka ini jika ingin lebih banyak/sedikit
    
    // --- GLOBAL VARIABLES ---
    let allMovies = [];      // Menyimpan SEMUA data dari JSON
    let activeMovies = [];   // Menyimpan data yang SEDANG DITAMPILKAN (setelah filter/search)
    let currentPage = 1;

    // --- LOGIKA HALAMAN UTAMA (INDEX) ---
    const grid = document.getElementById('movie-grid');
    const searchInput = document.getElementById('searchInput');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const pageIndicator = document.getElementById('pageIndicator');
    const paginationContainer = document.getElementById('paginationContainer');

    if (grid) {
        // Fetch data
        fetch('movies.json')
            .then(res => res.json())
            .then(data => {
                allMovies = data;
                activeMovies = data; // Awalnya, aktif = semua film
                renderPagination();  // Tampilkan halaman 1
            })
            .catch(err => console.error("Gagal memuat JSON:", err));

        // Fungsi Memotong & Menampilkan Film sesuai Halaman
        function renderPagination() {
            grid.innerHTML = '';
            
            // Hitung start dan end untuk slice array
            const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
            const endIndex = startIndex + ITEMS_PER_PAGE;
            const moviesToShow = activeMovies.slice(startIndex, endIndex);

            // Tampilkan film
            moviesToShow.forEach(movie => {
                const card = document.createElement('div');
                card.className = 'movie-card';
                card.innerHTML = `
                    <img src="${movie.poster_url}" alt="${movie.title}" loading="lazy">
                    <div class="movie-info">
                        <h3>${movie.title}</h3>
                        <span style="font-size:12px; color:#aaa;">${movie.genre || 'Film'}</span>
                    </div>
                `;
                card.addEventListener('click', () => {
                    localStorage.setItem('activeMovie', JSON.stringify(movie));
                    window.location.href = 'watch.html';
                });
                grid.appendChild(card);
            });

            // Update Tombol Navigasi
            updatePaginationButtons();
        }

        // Fungsi Update Status Tombol
        function updatePaginationButtons() {
            const totalPages = Math.ceil(activeMovies.length / ITEMS_PER_PAGE);
            
            pageIndicator.innerText = `Halaman ${currentPage} dari ${totalPages || 1}`;
            
            // Disable tombol Prev jika di halaman 1
            prevBtn.disabled = currentPage === 1;
            
            // Disable tombol Next jika di halaman terakhir
            nextBtn.disabled = currentPage === totalPages || totalPages === 0;

            // Sembunyikan navigasi jika tidak ada film
            paginationContainer.style.display = activeMovies.length === 0 ? 'none' : 'flex';
        }

        // Fungsi Ganti Halaman (Dipanggil dari HTML onclick)
        window.changePage = function(direction) {
            currentPage += direction;
            renderPagination();
            // Scroll ke atas grid agar user tidak bingung
            document.querySelector('.section-header').scrollIntoView({ behavior: 'smooth' });
        };

        // --- FILTER KATEGORI ---
        window.filterCategory = function(category) {
            currentPage = 1; // Reset ke halaman 1 setiap ganti kategori
            
            if (category === 'all') {
                activeMovies = allMovies;
            } else {
                activeMovies = allMovies.filter(m => 
                    m.genre && m.genre.toLowerCase().includes(category.toLowerCase())
                );
            }
            renderPagination();
        };

        // --- PENCARIAN ---
        searchInput.addEventListener('input', (e) => {
            const keyword = e.target.value.toLowerCase();
            currentPage = 1; // Reset ke halaman 1 saat mengetik
            
            activeMovies = allMovies.filter(m => 
                m.title.toLowerCase().includes(keyword)
            );
            renderPagination();
        });
    }

    // --- LOGIKA HALAMAN NONTON (WATCH) ---
    const videoPlayer = document.getElementById('videoPlayer');
    
    if (videoPlayer) {
        const movie = JSON.parse(localStorage.getItem('activeMovie'));

        if (!movie) {
            window.location.href = 'index.html';
            return;
        }

        videoPlayer.src = movie.video_url;
        document.getElementById('movieTitle').innerText = movie.title;
        document.title = `Nonton ${movie.title} - Misbar21`;

        // Ambil data OMDb jika ada IMDb ID
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
                .catch(err => console.log("API Error:", err));
        } else {
            // Jika film Adult/Custom tanpa IMDb
            document.getElementById('movieGenre').innerText = movie.genre;
            document.getElementById('moviePlot').innerText = "Deskripsi tidak tersedia untuk konten ini.";
        }
    }
});
