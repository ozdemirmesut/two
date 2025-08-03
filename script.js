// React Hook'larını ve Framer Motion fonksiyonlarını global 'React' ve 'FramerMotion' objelerinden alıyoruz.
const { motion, useScroll, useTransform } = FramerMotion;
const { useRef, useEffect } = React;
const { createRoot } = ReactDOM;

// Ana React bileşenimiz
const App = () => {
    // Slogan bölümü için DOM elementine referans oluşturuyoruz.
    const sloganRef = useRef(null);
    
    // Başlık ve Parallax bölümü için DOM elementine referans oluşturuyoruz.
    const titleRef = useRef(null);

    // Slogan bölümündeki scroll ilerlemesini 0'dan 1'e kadar yakalar.
    const { scrollYProgress: sloganProgress } = useScroll({
        target: sloganRef,
        offset: ['start start', 'end end'],
    });

    // Başlık bölümündeki scroll ilerlemesini yakalar.
    const { scrollYProgress: titleProgress } = useScroll({
        target: titleRef,
        offset: ['start start', 'end end'],
    });

    // Sloganların her biri için scroll'a bağlı opacity değerlerini hesaplama
    const slogan1Opacity = useTransform(sloganProgress, [0, 0.25, 0.30], [1, 1, 0]);
    const slogan2Opacity = useTransform(sloganProgress, [0.25, 0.30, 0.50, 0.55], [0, 1, 1, 0]);
    const slogan3Opacity = useTransform(sloganProgress, [0.50, 0.55, 0.75, 0.80], [0, 1, 1, 0]);
    const slogan4Opacity = useTransform(sloganProgress, [0.75, 0.80, 1], [0, 1, 1]);

    // Başlık ve Parallax bölümü için animasyon değerleri
    const mainTitleScale = useTransform(titleProgress, [0, 0.3], [1, 0.5]);
    const mainTitleY = useTransform(titleProgress, [0, 0.3], [0, -100]); 
    const subTitleScale = useTransform(titleProgress, [0, 0.3], [1, 0.8]);
    const subTitleY = useTransform(titleProgress, [0, 0.3], [0, -70]); 
    const bg2Scale = useTransform(titleProgress, [0, 0.8], [1, 1.2]); 
    const bg2Opacity = useTransform(titleProgress, [0.7, 0.8], [1, 0]); 
    const bg1Scale = useTransform(titleProgress, [0.8, 1], [1, 1.2]); 
    const bg1Opacity = useTransform(titleProgress, [0.8, 1], [0, 1]); 

    // Tekrarlanan slogan h1 bileşeni
    const SloganComponent = ({ text, opacity }) => (
        <motion.h1
            style={{ opacity }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center text-4xl sm:text-5xl md:text-6xl font-bold max-w-5xl px-4"
        >
            {text}
        </motion.h1>
    );

    return (
        <div className="antialiased">
            {/* ========================================================================
                Bölüm 1: Sloganlar Bölümü
                ========================================================================
            */}
            <div ref={sloganRef} className="relative h-[400vh]">
                <SloganComponent text="Building climate resilience in the Mediterranean together—with nature-based solutions." opacity={slogan1Opacity} />
                <SloganComponent text="Delivering region-specific, replicable, and scalable models." opacity={slogan2Opacity} />
                <SloganComponent text="A data-driven, participatory, and sustainable transformation." opacity={slogan3Opacity} />
                <SloganComponent text="Accessible digital tools—for everyone from farmers to policymakers." opacity={slogan4Opacity} />
            </div>

            {/* ========================================================================
                Bölüm 2: Başlık ve Parallax Efektleri Bölümü
                ========================================================================
            */}
            <div ref={titleRef} className="h-[200vh] relative">
                <div className="sticky-container">
                    <motion.div
                        style={{ 
                            scale: bg2Scale, 
                            opacity: bg2Opacity, 
                            backgroundImage: "url('https://raw.githubusercontent.com/ozdemirmesut/two/626b9089d56db32c2f2c18a1eb4bca6b24a6eb8d/image/background_2.png')" 
                        }}
                        className="absolute inset-0 z-0 bg-cover bg-center"
                    />

                    <motion.div
                        style={{ 
                            scale: bg1Scale, 
                            opacity: bg1Opacity,
                            backgroundImage: "url('https://raw.githubusercontent.com/ozdemirmesut/two/626b9089d56db32c2f2c18a1eb4bca6b24a6eb8d/image/background_1.png')" 
                        }}
                        className="absolute inset-0 z-10 bg-cover bg-center"
                    />
                    
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
            </div>
        </div>
    );
};

// React uygulamasını 'react-root' ID'li div'e render et
const container = document.getElementById('react-root');
const root = createRoot(container);
root.render(<App />);
