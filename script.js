/* ===== CUSTOM CURSOR ===== */
class CustomCursor {
  constructor() {
    this.cursor = document.getElementById('customCursor');
    this.cursorText = this.cursor.querySelector('.cursor-text');
    this.isVisible = false;
    this.currentText = '';
    
    this.init();
  }
  
  init() {
    // Hide cursor on touch devices
    if ('ontouchstart' in window || navigator.maxTouchPoints) {
      this.cursor.style.display = 'none';
      return;
    }
    
    // Show cursor when mouse moves
    document.addEventListener('mousemove', (e) => {
      if (!this.isVisible) {
        this.cursor.style.opacity = '1';
        this.isVisible = true;
      }
      
      this.cursor.style.left = e.clientX + 'px';
      this.cursor.style.top = e.clientY + 'px';
      
      // Update cursor text based on current position
      this.updateCursorText(e);
    });
    
    // Hide cursor when leaving window
    document.addEventListener('mouseleave', () => {
      this.cursor.style.opacity = '0';
      this.isVisible = false;
      this.hideText();
    });
    
    // Setup event listeners for interactive elements
    this.setupInteractiveElements();
  }
  
  setupInteractiveElements() {
    // Hapus semua event listener untuk [CLICK]
    // Hanya pertahankan untuk elemen yang perlu [NEXT]
    
    // Untuk video background - tampilkan [NEXT]
    const videoBackground = document.querySelector('.video-background');
    if (videoBackground) {
      videoBackground.addEventListener('mouseenter', () => {
        this.showNextText();
      });
      
      videoBackground.addEventListener('mouseleave', () => {
        this.hideText();
      });
    }
    
    // Untuk elemen interaktif lainnya - tidak ada teks
    const interactiveElements = [
      '.info-btn',
      '.info-overlay-close',
      '.social-btn',
      '.band-item',
      '.year-btn',
      '.timeline-btn',
      '.header-tagline',
      '.music-control-btn',
      '.video-toggle',
      'select',
      '.video-select',
      '.close-struk'
    ];
    
    interactiveElements.forEach(selector => {
      const elements = document.querySelectorAll(selector);
      elements.forEach(element => {
        element.addEventListener('mouseenter', () => {
          this.hideText();
        });
        
        element.addEventListener('mouseleave', () => {
          setTimeout(() => this.checkCurrentPosition(), 10);
        });
      });
    });
  }
  
  updateCursorText(e) {
    // Jika info overlay aktif, sembunyikan semua teks
    const infoOverlay = document.getElementById('infoOverlay');
    const dropMomentStruk = document.getElementById('dropMomentStruk');
    const microMomentStruk = document.getElementById('microMomentStruk');
    
    if ((infoOverlay && infoOverlay.classList.contains('active')) || 
        (dropMomentStruk && dropMomentStruk.classList.contains('active')) ||
        (microMomentStruk && microMomentStruk.classList.contains('active'))) {
      this.hideText();
      return;
    }
    
    // Cek jika berada di video background untuk menampilkan [NEXT]
    if (this.isOverVideoBackground(e.clientX, e.clientY)) {
      this.showNextText();
    } else {
      this.hideText();
    }
  }
  
  isOverVideoBackground(x, y) {
    const videoBackground = document.querySelector('.video-background');
    if (!videoBackground) return false;
    
    const rect = videoBackground.getBoundingClientRect();
    return (
      x >= rect.left &&
      x <= rect.right &&
      y >= rect.top &&
      y <= rect.bottom
    );
  }
  
  checkCurrentPosition() {
    // Get current mouse position and update cursor
    const mouseEvent = new MouseEvent('mousemove', {
      bubbles: true,
      cancelable: true,
      clientX: this.cursor.offsetLeft,
      clientY: this.cursor.offsetTop
    });
    document.dispatchEvent(mouseEvent);
  }
  
  showNextText() {
    if (this.currentText !== '') {
      this.cursorText.textContent = '';
      this.cursorText.setAttribute('data-type', 'next');
      this.cursorText.classList.add('show');
      this.currentText = '';
    }
  }
  
  hideText() {
    this.cursorText.classList.remove('show');
    this.cursorText.removeAttribute('data-type');
    this.currentText = '';
  }
}

/* ===== TRACKPAD FIXED SCROLL ===== */
function enableStrukScroll() {
  const strukContainer = document.querySelector('.struk-infinite-container');
  
  if (!strukContainer) {
    console.error('Scroll container not found!');
    return;
  }

  console.log('Enabling trackpad scroll...');

  // Pastikan container bisa scroll
  strukContainer.style.overflow = 'auto';
  strukContainer.style.cursor = 'grab';

  // TRACKPAD & MOUSE WHEEL - Handle semua jenis wheel event
  strukContainer.addEventListener('wheel', (e) => {
    e.preventDefault();
    
    // Faktor kecepatan berdasarkan deltaMode
    let speedX = e.deltaX;
    let speedY = e.deltaY;
    
    // Adjust speed untuk trackpad (deltaMode = 0) vs mouse wheel (deltaMode = 1)
    if (e.deltaMode === 0) {
      // Trackpad - pixels, kurangi speed
      speedX *= 0.8;
      speedY *= 0.8;
    } else {
      // Mouse wheel - lines, tingkatkan speed
      speedX *= 30;
      speedY *= 30;
    }
    
    console.log('Wheel event:', {
      deltaX: e.deltaX,
      deltaY: e.deltaY,
      deltaMode: e.deltaMode,
      adjustedX: speedX,
      adjustedY: speedY
    });
    
    strukContainer.scrollBy({
      left: speedX,
      top: speedY,
      behavior: 'smooth'
    });
  }, { passive: false });

  // DRAG SCROLL untuk trackpad yang tidak trigger wheel event
  let isDragging = false;
  let startX, startY, scrollLeft, scrollTop;

  strukContainer.addEventListener('mousedown', (e) => {
    // Jangan trigger drag jika klik pada struk item
    if (e.target.closest('.struk-item-transparent')) return;
    
    isDragging = true;
    startX = e.pageX - strukContainer.offsetLeft;
    startY = e.pageY - strukContainer.offsetTop;
    scrollLeft = strukContainer.scrollLeft;
    scrollTop = strukContainer.scrollTop;
    strukContainer.style.cursor = 'grabbing';
    e.preventDefault();
  });

  document.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    
    e.preventDefault();
    const x = e.pageX - strukContainer.offsetLeft;
    const y = e.pageY - strukContainer.offsetTop;
    
    const walkX = (x - startX) * 2; // Scroll speed
    const walkY = (y - startY) * 2;
    
    strukContainer.scrollLeft = scrollLeft - walkX;
    strukContainer.scrollTop = scrollTop - walkY;
  });

  document.addEventListener('mouseup', () => {
    isDragging = false;
    strukContainer.style.cursor = 'grab';
  });

  // TOUCH SUPPORT untuk laptop dengan touchscreen
  strukContainer.addEventListener('touchstart', (e) => {
    const touch = e.touches[0];
    startX = touch.clientX;
    startY = touch.clientY;
    scrollLeft = strukContainer.scrollLeft;
    scrollTop = strukContainer.scrollTop;
    isDragging = true;
  }, { passive: true });

  strukContainer.addEventListener('touchmove', (e) => {
    if (!isDragging) return;
    
    e.preventDefault();
    const touch = e.touches[0];
    const x = touch.clientX;
    const y = touch.clientY;
    
    const walkX = (x - startX) * 2;
    const walkY = (y - startY) * 2;
    
    strukContainer.scrollLeft = scrollLeft - walkX;
    strukContainer.scrollTop = scrollTop - walkY;
    
    // Update position untuk continuous drag
    startX = x;
    startY = y;
    scrollLeft = strukContainer.scrollLeft;
    scrollTop = strukContainer.scrollTop;
  }, { passive: false });

  strukContainer.addEventListener('touchend', () => {
    isDragging = false;
  });

  console.log('Trackpad scroll enabled successfully');
}

