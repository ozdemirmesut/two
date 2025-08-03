// External JS Libraries'dan gelen kütüphaneler için global değişkenler
// React ve FramerMotion, CDN'den yüklendiği için global kapsamda bulunur.
const { motion, useScroll, useTransform } = FramerMotion; // Framer Motion kütüphanesi
const { useRef } = React; // React kütüphanesi
const { createRoot } = ReactDOM; // ReactDOM kütüphanesi, React 18 için

// DOMContentLoaded event'i, tüm HTML yüklendikten sonra kodun çalışmasını garanti eder.
// Bu kısım, React dışı HTML elementleri ve Leaflet haritası gibi bileşenleri yönetir.
document.addEventListener('DOMContentLoaded', () => {

    // --- HEADER, NAVİGASYON, SAAT VE ARAMA FONKSİYONLARI ---
    const header = document.getElementById('site-header');
    const mainContent = document.querySelector('main');
    const reactRoot = document.getElementById('react-root'); // React uygulamasının render edildiği div

    // Sayfanın üst boşluğunu header'ın başlangıç yüksekliğine göre ayarlar.
    // Bu, header'ın altına React içeriğinin, onun altına da main içeriğinin düzgün yerleşmesini sağlar.
    function setMainPadding() {
        if (header && reactRoot) {
            const headerHeight = header.offsetHeight;
            // React root'un hemen üstüne header'ın yüksekliği kadar boşluk bırak
            // Böylece React içeriği header'ın altından başlar.
            reactRoot.style.marginTop = `${headerHeight}px`;

            // Main içeriğinin kendi padding-top'unu sıfırlıyoruz.
            // Çünkü React root'u artık bu işi hallediyor.
            if (mainContent) {
                mainContent.style.paddingTop = `0px`;
            }
        }
    }

    // Header elementi varsa, padding ayarlarını ve scroll event'ini başlat.
    if (header) {
        setMainPadding(); // İlk yüklemede padding'i ayarla
        window.addEventListener('resize', setMainPadding); // Ekran boyutu değiştiğinde padding'i tekrar ayarla

        // Scroll olayı dinleyicisi: Sayfa aşağı kaydırıldığında header'a 'scrolled' sınıfı ekle/çıkar.
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) { // 50 pikselden fazla kaydırıldıysa
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        });
    }

    // Mevcut saat gösterimi fonksiyonu
    const timeDisplay = document.getElementById('current-time');
    if (timeDisplay) {
        function updateTime() {
            const now = new Date();
            // Türkiye için yerel saat dilimi (UTC+3) baz alınarak, istenen İngilizce formatta gösterim.
            const options = { weekday: 'long', day: '2-digit', month: 'long', hour: '2-digit', minute: '2-digit', hour12: false };
            timeDisplay.textContent = now.toLocaleDateString('en-US', options);
        }
        updateTime(); // Sayfa yüklendiğinde bir kez çalıştır
        setInterval(updateTime, 10000); // Her 10 saniyede bir güncelle
    }

    // Arama Fonksiyonu Yönetimi
    const searchIcon = document.getElementById('search-icon');
    const searchOverlay = document.getElementById('search-overlay');
    const closeSearch = document.getElementById('close-search');
    const searchButton = document.getElementById('search-button');
    const searchInput = document.getElementById('search-input');

    if (searchIcon) {
        searchIcon.addEventListener('click', () => {
            searchOverlay.style.display = 'flex'; // Arama katmanını görünür yap
            searchInput.focus(); // Input alanına odaklan
        });
        closeSearch.addEventListener('click', () => {
            searchOverlay.style.display = 'none'; // Arama katmanını gizle
        });
        searchButton.addEventListener('click', performSearch); // Arama butonuna tıklayınca arama yap
        searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') { // Enter tuşuna basınca arama yap
                performSearch();
            }
        });
    }

    // Metin İçinde Arama Yapma ve Vurgulama Fonksiyonu
    function performSearch() {
        const query = searchInput.value.toLowerCase(); // Arama sorgusunu küçük harfe çevir
        
        // Önceki vurguları kaldır
        document.querySelectorAll('mark.highlight').forEach(mark => {
            const parent = mark.parentNode;
            parent.replaceChild(document.createTextNode(mark.textContent), mark); // mark etiketini kaldır, sadece metni bırak
            parent.normalize(); // Metin düğümlerini birleştir (gereksiz boş metin düğümlerini temizler)
        });

        if (query) { // Eğer bir arama sorgusu varsa
            const searchableContent = document.querySelector('main'); // Sadece main içeriğinde ara
            let found = false; // Sonuç bulunup bulunmadığını takip et
            if (searchableContent) {
                // DOM ağacında metin düğümlerini gezmek için TreeWalker kullan
                const walk = document.createTreeWalker(searchableContent, NodeFilter.SHOW_TEXT, null, false);
                let node;
                while (node = walk.nextNode()) {
                    const text = node.nodeValue;
                    const lowerText = text.toLowerCase();
                    let lastIndex = 0;
                    let newHtml = ''; // Vurgulanmış metni oluşturmak için HTML stringi

                    // Metin içinde sorguyu ara ve vurgula
                    while (lastIndex < text.length) {
                        const startIndex = lowerText.indexOf(query, lastIndex);
                        if (startIndex === -1) {
                            newHtml += text.substring(lastIndex); // Sorgu bulunamazsa kalan metni ekle
                            break;
                        }
                        newHtml += text.substring(lastIndex, startIndex); // Sorgudan önceki metni ekle
                        newHtml += `<mark class="highlight">${text.substring(startIndex, startIndex + query.length)}</mark>`; // Vurgulu metni ekle
                        lastIndex = startIndex + query.length; // Aramayı vurgulanan kısmın sonundan devam ettir
                        found = true; // Sonuç bulundu olarak işaretle
                    }
                    if (found) { // Eğer bu metin düğümünde sonuç bulunduysa DOM'u güncelle
                        const span = document.createElement('span'); // Yeni bir span elementi oluştur
                        span.innerHTML = newHtml; // Oluşturulan HTML'i span'in içine koy
                        node.parentNode.replaceChild(span, node); // Eski metin düğümünü yeni span ile değiştir
                    }
                }
            }
            if (!found) { // Hiçbir sonuç bulunamazsa uyarı göster
                alert('No results found for "' + query + '"');
            }
        }
    }

    // Aktif Sayfa Linkini Belirleme
    const navLinks = document.querySelectorAll('.main-nav ul li a'); // Tüm navigasyon linklerini seç
    // Mevcut sayfa URL'sinden dosya adını al (örn: "index.html", "about.html")
    const currentPage = window.location.pathname.split('/').pop() || 'index.html'; 
    navLinks.forEach(link => {
        const linkHrefFile = link.getAttribute('href').split('/').pop(); // Linkin href özelliğindeki dosya adını al
        if(linkHrefFile === currentPage) { // Eğer linkin dosyası mevcut sayfayla eşleşiyorsa
            link.classList.add('active-page'); // 'active-page' sınıfını ekle (CSS ile vurgulanır)
        }
    });

    // --- INTERAKTİF HARİTA FONKSİYONU (Leaflet) ---
    const mapContainer = document.getElementById('partner-map'); // Harita div'ini seç
    if (mapContainer) { // Harita div'i varsa haritayı başlat
        const partnerCountries = ['Turkey', 'Italy', 'Spain', 'Morocco', 'Jordan', 'Greece']; // Ortak ülkeler
        const institutions = [ // Ortak kurumlar ve konumları
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
        // Haritayı başlat ve başlangıç görünümünü ayarla
        var partnerMap = L.map('partner-map').setView([39.5, 12], 4); 
        // OpenStreetMap harita katmanını ekle
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 18,
            attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(partnerMap);
        // Ülke sınırlarını GeoJSON verisinden yükle ve haritada göster
        fetch('https://raw.githubusercontent.com/datasets/geo-boundaries-world-110m/main/countries.geojson')
            .then(response => response.json())
            .then(data => {
                L.geoJSON(data, {
                    style: function(feature) {
                        const countryName = feature.properties.name;
                        const isPartner = partnerCountries.includes(countryName);
                        return { // Ortak ülkeler için yeşil, diğerleri için gri stil
                            fillColor: isPartner ? '#275317' : '#cccccc',
                            weight: isPartner ? 1.5 : 1,
                            opacity: 1,
                            color: isPartner ? '#275317' : 'white',
                            fillOpacity: isPartner ? 0.55 : 0.3
                        };
                    }
                }).addTo(partnerMap);
                // Kurumların konumlarına işaretçi (marker) ekle
                institutions.forEach(inst => {
                    // Özel ikon HTML'i
                    const iconHtml = `<div style="background:#275317;border-radius:50%;width:25px;height:25px;display:flex;align-items:center;justify-content:center;color:white;font-weight:bold;font-size:14px;border:2px solid white;box-shadow:0 2px 4px rgba(0,0,0,0.2);">${inst.id}</div>`;
                    const customIcon = L.divIcon({ html: iconHtml, className: '' });
                    // İşaretçiyi haritaya ekle ve üzerine tıklandığında bilgi penceresi aç
                    L.marker([inst.lat, inst.lon], { icon: customIcon })
                        .addTo(partnerMap)
                        .bindPopup(`<b>${inst.name}</b><br>${inst.country}`);
                });
            });
    }

    // Kart Animasyonları (fadeInUp)
    const cards = document.querySelectorAll('.card, .pilot-card'); // Tüm kartları seç
    if (cards.length > 0) {
        // Intersection Observer kullanarak kartlar viewport'a girdiğinde animasyonu tetikle
        const cardObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) { // Eğer kart görünür alana girdiyse
                    entry.target.style.animation = 'fadeInUp 0.8s ease-out forwards'; // Animasyonu uygula
                    cardObserver.unobserve(entry.target); // Animasyon bir kez uygulandıktan sonra gözlemlemeyi durdur
                }
            });
        }, { threshold: 0.1 }); // %10'u görünür olduğunda tetikle

        cards.forEach(card => {
            card.style.opacity = 0; // Başlangıçta görünmez yap
            cardObserver.observe(card); // Her kartı gözlemlemeye başla
        });
    }
});

