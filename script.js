document.addEventListener('DOMContentLoaded', () => {

    // --- BÖLÜM 1: HEADER VE ARAMA FONKSİYONLARI ---
     
    const header = document.getElementById('site-header');
    const mainContent = document.querySelector('main');
     
    // Sayfanın üst boşluğunu header'ın başlangıç yüksekliğine göre ayarla
    function setMainPadding() {
        if (header && mainContent) {
            const headerHeight = header.offsetHeight;
            mainContent.style.paddingTop = `${headerHeight}px`;
        }
    }

    // Header varsa bu fonksiyonları çalıştır
    if (header) {
        setMainPadding();
        window.addEventListener('resize', setMainPadding);

        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        });
    }

    const timeDisplay = document.getElementById('current-time');
    // Sadece saat elementi varsa çalıştır
    if (timeDisplay) {
        function updateTime() {
            const now = new Date();
            const options = { weekday: 'long', day: '2-digit', month: 'long', hour: '2-digit', minute: '2-digit' };
            timeDisplay.textContent = now.toLocaleDateString('en-US', options); // İngilizce format
        }
        updateTime();
        setInterval(updateTime, 10000);
    }
     
    // Arama Fonksiyonu
    const searchIcon = document.getElementById('search-icon');
    const searchOverlay = document.getElementById('search-overlay');
    const closeSearch = document.getElementById('close-search');
    const searchButton = document.getElementById('search-button');
    const searchInput = document.getElementById('search-input');

    if (searchIcon) {
        searchIcon.addEventListener('click', () => {
            searchOverlay.style.display = 'flex';
            searchInput.focus();
        });

        closeSearch.addEventListener('click', () => {
            searchOverlay.style.display = 'none'; // Düzeltildi: .none yerine .display = 'none'
        });

        searchButton.addEventListener('click', performSearch);
        searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                performSearch();
            }
        });
    }

    function performSearch() {
        const query = searchInput.value.toLowerCase();
        removeHighlights(); // Önceki vurguları kaldır

        if (query) {
            const mainContent = document.querySelector('main');
            let found = false;
            if (mainContent) {
                const walk = document.createTreeWalker(mainContent, NodeFilter.SHOW_TEXT, null, false);
                let node;
                while (node = walk.nextNode()) {
                    const text = node.nodeValue;
                    const lowerText = text.toLowerCase();
                    let lastIndex = 0;
                    let newHtml = '';

                    while (lastIndex < text.length) {
                        const startIndex = lowerText.indexOf(query, lastIndex);
                        if (startIndex === -1) {
                            newHtml += text.substring(lastIndex);
                            break;
                        }

                        newHtml += text.substring(lastIndex, startIndex);
                        newHtml += `<mark class="highlight">${text.substring(startIndex, startIndex + query.length)}</mark>`;
                        lastIndex = startIndex + query.length;
                        found = true;
                    }

                    if (found) {
                        const span = document.createElement('span');
                        span.innerHTML = newHtml;
                        node.parentNode.replaceChild(span, node);
                    }
                }
            }
            if (!found) {
                alert('No results found for "' + query + '"');
            }
        }
    }

    function removeHighlights() {
        document.querySelectorAll('mark.highlight').forEach(mark => {
            const parent = mark.parentNode;
            parent.replaceChild(document.createTextNode(mark.textContent), mark);
            parent.normalize(); // Metin düğümlerini birleştir
        });
    }

    // Aktif Sayfa Linkini Belirleme
    const navLinks = document.querySelectorAll('.main-nav ul li a');
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    navLinks.forEach(link => {
        // Linkin href değerindeki dosya adını al
        const linkHrefFile = link.getAttribute('href').split('/').pop();
        if(linkHrefFile === currentPage) {
            link.classList.add('active-page');
        }
    });


    // --- BÖLÜM 2: SAYFAYA ÖZEL FONKSİYONLAR ---

    // Harita Fonksiyonu (Sadece index.html'de çalışır)
    const mapContainer = document.getElementById('partner-map');
    if (mapContainer) {
        const partnerCountries = ['Turkey', 'Italy', 'Spain', 'Morocco', 'Jordan', 'Greece'];
        const institutions = [
            { id: 1, name: 'UTAEM', country: 'Turkey', lat: 38.624890, lon: 27.044464 },
            { id: 2, name: 'UOWM', country: 'Greece', lat: 40.323113, lon: 21.791430 },
            { id: 3, name: 'CNR', country: 'Italy', lat: 43.092912, lon: 12.363602 },
            { id: 4, name: 'IRID', country: 'Italy', lat: 43.781965, lon: 11.262461 },
            { id: 5, name: 'NARC', country: 'Jordan', lat: 32.079133, lon: 35.842739 },
            { id: 6, name: 'INRA', country: 'Morocco', lat: 34.009061, lon: -6.850004 },
            { id: 7, name: 'NOVADAYS', country: 'Spain', lat: 40.487807, lon: -3.665633 },
            { id: 8, name: 'CSIC', country: 'Spain', lat: 41.387511, lon: 2.114585 },
            { id: 9, name: 'AMAYA', country: 'Spain', lat: 37.360054, lon: -6.332238 }
        ];
         
        var partnerMap = L.map('partner-map').setView([39.5, 12], 4);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 18,
            attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(partnerMap);

        fetch('https://raw.githubusercontent.com/datasets/geo-boundaries-world-110m/main/countries.geojson')
            .then(response => response.json())
            .then(data => {
                L.geoJSON(data, {
                    style: function(feature) {
                        const countryName = feature.properties.name;
                        const isPartner = partnerCountries.includes(countryName);
                        return {
                            fillColor: isPartner ? '#275317' : '#cccccc',
                            weight: isPartner ? 1.5 : 1,
                            opacity: 1,
                            color: isPartner ? '#275317' : 'white',
                            fillOpacity: isPartner ? 0.55 : 0.3
                        };
                    }
                }).addTo(partnerMap);

                institutions.forEach(inst => {
                    const iconHtml = `<div style="background:#275317;border-radius:50%;width:25px;height:25px;display:flex;align-items:center;justify-content:center;color:white;font-weight:bold;font-size:14px;border:2px solid white;box-shadow:0 2px 4px rgba(0,0,0,0.2);">${inst.id}</div>`;
                    const customIcon = L.divIcon({ html: iconHtml, className: '' });

                    L.marker([inst.lat, inst.lon], { icon: customIcon })
                        .addTo(partnerMap)
                        .bindPopup(`<b>${inst.name}</b><br>${inst.country}`);
                });
            });
    }
     
    // Kart Animasyonları
    const cards = document.querySelectorAll('.card, .pilot-card');
    if (cards.length > 0) {
        const cardObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.animation = 'fadeInUp 0.8s ease-out forwards';
                    cardObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });

        cards.forEach(card => {
            card.style.opacity = 0;
            cardObserver.observe(card);
        });
    }
});

// Animasyon için CSS anahtar kareleri
const style = document.createElement('style');
style.innerHTML = `
@keyframes fadeInUp {
    from {
        opacity: 0;
        transform: translateY(20px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}
`;
document.head.appendChild(style);
