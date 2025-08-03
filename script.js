document.addEventListener('DOMContentLoaded', () => {
    // Navigasyon linkleri ve bölümleri seç
    const navLinks = document.querySelectorAll('nav ul li a');
    const sections = document.querySelectorAll('main section');

    // Sayfa kaydırıldığında hangi bölümün göründüğünü izle
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href').substring(1) === entry.target.id) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }, { threshold: 0.5 });

    sections.forEach(section => observer.observe(section));

    // Kartlara animasyon ekle
    const cards = document.querySelectorAll('.card, .pilot-card');
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

    // --- KULLANICININ EKLEDİĞİ ORTAKLIK HARİTASI KODU ---

    // Partner ülkeler
    const partnerCountries = ['Turkey', 'Italy', 'Spain', 'Morocco', 'Jordan', 'Greece'];

    // Marker olacak kurumlar ve koordinatlar
    const institutions = [
        { id: 1, name: 'UTAEM', country: 'Turkey', lat: 38.566, lon: 27.069 },
        { id: 2, name: 'CNR', country: 'Italy', lat: 45.493, lon: 9.176 },
        { id: 3, name: 'NOVADAYS', country: 'Spain', lat: 40.505, lon: -3.670 },
        { id: 4, name: 'INRA', country: 'Morocco', lat: 34.009082042147995, lon: -6.850001865128803 },
        { id: 5, name: 'NARC', country: 'Jordan', lat: 32.079259022092096, lon: 35.842944922801024 },
        { id: 6, name: 'UOWM', country: 'Greece', lat: 40.348388337207425, lon: 21.786639498220836 },
        { id: 7, name: 'IRID', country: 'Italy', lat: 43.782131031848714, lon: 11.262421144885877 },
        { id: 8, name: 'CSIC', country: 'Spain', lat: 41.38764666141742, lon: 2.1146525013424333 },
        { id: 9, name: 'AMAYA', country: 'Spain', lat: 37.35999005361069, lon: -6.332281939967604 }
    ];

    // Haritayı başlat
    var partnerMap = L.map('partner-map').setView([39.5, 12], 4.5); // ID 'partner-map' olarak güncellendi

    // OpenStreetMap katmanı
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 18,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(partnerMap);

    // GeoJSON'dan Avrupa ve komşu ülkeleri çek ve partner ülkeleri renklendir
    fetch('https://raw.githubusercontent.com/datasets/geo-boundaries-world-110m/main/countries.geojson')
        .then(response => response.json())
        .then(data => {
            L.geoJSON(data, {
                style: function(feature) {
                    const countryName = feature.properties.name;
                    const isPartner = partnerCountries.includes(countryName);
                    return {
                        fillColor: isPartner ? '#F25C05' : '#cccccc',
                        weight: isPartner ? 1.5 : 1,
                        opacity: 1,
                        color: isPartner ? '#F25C05' : 'white',
                        fillOpacity: isPartner ? 0.45 : 0.3
                    };
                }
            }).addTo(partnerMap);

            // Marker'ları ekle (numaralı ikonlar) - GeoJSON yüklendikten sonra eklenir
            institutions.forEach(inst => {
                const iconHtml = `<div style="background:#F25C05;border-radius:50%;width:25px;height:25px;display:flex;align-items:center;justify-content:center;color:white;font-weight:bold;font-size:14px;border:2px solid white;box-shadow:0 2px 4px rgba(0,0,0,0.2);">${inst.id}</div>`;
                const customIcon = L.divIcon({ html: iconHtml, className: '' });

                L.marker([inst.lat, inst.lon], { icon: customIcon })
                    .addTo(partnerMap)
                    .bindPopup(`<b>${inst.name}</b><br>${inst.country}`);
            });
        });
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