// CSS anahtar kareleri (JavaScript ile dinamik olarak eklenir)
const style = document.createElement('style');
style.innerHTML = `@keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }`;
document.head.appendChild(style);


// ========================================================================
// REACT BİLEŞENİ (Apple Tarzı Landing Page Animasyonu)
// Bu kısım doğrudan HTML'deki <div id="react-root"></div> içine render edilir.
// ========================================================================
// React ve Framer Motion kütüphanelerinden gerekli fonksiyonları alıyoruz.
// Bunlar, yukarıdaki CDN'ler aracılığıyla global olarak tanımlanır.
const { motion, useScroll, useTransform } = FramerMotion; // Framer Motion animasyon fonksiyonları
const { useRef } = React; // React Hook'u
const { createRoot } = ReactDOM; // React 18 için kök oluşturma fonksiyonu

// Ana React bileşenimiz
const App = () => {
    // Slogan bölümü için bir referans (scroll takibi için)
    const sloganRef = useRef(null);
    // Başlık ve Parallax bölümü için bir referans (scroll takibi için)
    const titleRef = useRef(null);

    // useScroll Hook'u ile slogan bölümündeki scroll ilerlemesini (0'dan 1'e) yakalar.
    // 'start start': target element viewport'ın tepesine geldiğinde ilerleme 0.
    // 'end end': target element viewport'ın sonundan ayrıldığında ilerleme 1.
    const { scrollYProgress: sloganProgress } = useScroll({
        target: sloganRef,
        offset: ['start start', 'end end'],
    });

    // useScroll Hook'u ile başlık bölümündeki scroll ilerlemesini yakalar.
    const { scrollYProgress: titleProgress } = useScroll({
        target: titleRef,
        offset: ['start start', 'end end'],
    });

    // Sloganların opacity (şeffaflık) animasyonları
    // useTransform, bir scroll ilerlemesi aralığını (ilk dizi) başka bir değer aralığına (ikinci dizi) dönüştürür.
    // Örnek: slogan1Opacity, sloganProgress 0'dan 0.25'e giderken 1'de kalır, 0.25'ten 0.30'a giderken 0'a düşer.
    const slogan1Opacity = useTransform(sloganProgress, [0, 0.25, 0.30], [1, 1, 0]);
    const slogan2Opacity = useTransform(sloganProgress, [0.25, 0.30, 0.50, 0.55], [0, 1, 1, 0]);
    const slogan3Opacity = useTransform(sloganProgress, [0.50, 0.55, 0.75, 0.80], [0, 1, 1, 0]);
    const slogan4Opacity = useTransform(sloganProgress, [0.75, 0.80, 1], [0, 1, 1]);

    // Başlık ve arka plan parallax animasyonları
    // mainTitleScale: titleProgress 0'dan 0.3'e giderken ölçeği 1'den 0.5'e düşür.
    const mainTitleScale = useTransform(titleProgress, [0, 0.3], [1, 0.5]);
    // mainTitleY: titleProgress 0'dan 0.3'e giderken dikey pozisyonu 0'dan -100'e (yukarı) kaydır.
    const mainTitleY = useTransform(titleProgress, [0, 0.3], [0, -100]); 
    
    // subTitleScale: titleProgress 0'dan 0.3'e giderken ölçeği 1'den 0.8'e düşür.
    const subTitleScale = useTransform(titleProgress, [0, 0.3], [1, 0.8]);
    // subTitleY: titleProgress 0'dan 0.3'e giderken dikey pozisyonu 0'dan -70'e (yukarı) kaydır.
    const subTitleY = useTransform(titleProgress, [0, 0.3], [0, -70]); 
    
    // bg2Scale: titleProgress 0'dan 0.8'e giderken ölçeği 1'den 1.2'ye büyüt.
    const bg2Scale = useTransform(titleProgress, [0, 0.8], [1, 1.2]); 
    // bg2Opacity: titleProgress 0.7'den 0.8'e giderken şeffaflığı 1'den 0'a düşür (kaybolur).
    const bg2Opacity = useTransform(titleProgress, [0.7, 0.8], [1, 0]); 
    
    // bg1Scale: titleProgress 0.8'den 1'e giderken ölçeği 1'den 1.2'ye büyüt.
    const bg1Scale = useTransform(titleProgress, [0.8, 1], [1, 1.2]); 
    // bg1Opacity: titleProgress 0.8'den 1'e giderken şeffaflığı 0'dan 1'e yükselt (belirginleşir).
    const bg1Opacity = useTransform(titleProgress, [0.8, 1], [0, 1]); 

    // Tekrarlanan slogan bileşeni (React Component)
    const SloganComponent = ({ text, opacity }) => (
        <motion.h1 
            style={{ opacity }} /* Framer Motion ile opacity kontrolü */
            // Tailwind CSS sınıfları (bu sınıflar tarayıcıda Tailwind CDN tarafından işlenir)
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center text-4xl sm:text-5xl md:text-6xl font-bold max-w-5xl px-4"
        >
            {text}
        </motion.h1>
    );

    return (
        // Sayfanın genel stilini belirleyen ana div (Tailwind antialiased sınıfı)
        <div className="antialiased">
            {/* Sloganlar Bölümü: 400vh yüksekliği, sloganlar arası geçiş için yeterli scroll alanı sağlar */}
            <div ref={sloganRef} className="relative h-[400vh]">
                <SloganComponent text="Building climate resilience in the Mediterranean together—with nature-based solutions." opacity={slogan1Opacity} />
                <SloganComponent text="Delivering region-specific, replicable, and scalable models." opacity={slogan2Opacity} />
                <SloganComponent text="A data-driven, participatory, and sustainable transformation." opacity={slogan3Opacity} />
                <SloganComponent text="Accessible digital tools—for everyone from farmers to policymakers." opacity={slogan4Opacity} />
            </div>
            {/* Başlık ve Parallax Efektleri Bölümü: 200vh yüksekliği, animasyonlar için scroll alanı sağlar */}
            <div ref={titleRef} className="h-[200vh] relative">
                {/* sticky-container: Başlık bloğunun scroll sırasında ekranın üstüne yapışmasını sağlar */}
                <div className="sticky-container">
                    {/* Arka plan 2 görseli için motion div */}
                    <motion.div 
                        style={{ scale: bg2Scale, opacity: bg2Opacity, backgroundImage: "url('https://raw.githubusercontent.com/ozdemirmesut/two/626b9089d56db32c2f2c18a1eb4bca6b24a6eb8d/image/background_2.png')" }} 
                        className="absolute inset-0 z-0 bg-cover bg-center"
                    />
                    {/* Arka plan 1 görseli için motion div */}
                    <motion.div 
                        style={{ scale: bg1Scale, opacity: bg1Opacity, backgroundImage: "url('https://raw.githubusercontent.com/ozdemirmesut/two/626b9089d56db32c2f2c18a1eb4bca6b24a6eb8d/image/background_1.png')" }} 
                        className="absolute inset-0 z-10 bg-cover bg-center"
                    />
                    {/* INCREASE4MED başlığı ve tam adı bloğu */}
                    <div className="relative z-20 text-center flex flex-col items-center">
                        <motion.h2 
                            style={{ scale: mainTitleScale, y: mainTitleY }} 
                            className="text-6xl md:text-8xl lg:text-9xl font-extrabold mb-4 text-white drop-shadow-lg"
                        >
                            INCREASE4MED
                        </motion.h2>
                        <motion.p 
                            style={{ scale: subTitleScale, y: subTitleY }} 
                            className="text-lg md:text-xl lg:text-2xl font-light text-white drop-shadow-lg max-w-4xl px-4"
                        >
                            INtegrated Catchment-scale REsilience and Naturebased solutions<br />
                            for Scaling up Environmental solutions FOR the MEDiterranean
                        </motion.p>
                    </div>
                </div>
            );
        };
        // React uygulamasını 'react-root' ID'li div'e render et
        const container = document.getElementById('react-root');
        const root = createRoot(container);
        root.render(<App />);
    </script>
</body>
</html>
