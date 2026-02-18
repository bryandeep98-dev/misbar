document.addEventListener('DOMContentLoaded', () => {
    
    // --- KONFIGURASI ---
    const API_KEY = '28ace874'; 
    const ITEMS_PER_PAGE = 24; 
    
    // --- VARIABLES ---
    let allMovies = [];      
    let activeMovies = [];   
    let currentPage = 1;

    // --- FUNGSI PEMBUAT SLUG (JUDUL KE URL) ---
    // Contoh: "The Dark Knight" -> "the-dark-knight"
    function createSlug(title) {
        return title.toLowerCase()
            .replace(/[^\w\s-]/g, '') // Hapus karakter aneh
            .replace(/\s+/g, '-')     // Ganti spasi dengan strip
            .replace(/-+/g, '-');     // Hapus strip ganda
    }

    // --- CEK APAKAH KITA DI HALAMAN HOME ATAU FILM ---
    const path = window.location.pathname;
    const isHome = path === '/' || path === '/index.html';

    // Fetch Database
    fetch('movies.json')
        .then(res => res.json())
        .then(data => {
            allMovies = data;
            
            if (isHome) {
                // LOGIKA HOME PAGE
                activeMovies = data;
                initHomePage();
            } else {
                // LOGIKA HALAMAN NONTON (URL: /judul-film)
                const currentSlug = path.substring(1); // Ambil teks setelah tanda '/'
                const movie = allMovies.find(m => createSlug(m.title) === currentSlug);
                
                if (movie) {
                    initWatchPage(movie);
                } else {
                    // Jika film tidak ditemukan di database
                    document.body.innerHTML = "<h1 style='color:white;text-align:center;margin-top:50px;'>Film tidak ditemukan :(</h1><center><a href='/' style='color:red;'>Kembali ke Home</a></center>";
                }
            }
        })
        .catch(err => console.error("Gagal memuat data:", err));


    // --- LOGIKA HALAMAN UTAMA ---
    function initHomePage() {
        const grid = document.getElementById('movie-grid');
        if (!grid) return; // Pastikan elemen ada

        window.renderPagination = function() {
            grid.innerHTML = '';
            const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
            const endIndex = startIndex + ITEMS_PER_PAGE;
            const moviesToShow = activeMovies.slice(startIndex, endIndex);

            moviesToShow.forEach(movie => {
                const card = document.createElement('div');
                card.className = 'movie-card';
                const slug = createSlug(movie.title);
                
                // Perubahan Link ke format /judul-film
                card.innerHTML = `
                    <a href="/${slug}" style="text-decoration:none; color:inherit;">
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
        };

        // Jalankan render pertama
        renderPagination();

        // Setup Event Listeners (Search, Filter, Pagination)
        setupHomeEvents();
    }

    function setupHomeEvents() {
        // Tombol Pagination
        window.changePage = function(direction) {
            currentPage += direction;
            renderPagination();
            document.querySelector('.section-header').scrollIntoView({ behavior: 'smooth' });
        };

        // Filter Kategori
        window.filterCategory = function(category) {
            currentPage = 1;
            if (category === 'all') activeMovies = allMovies;
            else activeMovies = allMovies.filter(m => m.genre && m.genre.toLowerCase().includes(category.toLowerCase()));
            renderPagination();
        };

        // Pencarian
        const searchInput = document.getElementById('searchInput');
        if(searchInput) {
            searchInput.addEventListener('input', (e) => {
                const keyword = e.target.value.toLowerCase();
                currentPage = 1;
                activeMovies = allMovies.filter(m => m.title.toLowerCase().includes(keyword));
                renderPagination();
            });
        }
    }

    function updatePaginationButtons() {
        const prevBtn = document.getElementById('prevBtn');
        const nextBtn = document.getElementById('nextBtn');
        const pageIndicator = document.getElementById('pageIndicator');
        const paginationContainer = document.getElementById('paginationContainer');
        
        if(!pageIndicator) return;

        const totalPages = Math.ceil(activeMovies.length / ITEMS_PER_PAGE);
        pageIndicator.innerText = `Halaman ${currentPage} dari ${totalPages || 1}`;
        prevBtn.disabled = currentPage === 1;
        nextBtn.disabled = currentPage >= totalPages;
        paginationContainer.style.display = activeMovies.length === 0 ? 'none' : 'flex';
    }


    // --- LOGIKA HALAMAN NONTON ---
    function initWatchPage(movie) {
        // Pastikan kita ada di halaman yang punya video player
        // Karena Vercel me-rewrite ke watch.html, elemen2 ini harusnya ada
        const videoPlayer = document.getElementById('videoPlayer');
        if (!videoPlayer) return;

        videoPlayer.src = movie.video_url;
        document.getElementById('movieTitle').innerText = movie.title;
        document.title = `Nonton ${movie.title} - Misbar21`;

        // Ambil Data OMDb
        if (movie.imdb_id) {
            fetch(`https://www.omdbapi.com/?i=${movie.imdb_id}&apikey=${API_KEY}&plot=full`)
                .then(res => res.json())
                .then(data => {
                    if (data.Response === "True") {
                        if(document.getElementById('movieYear')) document.getElementById('movieYear').innerText = data.Year;
                        if(document.getElementById('movieRating')) document.getElementById('movieRating').innerText = data.imdbRating;
                        if(document.getElementById('movieRuntime')) document.getElementById('movieRuntime').innerText = data.Runtime;
                        if(document.getElementById('movieGenre')) document.getElementById('movieGenre').innerText = data.Genre;
                        if(document.getElementById('moviePlot')) document.getElementById('moviePlot').innerText = data.Plot;
                        if(document.getElementById('movieActors')) document.getElementById('movieActors').innerText = data.Actors;
                    }
                });
        } else {
            if(document.getElementById('movieGenre')) document.getElementById('movieGenre').innerText = movie.genre;
            if(document.getElementById('moviePlot')) document.getElementById('moviePlot').innerText = "Deskripsi tidak tersedia.";
        }
    }
});