// Inisialisasi efek ketika DOM siap
document.addEventListener('DOMContentLoaded', () => {
  // Inisialisasi custom cursor
  const customCursor = new CustomCursor();
  
  // Simpan reference untuk akses dari console jika diperlukan
  window.customCursor = customCursor;

  /* ELEMENTS */
  const dropBtn = document.getElementById('dropMomentBtn');
  const timeline = document.getElementById('timelinePopup');
  const timelineLine = timeline.querySelector('.timeline-line');
  const timelineItems = timeline.querySelectorAll('.timeline-btn');

  const dateText = document.getElementById('dateText');
  const timeText = document.getElementById('timeText');

  const infoBtn = document.getElementById('infoBtn');
  const infoPanel = document.getElementById('infoPanel');
  const closeInfo = document.getElementById('closeInfo');

  const datetime = document.getElementById('datetime');

  /* DROP MOMENT STRUK ELEMENTS */
  const dropMomentStruk = document.getElementById('dropMomentStruk');
  const closeStruk = document.getElementById('closeStruk');
  const strukGrid = document.querySelector('.struk-grid');

  /* MICRO MOMENT STRUK ELEMENTS */
  const microMomentStruk = document.getElementById('microMomentStruk');

  /* INFO OVERLAY ELEMENTS */
  const infoOverlay = document.getElementById('infoOverlay');
  const infoOverlayClose = document.getElementById('infoOverlayClose');
  const zigzagRows = document.querySelectorAll('.zigzag-row');
  const mainTitle = document.getElementById('mainTitle');
  const typingText = mainTitle.querySelector('.typing-text');
  const bandList = document.getElementById('bandList');
  const bandImageContainer = document.getElementById('bandImageContainer');
  const bandGifBackground = document.getElementById('bandGifBackground');

  /* VIDEO BACKGROUND ELEMENTS */
  const bgVideo = document.getElementById('bgVideo');
  const videoToggle = document.getElementById('videoToggle');
  const videoSelect = document.getElementById('videoSelect');
  const videoTitle = document.getElementById('videoTitle');
  const nextVideoCursor = document.getElementById('nextVideoCursor');

  /* MUSIC PLAYER ELEMENTS */
  const musicBtnCenter = document.getElementById('musicBtnCenter');
  const nextMusicBtn = document.getElementById('nextMusicBtn');
  const trackTitle = document.getElementById('trackTitle');
  const bgMusic = document.getElementById('bgMusic');

  /* MUSIC PLAYLIST */
  const playlist = [
    "JINGLE RNB ALTERNATIVE STAGE 2025",
    "ALTERNATIVE STAGE ANTHEM 2024", 
    "MICRO MOMENT BEATS 2023",
    "PESTAPORA THEME 2025",
    "ELECTRONIC WAVES"
  ];

  /* VIDEO PLAYLIST */
  const videoPlaylist = [
    { src: "VID/MAS2025.mp4", title: "ALTERNATIVE STAGE 2025" },
    { src: "VID/MAS2024.mp4", title: "ALTERNATIVE STAGE 2024" },
    { src: "VID/MAS2024PT1.mp4", title: "ALTERNATIVE STAGE 2024 [MIDNIGHT TAKEOVER]" },
    { src: "VID/MAS2024PT2.mp4", title: "ALTERNATIVE STAGE 2024" },
    { src: "VID/MAS2023.mp4", title: "ALTERNATIVE STAGE 2023" }
  ];

  /* DROP MOMENT STRUK DATA */
  const strukData = [
    { icon: '🎵', title: 'BACKSTAGE PASS', desc: 'Exclusive behind the scenes access' },
    { icon: '🎸', title: 'SOUND CHECK', desc: 'Witness the pre-show preparations' },
    { icon: '📸', title: 'PHOTO MOMENT', desc: 'Capture the perfect stage shot' },
    { icon: '🎤', title: 'VOCAL WARMUP', desc: 'Hear the artists prepare their voices' },
    { icon: '🎛️', title: 'MIXING BOARD', desc: 'See the sound engineering magic' },
    { icon: '💫', title: 'STAGE SETUP', desc: 'Watch the stage come to life' },
    { icon: '🎭', title: 'ARTIST PREP', desc: 'Get ready with the performers' },
    { icon: '🎪', title: 'VENUE TOUR', desc: 'Explore the concert location' }
  ];

  /* MICRO MOMENT STRUK DATA - PNG VERSION */
  const microMomentData = [
    { 
      image: 'struk/backstage.png', 
      title: 'BACKSTAGE PASS', 
      width: 280,
      height: 160
    },
    { 
      image: 'struk/soundcheck.png', 
      title: 'SOUND CHECK', 
      width: 260,
      height: 150
    },
    { 
      image: 'struk/photomoment.png', 
      title: 'PHOTO MOMENT', 
      width: 270,
      height: 155
    },
    { 
      image: 'struk/vocalwarmup.png', 
      title: 'VOCAL WARMUP', 
      width: 290,
      height: 165
    },
    { 
      image: 'struk/mixingboard.png', 
      title: 'MIXING BOARD', 
      width: 275,
      height: 158
    },
    { 
      image: 'struk/stagesetup.png', 
      title: 'STAGE SETUP', 
      width: 285,
      height: 162
    },
    { 
      image: 'struk/artistprep.png', 
      title: 'ARTIST PREP', 
      width: 265,
      height: 152
    },
    { 
      image: 'struk/venuetour.png', 
      title: 'VENUE TOUR', 
      width: 295,
      height: 168
    },
    { 
      image: 'struk/merchandise.png', 
      title: 'MERCHANDISE', 
      width: 275,
      height: 160
    },
    { 
      image: 'struk/struk 1.png', 
      title: 'CROWD MOMENT', 
      width: 285,
      height: 158
    },
    { 
      image: 'struk/struk 2.png', 
      title: 'LIGHT SHOW', 
      width: 270,
      height: 155
    },
    { 
      image: 'struk/struk 3.png', 
      title: 'AFTER PARTY', 
      width: 290,
      height: 165
    },
    { 
      image: 'struk/struk 4.png', 
      title: 'BACKSTAGE TEAM', 
      width: 280,
      height: 162
    },
    { 
      image: 'struk/struk 5.png', 
      title: 'INSTRUMENTS', 
      width: 265,
      height: 152
    },
    { 
      image: 'struk/struk 6.png', 
      title: 'SPECIAL GUEST', 
      width: 295,
      height: 170
    },
    { 
      image: 'struk/struk 7.png', 
      title: 'ENCORE', 
      width: 275,
      height: 158
    }
  ];

  /* BAND DATA PER TAHUN */
  const bandData = {
    '2025': {
      bands: [
        { name: 'BLEACH', image: 'BLEACH.jpg', youtube: 'https://www.youtube.com/results?search_query=BLEACH+band', gif: 'BLEACH.gif' },
        { name: 'BLEU HOUSE', image: 'BLEUHOUSE.jpg', youtube: 'https://www.youtube.com/results?search_query=BLEUHOUSE+band', gif: 'BLEUHOUSE.gif' },
        { name: 'CAL', image: 'CAL.png', youtube: 'https://www.youtube.com/results?search_query=CAL+band', gif: 'CAL.gif' },
        { name: 'DONGKER', image: 'DONGKER.jpg', youtube: 'https://www.youtube.com/results?search_query=DONGKER+band', gif: 'DONGKER.gif' },
        { name: 'ELKARMOYA', image: 'ELKARMOYA.jpg', youtube: 'https://www.youtube.com/results?search_query=ELKARMOYA+band', gif: 'ELKARMOYA.gif' },
        { name: 'EAZZ', image: 'EAZZ.jpg', youtube: 'https://www.youtube.com/results?search_query=EAZZ+band', gif: 'gifs/EAZZ.gif' },
        { name: 'HEALS', image: 'HEALS.webp', youtube: 'https://www.youtube.com/results?search_query=HEALS+band', gif: 'HEALS.gif' },
        { name: 'HOCKEY HOOK', image: 'HOCKEY HOOK.jpg', youtube: 'https://www.youtube.com/results?search_query=HOCKEY+HOOK+band', gif: 'HOCKEY_HOOK.gif' },
        { name: 'LEIPZIG', image: 'LEIPZIG.jpg', youtube: 'https://www.youtube.com/results?search_query=LEIPZIG+band', gif: 'LEIPZIG.gif' },
        { name: 'LIZZIE', image: 'LIZZIE.jpg', youtube: 'https://www.youtube.com/results?search_query=LIZZIE+band', gif: 'gifs/LIZZIE.gif' },
        { name: 'MICROGRAM X BERTINDER', image: 'MICROGRAM X BERTINDER.jpg', youtube: 'https://www.youtube.com/results?search_query=MICROGRAM+X+BERTINDER', gif: 'MICROGRAM_X_BERTINDER.gif' },
        { name: 'MUCHOS LIBRE', image: 'MUCHOS LIBRE.jpg', youtube: 'https://www.youtube.com/results?search_query=MUCHOS+LIBRE+band', gif: 'MUCHOS_LIBRE.gif' },
        { name: 'MUNDAE', image: 'MUNDAE.jpeg', youtube: 'https://www.youtube.com/results?search_query=MUNDAE+band', gif: 'gifs/MUNDAE.gif' },
        { name: 'OSCAR LOLANG', image: 'OSCAR LOLANG.jpg', youtube: 'https://www.youtube.com/results?search_query=OSCAR+LOLANG+band', gif: 'OSCAR_LOLANG.gif' },
        { name: 'PREJUDIZE', image: 'PREJUDIZE.jpeg', youtube: 'https://www.youtube.com/results?search_query=PREJUDIZE+band', gif: 'gifs/PREJUDIZE.gif' },
        { name: 'RAY VIERA LAXMANA', image: 'RAY VIERA LAXMANA.png', youtube: 'https://www.youtube.com/results?search_query=RAY+VIERA+LAXMANA+band', gif: 'RAY_VIERA_LAXMANA.gif' },
        { name: 'SATURDAY NIGHT KARAOKE', image: 'SATURDAY NIGHT KARAOKE.jpg', youtube: 'https://www.youtube.com/results?search_query=SATURDAY+NIGHT+KARAOKE+band', gif: 'SATURDAY_NIGHT_KARAOKE.gif' },
        { name: 'SUNBATH', image: 'SUNBATH.jpeg', youtube: 'https://www.youtube.com/results?search_query=SUNBATH+band', gif: 'gifs/SUNBATH.gif' },
        { name: 'SWARM', image: 'SWARM.jpg', youtube: 'https://www.youtube.com/results?search_query=SWARM+band', gif: 'gifs/SWARM.gif' },
        { name: 'SYMPHONY POLYPHONIC', image: 'SYMPHONY POLYPHONIC.jpg', youtube: 'https://www.youtube.com/results?search_query=SYMPHONY+POLYPHONIC+band', gif: 'SYMPHONY_POLYPHONIC.gif' },
        { name: 'GENG', image: 'GENG.jpg', youtube: 'https://www.youtube.com/results?search_query=GENG+band', gif: 'gifs/GENG.gif' },
        { name: 'THE COUCH CLUB', image: 'THE COUCH CLUB.jpeg', youtube: 'https://www.youtube.com/results?search_query=THE+COUCH+CLUB+band', gif: 'THE_COUCH_CLUB.gif' },
        { name: 'THE SUGAR SPUN', image: 'THE SUGAR SPUN.webp', youtube: 'https://www.youtube.com/results?search_query=THE+SUGAR+SPUN+band', gif: 'THE_SUGAR_SPUN.gif' },
        { name: 'WHITE CHORUS', image: 'White chorus.jpg', youtube: 'https://www.youtube.com/results?search_query=White+Chorus+band', gif: 'WHITE_CHORUS.gif' }
      ]
    },
    '2024': {
      bands: [
        { name: 'BIN IDRIS', image: 'BIN IDRIS.jpg', youtube: 'https://www.youtube.com/watch?v=rjgRFwz_uNs', gif: 'BIN_IDRIS.gif' },
        { name: 'DZUL FAHMI', image: 'DZULFAHMI.jpg', youtube: 'https://www.youtube.com/watch?v=5IpwcWk67fA', gif: 'DZUL_FAHMI.gif' },
        { name: 'EASTCAPE', image: 'EASTCAPE.png', youtube: 'https://www.youtube.com/watch?v=92XtSnzxAQ8', gif: 'EASTCAPE.gif' },
        { name: 'HONEY', image: 'HONEY.png', youtube: 'https://www.youtube.com/watch?v=qEMKOja2sTg', gif: 'HONEY.gif' },
        { name: 'IHCOD AGEDAS', image: 'IHCOD AGEDAS.jpg', youtube: 'https://www.youtube.com/watch?v=vLTU-xylMYk', gif: 'IHCOD_AGEDAS.gif' },
        { name: 'KAPSUL', image: 'KAPSUL.png', youtube: 'https://www.youtube.com/watch?v=bb-eljh7DME', gif: 'KAPSUL.gif' },
        { name: 'MATIASU', image: 'MATIASU.jpeg', youtube: 'https://www.youtube.com/watch?v=NU49QRjoKfo', gif: 'MATIASU.gif' },
        { name: 'TEXPACK', image: 'TEXPACK.jpg', youtube: 'https://www.youtube.com/watch?v=Cz19EEOngW8', gif: 'TEXPACK.gif' },
        { name: 'THE COUCH CLUB', image: 'THE COUCH CLUB.jpeg', youtube: 'https://www.youtube.com/watch?v=yFW2-_hmZlI', gif: 'THE_COUCH_CLUB.gif' },
        { name: 'PORIS FEAT. WIGIGO', image: 'PORIS.jpeg', youtube: 'https://www.youtube.com/watch?v=hbOTOP0FbsE', gif: 'PORIS.gif' },
        { name: 'BUBBLEGUM CORE', image: 'BUBBLEGUM CORE.jpg', youtube: 'https://www.youtube.com/watch?v=Q9WPPQf3XEg', gif: 'BUBBLEGUM_CORE.gif' },
        { name: 'DREANE', image: 'DREANE.jpg', youtube: 'https://www.youtube.com/watch?v=NkAN7FBLSBM', gif: 'DREANE.gif' },
        { name: 'DRIZZLY', image: 'DRIZZLY.jpg', youtube: 'https://www.youtube.com/watch?v=PgvEzWBhfKo', gif: 'DRIZZLY.gif' },
        { name: 'HE3X', image: 'HE3X.jpg', youtube: 'https://www.youtube.com/watch?v=PgvEzWBhfKo', gif: 'HE3X.gif' },
        { name: 'MENTARI NOVEL', image: 'MENTARI NOVEL.jpeg', youtube: 'https://www.youtube.com/watch?v=6HynXxfZYJw', gif: 'MENTARI_NOVEL.gif' },
        { name: 'PRECIOUS BLOOM', image: 'PRECIOUS BLOOM.jpg', youtube: 'https://www.youtube.com/watch?v=Gp4MDFJTASs', gif: 'PRECIOUS_BLOOM.gif' },
        { name: 'STARDUCC', image: 'STARDUCC.jpg', youtube: 'https://www.youtube.com/watch?v=dRWENS3s5yY', gif: 'STARDUCC.gif' },
        { name: 'THE CAROLINE\'S', image: 'THE CAROLINE.png', youtube: 'https://www.youtube.com/watch?v=L8td-O6icpE', gif: 'THE_CAROLINES.gif' },
        { name: 'THE COTTONS', image: 'THE COTTONS.jpg', youtube: 'https://www.youtube.com/watch?v=ULGHQLyn41E', gif: 'THE_COTTONS.gif' },
        { name: 'CITO GAKSO', image: 'CITO GAKSO.jpg', youtube: 'https://www.youtube.com/watch?v=xcBUrOw1FGQ', gif: 'CITO_GAKSO.gif' },
        { name: 'DRIED CASSAVA', image: 'DRIED CASSAVA.jpg', youtube: 'https://www.youtube.com/watch?v=QG0ytYvU89I', gif: 'DRIED_CASSAVA.gif' },
        { name: 'FUZZY!', image: 'FUZZY.jpg', youtube: 'https://www.youtube.com/results?search_query=Fuzzy+band', gif: 'FUZZY.gif' },
        { name: 'GLYPH TALK', image: 'GLYPH TALK.jpeg', youtube: 'https://www.youtube.com/watch?v=IuQjfcdDFjE', gif: 'GLYPH_TALK.gif' },
        { name: 'HIGH THERAPY', image: 'HIGH THERAPY.png', youtube: 'https://www.youtube.com/watch?v=FbGOqAJB5hQ', gif: 'HIGH_THERAPY.gif' },
        { name: 'JIRAPAH', image: 'JIRAPAH.jpg', youtube: 'https://www.youtube.com/watch?v=umQy1UOFEVw', gif: 'JIRAPAH.gif' },
        { name: 'ROOMIE BOYS ALERT', image: 'ROOMIE BOYS ALERT.jpg', youtube: 'https://www.youtube.com/watch?v=E-7K6Ppnddk', gif: 'ROOMIE_BOYS_ALERT.gif' },
        { name: 'THE MILO', image: 'THE MILO.jpeg', youtube: 'https://www.youtube.com/watch?v=HX_yoAS_t7o', gif: 'THE_MILO.gif' },
        { name: 'UNDER THE BIG BRIGHT YELLOW SUN', image: 'UNDER THE BIG BRIGHT YELLOW SUN.png', youtube: 'https://www.youtube.com/watch?v=KTbKUW53h6s', gif: 'UNDER_THE_BIG_BRIGHT.gif' },
      ]
    },
    '2023': {
      bands: [
        { name: 'KANEKURO', image: 'KANEKURO.webp', youtube: 'https://www.youtube.com/results?search_query=Kanekuro', gif: 'gifs/KANEKURO.gif' },
        { name: 'RRAG', image: 'RRAG.png', youtube: 'https://www.youtube.com/results?search_query=Rrag', gif: 'gifs/RRAG.gif' },
        { name: 'ZEAL', image: 'ZEAL.webp', youtube: 'https://www.youtube.com/results?search_query=Zeal+band', gif: 'gifs/ZEAL.gif' },
        { name: 'LAIR', image: 'LAIR.jpg', youtube: 'https://www.youtube.com/results?search_query=Lair+band', gif: 'gifs/LAIR.gif' },
        { name: 'SKY SUCAHYO', image: 'SKY SUCAHYO.jpeg', youtube: 'https://www.youtube.com/results?search_query=Sky+Sucahyo', gif: 'gifs/SKY_SUCAHYO.gif' },
        { name: 'MOONGAZING AND HER', image: 'MOONGAZING AND HER.jpg', youtube: 'https://www.youtube.com/results?search_query=Moongazing+and+Her', gif: 'gifs/MOONGAZING_AND_HER.gif' },
        { name: 'SWELLOW', image: 'SWELLOW.png', youtube: 'https://www.youtube.com/results?search_query=Swellow', gif: 'gifs/SWELLOW.gif' },
        { name: 'PEONIES', image: 'PEONIES.jpeg', youtube: 'https://www.youtube.com/results?search_query=Peonies+band', gif: 'gifs/PEONIES.gif' },
        { name: 'BEDCHAMBER', image: 'BEDCHAMBER.png', youtube: 'https://www.youtube.com/results?search_query=Bedchamber', gif: 'gifs/BEDCHAMBER.gif' },
        { name: 'MILLEDENIALS', image: 'MILLEDENIALS.jpeg', youtube: 'https://www.youtube.com/results?search_query=Milledenials', gif: 'gifs/MILLEDENIALS.gif' },
        { name: 'VT-00', image: 'VT-00.jpeg', youtube: 'https://www.youtube.com/results?search_query=vt-00', gif: 'gifs/VT-00.gif' },
        { name: 'FTLFRAME', image: 'FTLFRAME.jpg', youtube: 'https://www.youtube.com/results?search_query=Ftlframe', gif: 'gifs/FTLFRAME.gif' },
        { name: 'GODPLANT', image: 'GODPLANT.jpeg', youtube: 'https://www.youtube.com/results?search_query=Godplant', gif: 'gifs/GODPLANT.gif' },
        { name: 'BRUNOBAUER', image: 'BRUNOBAUER.jpg', youtube: 'https://www.youtube.com/results?search_query=Brunobauer', gif: 'gifs/BRUNOBAUER.gif' },
        { name: 'HUMINOID', image: 'HUMINOID.jpeg', youtube: 'https://www.youtube.com/results?search_query=Huminoid', gif: 'gifs/HUMINOID.gif' },
        { name: 'REKAH', image: 'REKAH.jpg', youtube: 'https://www.youtube.com/results?search_query=Rekah', gif: 'gifs/REKAH.gif' },
        { name: 'PEACH', image: 'PEACH.jpg', youtube: 'https://www.youtube.com/results?search_query=Peach+band', gif: 'gifs/PEACH.gif' },
        { name: 'AMERTA', image: 'AMERTA.png', youtube: 'https://www.youtube.com/results?search_query=Amerta', gif: 'gifs/AMERTA.gif' },
        { name: 'CREVE, OUVERTE!', image: 'CREVE.jpg', youtube: 'https://www.youtube.com/results?search_query=Creve+Ouverte', gif: 'gifs/CREVE_OUVERTE.gif' },
        { name: 'TARRKAM', image: 'TARRKAM.jpg', youtube: 'https://www.youtube.com/results?search_query=Tarrkam', gif: 'gifs/TARRKAM.gif' },
        { name: 'DEKADENZ', image: 'DEKADENZ.jpeg', youtube: 'https://www.youtube.com/results?search_query=Dekadenz', gif: 'gifs/DEKADENZ.gif' },
        { name: 'PAGUYUBAN CROWD SURF', image: 'PAGUYUBAN CROWD SURF.jpg', youtube: 'https://www.youtube.com/results?search_query=Paguyuban+Crowd+Surf', gif: 'gifs/PAGUYUBAN_CROWD_SURF.gif' },
        { name: 'NATINSON', image: 'NATINSON.jpg', youtube: 'https://www.youtube.com/results?search_query=Natinson', gif: 'gifs/NATINSON.gif' },
        { name: 'LAMEBRAIN', image: 'LAMEBRAIN.webp', youtube: 'https://www.youtube.com/results?search_query=Lamebrain', gif: 'gifs/LAMEBRAIN.gif' },
        { name: 'GAUNG', image: 'GAUNG.webp', youtube: 'https://www.youtube.com/results?search_query=Gaung+band', gif: 'gifs/GAUNG.gif' },
        { name: 'ELKARMOYA', image: 'ELKARMOYA.jpg', youtube: 'https://www.youtube.com/results?search_query=ELKARMOYA+Mariachi', gif: 'gifs/ELKARMOYA.gif' },
        { name: 'IMPROMPTU', image: 'IMPROMPTU.jpg', youtube: 'https://www.youtube.com/results?search_query=Impromptu+band', gif: 'gifs/IMPROMPTU.gif' },
        { name: 'GIRL AND HER BADMOOD', image: 'GIRL AND HER BADMOOD.jpeg', youtube: 'https://www.youtube.com/results?search_query=Girl+and+Her+Badmood', gif: 'gifs/GIRL_AND_HER_BADMOOD.gif' },
        { name: 'FLOWR PIT', image: 'FLOWR PIT.jpg', youtube: 'https://www.youtube.com/results?search_query=Flowr+Pit', gif: 'gifs/FLOWR_PIT.gif' },
        { name: 'BEESWAX', image: 'BEESWAX.jpg', youtube: 'https://www.youtube.com/results?search_query=Beeswax+band', gif: 'gifs/BEESWAX.gif' },
        { name: 'NARTOK', image: 'NARTOK.jpeg', youtube: 'https://www.youtube.com/results?search_query=Nartok', gif: 'gifs/NARTOK.gif' },
        { name: 'MAMANG KESBOR', image: 'MAMANG KESBOR.jpeg', youtube: 'https://www.youtube.com/results?search_query=Mamang+Kesbor', gif: 'gifs/MAMANG_KESBOR.gif' },
        { name: 'SALON RNB', image: 'SALON RNB.png', youtube: 'https://www.youtube.com/results?search_query=Salon+RnB', gif: 'gifs/SALON_RNB.gif' }
      ]
    },
    '2022': {
      bands: [
        { name: 'BLEACH', image: 'BLEACH.jpg', youtube: 'https://www.youtube.com/results?search_query=BLEACH+band', gif: 'gifs/BLEACH.gif' },
        { name: 'BLEU HOUSE', image: 'BLEUHOUSE.jpg', youtube: 'https://www.youtube.com/results?search_query=BLEUHOUSE+band', gif: 'gifs/BLEUHOUSE.gif' },
        { name: 'CAL', image: 'CAL.png', youtube: 'https://www.youtube.com/results?search_query=CAL+band', gif: 'gifs/CAL.gif' },
        { name: 'DONGKER X KINDER BLOOMEN', image: 'DONGKER.jpg', youtube: 'https://www.youtube.com/results?search_query=DONGKER+KINDER+BLOOMEN', gif: 'gifs/DONGKER.gif' },
        { name: 'ELKARMOYA (LATIN GOES POP)', image: 'ELKARMOYA.jpg', youtube: 'https://www.youtube.com/results?search_query=ELKARMOYA+LATIN+GOES+POP', gif: 'gifs/ELKARMOYA.gif' },
        { name: 'EAZZ', image: 'EAZZ.jpg', youtube: 'https://www.youtube.com/results?search_query=EAZZ+band', gif: 'gifs/EAZZ.gif' },
        { name: 'HEALS', image: 'HEALS.webp', youtube: 'https://www.youtube.com/results?search_query=HEALS+band', gif: 'gifs/HEALS.gif' },
        { name: 'HOCKEY HOOK', image: 'HOCKEY HOOK.jpg', youtube: 'https://www.youtube.com/results?search_query=HOCKEY+HOOK+band', gif: 'gifs/HOCKEY_HOOK.gif' },
        { name: 'LEIPZIG', image: 'LEIPZIG.jpg', youtube: 'https://www.youtube.com/results?search_query=LEIPZIG+band', gif: 'gifs/LEIPZIG.gif' },
        { name: 'LIZZIE', image: 'LIZZIE.jpg', youtube: 'https://www.youtube.com/results?search_query=LIZZIE+band', gif: 'gifs/LIZZIE.gif' },
        { name: 'MICROGRAM X BERTINDER (KARAOKE LAGU CINTA)', image: 'MICROGRAM X BERTINDER.jpg', youtube: 'https://www.youtube.com/results?search_query=MICROGRAM+X+BERTINDER+KARAOKE', gif: 'gifs/MICROGRAM_X_BERTINDER.gif' },
        { name: 'MUCHOS LIBRE', image: 'UCHOS LIBRE.jpg', youtube: 'https://www.youtube.com/results?search_query=MUCHOS+LIBRE+band', gif: 'gifs/MUCHOS_LIBRE.gif' },
        { name: 'MUNDAE', image: 'MUNDAE.jpeg', youtube: 'https://www.youtube.com/results?search_query=MUNDAE+band', gif: 'gifs/MUNDAE.gif' },
        { name: 'OSCAR LOLANG (JALANI SENDIRI EP SHOWCASE)', image: 'OSCAR LOLANG.jpg', youtube: 'https://www.youtube.com/results?search_query=OSCAR+LOLANG+JALANI+SENDIRI', gif: 'gifs/OSCAR_LOLANG.gif' },
        { name: 'PREJUDIZE', image: 'PREJUDIZE.jpeg', youtube: 'https://www.youtube.com/results?search_query=PREJUDIZE+band', gif: 'gifs/PREJUDIZE.gif' },
        { name: 'RAY VIERA LAKSAMANA', image: 'RAY VIERA LAXMANA.png', youtube: 'https://www.youtube.com/results?search_query=RAY+VIERA+LAKSAMANA', gif: 'gifs/RAY_VIERA_LAXMANA.gif' },
        { name: 'SATURDAY NIGHT KARAOKE (WITH SPECIAL REVENGE MUSIC TALENT SET)', image: 'SATURDAY NIGHT KARAOKE.jpg', youtube: 'https://www.youtube.com/results?search_query=SATURDAY+NIGHT+KARAOKE+REVENGE', gif: 'gifs/SATURDAY_NIGHT_KARAOKE.gif' },
        { name: 'SUNRATH', image: 'SUNBATH.jpeg', youtube: 'https://www.youtube.com/results?search_query=SUNRATH+band', gif: 'gifs/SUNBATH.gif' },
        { name: 'SWARM', image: 'SWARM.jpg', youtube: 'https://www.youtube.com/results?search_query=SWARM+band', gif: 'gifs/SWARM.gif' },
        { name: 'SYMPHONY POLYPHONIC GENG', image: 'SYMPHONY POLYPHONIC.jpg', youtube: 'https://www.youtube.com/results?search_query=SYMPHONY+POLYPHONIC+GENG', gif: 'gifs/SYMPHONY_POLYPHONIC.gif' },
        { name: 'THE COUCH CLUB', image: 'THE COUCH CLUB.jpeg', youtube: 'https://www.youtube.com/results?search_query=THE+COUCH+CLUB+band', gif: 'gifs/THE_COUCH_CLUB.gif' },
        { name: 'THE SUGAR SPUN', image: 'THE SUGAR SPUN.webp', youtube: 'https://www.youtube.com/results?search_query=THE+SUGAR+SPUN+band', gif: 'gifs/THE_SUGAR_SPUN.gif' },
        { name: 'WHITE CHORUS', image: 'White chorus.jpg', youtube: 'https://www.youtube.com/results?search_query=White+Chorus+band', gif: 'gifs/WHITE_CHORUS.gif' }
      ]
    }
  };

  let currentTrackIndex = 0;
  let currentVideoIndex = 0;
  let playing = false;
  let isTyping = false;
  let typingInterval = null;
  let currentYear = '2023';
  let selectedBand = null;

  /* DROP MOMENT STRUK FUNCTIONS */
  function initDropMomentStruk() {
    strukData.forEach((struk, index) => {
      const strukItem = document.createElement('div');
      strukItem.className = 'struk-item';
      strukItem.innerHTML = `
        <div class="struk-icon">${struk.icon}</div>
        <div class="struk-title">${struk.title}</div>
        <div class="struk-desc">${struk.desc}</div>
      `;
      strukGrid.appendChild(strukItem);
    });
  }

  function openDropMomentStruk() {
    if (timeline.classList.contains('active')) closeTimeline();
    if (infoPanel.getAttribute('aria-hidden') === 'false') toggleInfo(false);
    if (infoOverlay.getAttribute('aria-hidden') === 'false') closeInfoOverlay();
    if (microMomentStruk.getAttribute('aria-hidden') === 'false') closeMicroMomentStruk();
    
    nextVideoCursor.classList.remove('show');
    
    dropMomentStruk.setAttribute('aria-hidden', 'false');
    setTimeout(() => {
      dropMomentStruk.classList.add('active');
    }, 10);
    
    const strukItems = document.querySelectorAll('.struk-item');
    strukItems.forEach((item, index) => {
      setTimeout(() => {
        item.classList.add('visible');
      }, index * 100);
    });
    
    setTimeout(() => {
      closeStruk.focus();
    }, 500);
  }

  function closeDropMomentStruk() {
    const strukItems = document.querySelectorAll('.struk-item');
    strukItems.forEach(item => {
      item.classList.remove('visible');
    });
    
    dropMomentStruk.classList.remove('active');
    
    setTimeout(() => {
      dropMomentStruk.setAttribute('aria-hidden', 'true');
      dropBtn.focus();
    }, 400);
  }

  /* MICRO MOMENT STRUK FUNCTIONS - IMPROVED */
  function initMicroMomentStruk() {
    const strukContainer = document.querySelector('.struk-scroll-area');
    
    if (!strukContainer) {
      console.error('Struk scroll area not found!');
      return;
    }

    strukContainer.innerHTML = '';

    microMomentData.forEach((item, index) => {
      const strukItem = document.createElement('div');
      strukItem.className = 'struk-item-transparent';
      
      const posX = Math.random() * 1200 + 50;
      const posY = Math.random() * 800 + 50;
      
      strukItem.style.width = `${item.width}px`;
      strukItem.style.height = `${item.height}px`;
      strukItem.style.left = `${posX}px`;
      strukItem.style.top = `${posY}px`;
      
      strukItem.innerHTML = `
        <img src="${item.image}" alt="${item.title}" class="struk-image-transparent"
             onerror="this.style.display='none'; this.parentElement.innerHTML='<div style=\\'width:100%;height:100%;background:rgba(255,0,124,0.1);border:1px dashed #ff007c;display:flex;align-items:center;justify-content:center;color:#ff007c;font-size:12px;\\'>${item.title}</div>'">
      `;
      
      strukItem.addEventListener('click', (e) => {
        e.stopPropagation();
        console.log('Clicked:', item.title);
      });
      
      strukContainer.appendChild(strukItem);
    });
    
    const closeOverlay = document.createElement('div');
    closeOverlay.className = 'struk-close-overlay';
    closeOverlay.addEventListener('click', closeMicroMomentStruk);
    
    const microMomentElement = document.getElementById('microMomentStruk');
    const existingOverlay = microMomentElement.querySelector('.struk-close-overlay');
    if (existingOverlay) {
      existingOverlay.remove();
    }
    microMomentElement.appendChild(closeOverlay);
    
    console.log('Micro moment struk initialized with', microMomentData.length, 'items');
  }

  function openMicroMomentStruk() {
    if (timeline.classList.contains('active')) closeTimeline();
    if (infoPanel.getAttribute('aria-hidden') === 'false') toggleInfo(false);
    if (infoOverlay.getAttribute('aria-hidden') === 'false') closeInfoOverlay();
    if (dropMomentStruk.getAttribute('aria-hidden') === 'false') closeDropMomentStruk();
    
    nextVideoCursor.classList.remove('show');
    
    const microMomentStruk = document.getElementById('microMomentStruk');
    microMomentStruk.setAttribute('aria-hidden', 'false');
    
    setTimeout(() => {
      microMomentStruk.classList.add('active');
      
      setTimeout(() => {
        enableStrukScroll();
      }, 100);
      
      const strukItems = document.querySelectorAll('.struk-item-transparent');
      strukItems.forEach((item, index) => {
        setTimeout(() => {
          item.classList.add('visible');
        }, index * 60 + 100);
      });
      
      const scrollContainer = document.querySelector('.struk-infinite-container');
      setTimeout(() => {
        if (scrollContainer) {
          scrollContainer.scrollTo({
            top: scrollContainer.scrollHeight / 4,
            left: scrollContainer.scrollWidth / 4,
            behavior: 'smooth'
          });
        }
      }, 300);

      console.log('Micro moment struk opened');
    }, 10);
  }

  function closeMicroMomentStruk() {
    const strukItems = document.querySelectorAll('.struk-item-transparent');
    
    strukItems.forEach((item, index) => {
      setTimeout(() => {
        item.classList.remove('visible');
      }, index * 20);
    });
    
    setTimeout(() => {
      const microMomentStruk = document.getElementById('microMomentStruk');
      microMomentStruk.classList.remove('active');
      
      setTimeout(() => {
        microMomentStruk.setAttribute('aria-hidden', 'true');
        dropBtn.focus();
      }, 300);
    }, strukItems.length * 20 + 100);

    console.log('Micro moment struk closed');
  }

  /* PERBAIKAN: Typewriter effect untuk mobile dan desktop */
  function initTitleTypewriter() {
    const titleText = "MICROGRAM ALTERNATIVE STAGE";
    
    function startTypingEffect() {
      if (typingInterval) {
        clearInterval(typingInterval);
      }
      
      // Reset text
      typingText.textContent = '';
      const cursor = mainTitle.querySelector('.typing-cursor');
      if (cursor) {
        cursor.style.display = 'inline';
        cursor.style.animation = 'blink 1s infinite';
      }
      
      let currentChar = 0;
      
      function typeNextChar() {
        if (currentChar < titleText.length) {
          typingText.textContent += titleText.charAt(currentChar);
          currentChar++;
        } else {
          if (cursor) {
            cursor.style.animation = 'none';
          }
          clearInterval(typingInterval);
          typingInterval = null;
        }
      }
      
      typingInterval = setInterval(typeNextChar, 50);
    }
    
    function resetTypingEffect() {
      if (typingInterval) {
        clearInterval(typingInterval);
        typingInterval = null;
      }
      typingText.textContent = '';
      const cursor = mainTitle.querySelector('.typing-cursor');
      if (cursor) {
        cursor.style.display = 'inline';
        cursor.style.animation = 'blink 1s infinite';
      }
    }
    
    // Observer untuk info overlay
    const observer = new MutationObserver(function(mutations) {
      mutations.forEach(function(mutation) {
        if (mutation.attributeName === 'class') {
          if (infoOverlay.classList.contains('active')) {
            setTimeout(() => {
              startTypingEffect();
            }, 500);
          } else {
            resetTypingEffect();
          }
        }
      });
    });
    
    observer.observe(infoOverlay, { attributes: true });
  }

  /* YEAR NAVIGATION */
  function initYearNavigation() {
    const yearButtons = document.querySelectorAll('.year-btn');
    
    yearButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        const year = e.target.getAttribute('data-year');
        changeYear(year);
      });
    });
  }

  function changeYear(year) {
    if (year === currentYear) return;
    
    document.querySelectorAll('.year-btn').forEach(btn => {
      btn.classList.remove('active');
    });
    document.querySelector(`.year-btn[data-year="${year}"]`).classList.add('active');
    
    const bandListElement = document.getElementById('bandList');
    bandListElement.classList.add('fade-out');
    
    setTimeout(() => {
      currentYear = year;
      updateBandList();
      
      setTimeout(() => {
        bandListElement.classList.remove('fade-out');
        bandListElement.classList.add('fade-in');
        
        setTimeout(() => {
          bandListElement.classList.remove('fade-in');
        }, 400);
      }, 50);
    }, 400);
  }

  /* PERBAIKAN: Update band list untuk mobile dan desktop */
  function updateBandList() {
    const bands = bandData[currentYear].bands;
    const isMobile = window.innerWidth < 768;
    
    let html = '';
    
    if (isMobile) {
      // Layout mobile: 2 kolom grid
      const midPoint = Math.ceil(bands.length / 2);
      const firstColumn = bands.slice(0, midPoint);
      const secondColumn = bands.slice(midPoint);
      
      html += '<ul class="band-column">';
      firstColumn.forEach(band => {
        html += `
          <li class="band-item" 
              data-band="${band.name}" 
              data-image="${band.image}" 
              data-youtube="${band.youtube}"
              data-gif="${band.gif}">
            ${band.name}
          </li>
        `;
      });
      html += '</ul>';
      
      html += '<ul class="band-column">';
      secondColumn.forEach(band => {
        html += `
          <li class="band-item" 
              data-band="${band.name}" 
              data-image="${band.image}" 
              data-youtube="${band.youtube}"
              data-gif="${band.gif}">
            ${band.name}
          </li>
        `;
      });
      html += '</ul>';
    } else {
      // Layout desktop: 3 kolom
      const columns = 3;
      const bandsPerColumn = Math.ceil(bands.length / columns);
      
      for (let i = 0; i < columns; i++) {
        html += '<ul class="band-column">';
        const startIndex = i * bandsPerColumn;
        const endIndex = Math.min(startIndex + bandsPerColumn, bands.length);
        
        for (let j = startIndex; j < endIndex; j++) {
          const band = bands[j];
          html += `
            <li class="band-item" 
                data-band="${band.name}" 
                data-image="${band.image}" 
                data-youtube="${band.youtube}"
                data-gif="${band.gif}">
              ${band.name}
            </li>
          `;
        }
        html += '</ul>';
      }
    }
    
    const bandListElement = document.getElementById('bandList');
    bandListElement.innerHTML = html;
    initBandHoverEffect();
  }

  /* PERBAIKAN: Band hover effect dengan support untuk touch devices */
  function initBandHoverEffect() {
    const bandItems = document.querySelectorAll('.band-item');
    const isMobile = window.innerWidth < 768;
    
    // Preload images untuk performa
    const preloadImages = {};
    Object.keys(bandData).forEach(year => {
      bandData[year].bands.forEach(band => {
        if (band.image && !preloadImages[band.image]) {
          preloadImages[band.image] = new Image();
          preloadImages[band.image].src = band.image;
        }
        if (band.gif && !preloadImages[band.gif]) {
          preloadImages[band.gif] = new Image();
          preloadImages[band.gif].src = band.gif;
        }
      });
    });
    
    let currentHoverTimeout = null;
    
    bandItems.forEach(item => {
      // Mouse events untuk desktop
      if (!isMobile) {
        item.addEventListener('mouseenter', (e) => {
          if (currentHoverTimeout) {
            clearTimeout(currentHoverTimeout);
          }
          showBandMedia(item);
        });
        
        item.addEventListener('mouseleave', () => {
          currentHoverTimeout = setTimeout(() => {
            hideBandMedia();
          }, 50);
        });
        
        item.addEventListener('click', (e) => {
          const youtubeUrl = item.getAttribute('data-youtube');
          if (youtubeUrl) {
            window.open(youtubeUrl, '_blank');
          }
        });
      } else {
        // Touch events untuk mobile
        item.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          
          // Hapus selected state dari semua band items
          bandItems.forEach(bandItem => {
            bandItem.classList.remove('selected');
          });
          
          // Tambah selected state ke band yang diklik
          item.classList.add('selected');
          
          // Tampilkan media untuk band yang dipilih
          showBandMedia(item);
          
          // Simpan band yang sedang dipilih
          selectedBand = item;
        });
      }
    });
    
    function showBandMedia(item) {
      const bandName = item.getAttribute('data-band');
      const imagePath = item.getAttribute('data-image');
      const gifPath = item.getAttribute('data-gif');
      
      // Tampilkan band image container
      bandImageContainer.classList.add('show');
      
      let bandImage = bandImageContainer.querySelector('.band-image');
      if (!bandImage) {
        bandImage = document.createElement('img');
        bandImage.className = 'band-image';
        bandImageContainer.appendChild(bandImage);
      }
      
      bandImage.src = imagePath;
      bandImage.alt = bandName.toUpperCase();
      
      const placeholder = bandImageContainer.querySelector('.band-image-placeholder');
      if (placeholder) {
        placeholder.style.display = 'none';
      }
      
      bandImage.classList.add('active');
      
      // Tampilkan band gif background
      bandGifBackground.classList.add('show');
      
      let bandGif = bandGifBackground.querySelector('.band-gif');
      if (!bandGif) {
        bandGif = document.createElement('img');
        bandGif.className = 'band-gif';
        bandGifBackground.appendChild(bandGif);
      }
      
      bandGif.src = gifPath;
      bandGif.alt = `${bandName} GIF`;
      
      const gifPlaceholder = bandGifBackground.querySelector('.band-gif-placeholder');
      if (gifPlaceholder) {
        gifPlaceholder.style.display = 'none';
      }
      
      bandGif.classList.add('active');
    }
    
    function hideBandMedia() {
      const bandImage = bandImageContainer.querySelector('.band-image');
      const placeholder = bandImageContainer.querySelector('.band-image-placeholder');
      
      if (bandImage) {
        bandImage.classList.remove('active');
      }
      
      if (placeholder) {
        placeholder.style.display = 'flex';
      }
      
      const bandGif = bandGifBackground.querySelector('.band-gif');
      const gifPlaceholder = bandGifBackground.querySelector('.band-gif-placeholder');
      
      if (bandGif) {
        bandGif.classList.remove('active');
      }
      
      if (gifPlaceholder) {
        gifPlaceholder.style.display = 'flex';
      }
      
      if (!Array.from(bandItems).some(item => item.matches(':hover'))) {
        setTimeout(() => {
          bandImageContainer.classList.remove('show');
          bandGifBackground.classList.remove('show');
        }, 300);
      }
    }
  }

  /* ZIGZAG ANIMATION FOR INFO OVERLAY */
  function initZigzagAnimations() {
    infoOverlay.addEventListener('transitionend', function(e) {
      if (e.propertyName === 'opacity' && !infoOverlay.classList.contains('active')) {
        zigzagRows.forEach(row => {
          row.classList.remove('visible');
        });
      }
    });
    
    const observer = new MutationObserver(function(mutations) {
      mutations.forEach(function(mutation) {
        if (mutation.attributeName === 'class') {
          if (infoOverlay.classList.contains('active')) {
            setTimeout(() => {
              zigzagRows.forEach((row, index) => {
                setTimeout(() => {
                  row.classList.add('visible');
                }, index * 150);
              });
            }, 100);
          } else {
            zigzagRows.forEach(row => {
              row.classList.remove('visible');
            });
          }
        }
      });
    });
    
    observer.observe(infoOverlay, { attributes: true });
  }

  /* INFO OVERLAY FUNCTIONS */
  function openInfoOverlay() {
    if (timeline.classList.contains('active')) closeTimeline();
    if (infoPanel.getAttribute('aria-hidden') === 'false') toggleInfo(false);
    if (dropMomentStruk.getAttribute('aria-hidden') === 'false') closeDropMomentStruk();
    if (microMomentStruk.getAttribute('aria-hidden') === 'false') closeMicroMomentStruk();
    
    nextVideoCursor.classList.remove('show');
    
    infoBtn.classList.add('hidden');
    
    resetOverlayState();
    
    infoOverlay.setAttribute('aria-hidden', 'false');
    setTimeout(() => {
      infoOverlay.classList.add('active');
    }, 10);
    
    setTimeout(() => {
      infoOverlayClose.focus();
    }, 500);
  }

  function closeInfoOverlay() {
    bandImageContainer.classList.remove('show');
    bandGifBackground.classList.remove('show');
    
    // Hapus selected state dari semua band items
    const bandItems = document.querySelectorAll('.band-item');
    bandItems.forEach(item => {
      item.classList.remove('selected');
    });
    
    selectedBand = null;
    
    infoOverlay.classList.remove('active');
    
    setTimeout(() => {
      infoOverlay.setAttribute('aria-hidden', 'true');
      infoBtn.classList.remove('hidden');
      infoBtn.focus();
    }, 400);
  }

  function resetOverlayState() {
    const bandImage = bandImageContainer.querySelector('.band-image');
    const placeholder = bandImageContainer.querySelector('.band-image-placeholder');
    
    if (bandImage) {
      bandImage.classList.remove('active');
    }
    
    if (placeholder) {
      placeholder.style.display = 'flex';
    }
    
    const bandGif = bandGifBackground.querySelector('.band-gif');
    const gifPlaceholder = bandGifBackground.querySelector('.band-gif-placeholder');
    
    if (bandGif) {
      bandGif.classList.remove('active');
    }
    
    if (gifPlaceholder) {
      gifPlaceholder.style.display = 'flex';
    }
  }

  /* CUSTOM CURSOR FOR NEXT VIDEO */
  function initNextVideoCursor() {
    // Hide cursor on mobile devices
    if ('ontouchstart' in window || navigator.maxTouchPoints) {
      nextVideoCursor.style.display = 'none';
      return;
    }

    const elementsToHideCursor = ['button', 'select', 'a', '.info-overlay-close', '.info-overlay-social-btn', '.close-struk'];

    document.addEventListener('mousemove', (e) => {
      if (infoOverlay.classList.contains('active') || dropMomentStruk.classList.contains('active') || microMomentStruk.classList.contains('active')) {
        nextVideoCursor.classList.remove('show');
        return;
      }
      
      let shouldShowCursor = true;
      
      elementsToHideCursor.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        elements.forEach(element => {
          if (element.contains(e.target)) {
            shouldShowCursor = false;
          }
        });
      });

      if (shouldShowCursor) {
        nextVideoCursor.style.left = `${e.clientX + 15}px`;
        nextVideoCursor.style.top = `${e.clientY + 15}px`;
        nextVideoCursor.classList.add('show');
      } else {
        nextVideoCursor.classList.remove('show');
      }
    });

    document.addEventListener('click', (e) => {
      if (infoOverlay.classList.contains('active') || dropMomentStruk.classList.contains('active') || microMomentStruk.classList.contains('active')) {
        return;
      }
      
      const videoBackground = document.querySelector('.video-background');
      const rect = videoBackground.getBoundingClientRect();
      
      if (e.clientX >= rect.left && e.clientX <= rect.right &&
          e.clientY >= rect.top && e.clientY <= rect.bottom &&
          nextVideoCursor.classList.contains('show')) {
        e.preventDefault();
        playNextVideo();
      }
    });
  }

  /* VIDEO TITLE DISPLAY */
  function showVideoTitle(title) {
    videoTitle.textContent = '';
    videoTitle.classList.add('show', 'typing');
    
    let index = 0;
    const typeInterval = setInterval(() => {
      if (index < title.length) {
        videoTitle.textContent += title.charAt(index);
        index++;
      } else {
        clearInterval(typeInterval);
        setTimeout(() => {
          videoTitle.classList.remove('typing');
        }, 1000);
      }
    }, 50);
  }

  function playNextVideo() {
    currentVideoIndex = (currentVideoIndex + 1) % videoPlaylist.length;
    const nextVideo = videoPlaylist[currentVideoIndex];
    
    bgVideo.src = nextVideo.src;
    bgVideo.load();
    bgVideo.play();
    
    videoSelect.selectedIndex = currentVideoIndex;
    showVideoTitle(nextVideo.title);
    
    videoToggle.innerHTML = '<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M2 2h4v12H2zM10 2h4v12h-4z"/></svg>';
  }

  /* MUSIC PLAYER FUNCTIONS */
  function initMusicPlayer() {
    loadTrack(currentTrackIndex);
    
    musicBtnCenter.addEventListener('click', (e) => {
      e.stopPropagation();
      togglePlayPause();
    });

    nextMusicBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      playNextTrack();
    });

    bgMusic.addEventListener('ended', () => {
      playNextTrack();
    });
  }

  function loadTrack(index) {
    currentTrackIndex = index;
    const trackName = playlist[currentTrackIndex];
    trackTitle.textContent = trackName;
    
    if (playing) {
      bgMusic.play().catch(() => {
        playing = false;
        musicBtnCenter.setAttribute('aria-pressed', 'false');
        updatePlayPauseIcon();
      });
    }
  }

  function togglePlayPause() {
    if (!playing) {
      bgMusic.play().catch(() => {
        console.log('Playback failed. User interaction might be required.');
      });
      playing = true;
      musicBtnCenter.setAttribute('aria-pressed', 'true');
      updatePlayPauseIcon();
    } else {
      bgMusic.pause();
      playing = false;
      musicBtnCenter.setAttribute('aria-pressed', 'false');
      updatePlayPauseIcon();
    }
  }

  function updatePlayPauseIcon() {
    const playIcon = musicBtnCenter.querySelector('.play-icon');
    const pauseIcon = musicBtnCenter.querySelector('.pause-icon');
    
    if (playing) {
      playIcon.style.display = 'none';
      pauseIcon.style.display = 'block';
    } else {
      playIcon.style.display = 'block';
      pauseIcon.style.display = 'none';
    }
  }

  function playNextTrack() {
    currentTrackIndex = (currentTrackIndex + 1) % playlist.length;
    loadTrack(currentTrackIndex);
    
    if (playing) {
      bgMusic.play();
    }
  }

  /* VIDEO BACKGROUND CONTROLS */
  function initVideoControls() {
    videoToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      if (bgVideo.paused) {
        bgVideo.play();
        videoToggle.innerHTML = '<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M2 2h4v12H2zM10 2h4v12h-4z"/></svg>';
      } else {
        bgVideo.pause();
        videoToggle.innerHTML = '<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M4 2v12l10-6z"/></svg>';
      }
    });

    videoSelect.addEventListener('change', (e) => {
      const newSource = e.target.value;
      currentVideoIndex = e.target.selectedIndex;
      bgVideo.src = newSource;
      bgVideo.load();
      bgVideo.play();
      videoToggle.innerHTML = '<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M2 2h4v12H2zM10 2h4v12h-4z"/></svg>';
      
      const video = videoPlaylist.find(v => v.src === newSource);
      if (video) {
        showVideoTitle(video.title);
      }
    });

    bgVideo.addEventListener('ended', () => {
      bgVideo.currentTime = 0;
      bgVideo.play();
    });
    
    setTimeout(() => {
      showVideoTitle(videoPlaylist[currentVideoIndex].title);
    }, 1000);
  }

  /* TYPEWRITER EFFECT FOR INITIAL LOAD */
  function initTypewriterEffect() {
    const textElements = document.querySelectorAll(
      '.header-tagline span, .info-btn, .info-panel h3, .info-panel p'
    );
    
    textElements.forEach(element => {
      const originalText = element.textContent;
      element.textContent = '';
      element.setAttribute('data-original-text', originalText);
      element.classList.add('typewriter-cursor');
    });
    
    setTimeout(() => typeText('.header-tagline .line1', 0), 100);
    setTimeout(() => typeText('.header-tagline .line2', 0), 400);
    setTimeout(() => typeText('.info-btn', 0), 700);
    
    setTimeout(() => {
      datetime.classList.add('loaded');
    }, 300);
  }
  
  function typeText(selector, index) {
    const element = document.querySelector(selector);
    if (!element) return;
    
    const originalText = element.getAttribute('data-original-text');
    
    if (index < originalText.length) {
      element.textContent += originalText.charAt(index);
      setTimeout(() => typeText(selector, index + 1), 30);
    } else {
      element.classList.remove('typewriter-cursor');
    }
  }

  /* TIMELINE TOGGLE */
  function openTimeline() {
    timeline.classList.add('active');
    timeline.setAttribute('aria-hidden','false');
    dropBtn.setAttribute('aria-expanded','true');
    
    timelineItems.forEach((item, index) => {
      setTimeout(() => {
        item.style.opacity = '1';
        item.style.transform = 'translateX(0)';
      }, index * 100 + 200);
    });
    
    setTimeout(() => timelineItems[0].focus(), 1000);
  }

  function closeTimeline() {
    timelineItems.forEach((item, index) => {
      setTimeout(() => {
        item.style.opacity = '0';
        item.style.transform = 'translateX(-10px)';
      }, index * 50);
    });
    
    setTimeout(() => {
      timeline.classList.remove('active');
      timeline.setAttribute('aria-hidden','true');
      dropBtn.setAttribute('aria-expanded','false');
      dropBtn.focus();
    }, timelineItems.length * 50 + 200);
  }

  /* DROP MOMENT BUTTON */
  dropBtn.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const microMomentStruk = document.getElementById('microMomentStruk');
    if (microMomentStruk.getAttribute('aria-hidden') === 'true') {
      openMicroMomentStruk();
    } else {
      closeMicroMomentStruk();
    }
  });

  document.addEventListener('click', (e) => {
    if (!timeline.contains(e.target) && !dropBtn.contains(e.target)) {
      if (timeline.classList.contains('active')) closeTimeline();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (timeline.classList.contains('active')) closeTimeline();
      if (infoPanel.getAttribute('aria-hidden') === 'false') toggleInfo(false);
      if (infoOverlay.getAttribute('aria-hidden') === 'false') closeInfoOverlay();
      if (dropMomentStruk.getAttribute('aria-hidden') === 'false') closeDropMomentStruk();
      if (microMomentStruk.getAttribute('aria-hidden') === 'false') closeMicroMomentStruk();
    }
  });

  timelineItems.forEach(btn => {
    btn.addEventListener('click', (ev) => {
      ev.stopPropagation();
      console.log('Selected:', btn.textContent);
      btn.animate([{color:'#fff'},{color:'#ff007c'},{color:'#fff'}],{duration:260});
      setTimeout(()=>closeTimeline(), 260);
    });
  });

  /* INFO TOGGLE */
  function toggleInfo(open) {
    const isOpen = infoPanel.getAttribute('aria-hidden') === 'false';
    const wantOpen = typeof open === 'boolean' ? open : !isOpen;
    if (wantOpen) {
      infoPanel.setAttribute('aria-hidden','false');
      infoBtn.setAttribute('aria-expanded','true');
      infoBtn.classList.add('active');
      
      const infoTitle = infoPanel.querySelector('h3');
      const infoParagraphs = infoPanel.querySelectorAll('p');
      
      if (infoTitle) {
        const originalTitle = infoTitle.getAttribute('data-original-text') || infoTitle.textContent;
        infoTitle.textContent = '';
        infoTitle.classList.add('typewriter-cursor');
        typeInfoText(infoTitle, originalTitle, 0);
      }
      
      infoParagraphs.forEach((p, index) => {
        setTimeout(() => {
          const originalText = p.getAttribute('data-original-text') || p.textContent;
          p.textContent = '';
          p.classList.add('typewriter-cursor');
          typeInfoText(p, originalText, 0);
        }, (index + 1) * 300);
      });
      
      closeInfo.focus();
    } else {
      infoPanel.setAttribute('aria-hidden','true');
      infoBtn.setAttribute('aria-expanded','false');
      infoBtn.classList.remove('active');
      infoBtn.focus();
    }
  }
  
  function typeInfoText(element, text, index) {
    if (index < text.length) {
      element.textContent += text.charAt(index);
      setTimeout(() => typeInfoText(element, text, index + 1), 50);
    } else {
      element.classList.remove('typewriter-cursor');
    }
  }

  /* EVENT LISTENERS */
  infoBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    openInfoOverlay();
  });

  closeInfo.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleInfo(false);
  });

  infoOverlayClose.addEventListener('click', (e) => {
    e.stopPropagation();
    closeInfoOverlay();
  });

  infoOverlay.addEventListener('click', (e) => {
    if (e.target === infoOverlay) {
      closeInfoOverlay();
    }
  });

  closeStruk.addEventListener('click', (e) => {
    e.stopPropagation();
    closeDropMomentStruk();
  });

  dropMomentStruk.addEventListener('click', (e) => {
    if (e.target === dropMomentStruk) {
      closeDropMomentStruk();
    }
  });

  document.addEventListener('click', (e) => {
    if (!infoPanel.contains(e.target) && e.target !== infoBtn) {
      if (infoPanel.getAttribute('aria-hidden') === 'false') toggleInfo(false);
    }
  });

  /* DATE & TIME */
  function two(n){ return n<10? '0'+n : String(n); }
  function updateDateTime(){
    const now = new Date();
    const months = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];
    const month = months[now.getMonth()];
    const day = now.getDate();
    const year = now.getFullYear();
    const hour = two(now.getHours());
    const min = two(now.getMinutes());
    const sec = two(now.getSeconds());

    dateText.textContent = `${month} ${day} ${year}`;
    timeText.textContent = `${hour}.${min}.${sec} | ID`;
  }
  updateDateTime();
  setInterval(updateDateTime, 1000);

  /* BLINK EFFECT */
  function initBlinkEffect() {
    const buttons = document.querySelectorAll('.info-btn, .timeline-btn, .music-control-btn, .header-tagline, .video-toggle, .social-btn, .info-overlay-close, .info-overlay-social-btn, .close-struk');
    
    buttons.forEach(button => {
      button.addEventListener('mouseenter', () => {
        button.style.animation = 'blink 0.5s infinite';
      });
      
      button.addEventListener('mouseleave', () => {
        button.style.animation = 'none';
      });
    });
  }

  // Initialize all effects
  initVideoControls();
  initMusicPlayer();
  initNextVideoCursor();
  initTypewriterEffect();
  initBlinkEffect();
  initZigzagAnimations();
  initTitleTypewriter();
  initYearNavigation();
  initDropMomentStruk();
  initMicroMomentStruk();
  updateBandList();

  // Handle window resize untuk responsive behavior
  window.addEventListener('resize', () => {
    updateBandList();
  });

  // Test function untuk debug
  window.testStrukScroll = function() {
    console.log('Testing struk scroll...');
    openMicroMomentStruk();
  };

  // Debug function untuk trackpad
  window.debugTrackpad = function() {
    const container = document.querySelector('.struk-infinite-container');
    container.addEventListener('wheel', (e) => {
      console.log('Trackpad/Wheel Event:', {
        deltaX: e.deltaX,
        deltaY: e.deltaY,
        deltaZ: e.deltaZ,
        deltaMode: e.deltaMode,
        type: e.type
      });
    }, { passive: true });
  };

  console.log('Website initialized successfully');
});

// Helper function untuk debug
function debugStrukScroll() {
  const container = document.querySelector('.struk-infinite-container');
  if (container) {
    console.log('Scroll container found:', {
      scrollWidth: container.scrollWidth,
      scrollHeight: container.scrollHeight,
      clientWidth: container.clientWidth,
      clientHeight: container.clientHeight,
      scrollable: container.scrollWidth > container.clientWidth || container.scrollHeight > container.clientHeight
    });
  } else {
    console.log('Scroll container NOT found');
  }
}
