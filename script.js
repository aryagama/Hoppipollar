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
    { src: "https://assets.microgram.id/alt-stage/videos/MAS2025.mp4", title: "ALTERNATIVE STAGE 2025" },
    { src: "https://assets.microgram.id/alt-stage/videos/MAS2024.mp4", title: "ALTERNATIVE STAGE 2024" }
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

  /* MICRO MOMENT STRUK DATA - SIMPLIFIED VERSION */
  const microMomentData = [
    { 
      title: 'BACKSTAGE PASS', 
      width: 280,
      height: 160
    },
    { 
      title: 'SOUND CHECK', 
      width: 260,
      height: 150
    },
    { 
      title: 'PHOTO MOMENT', 
      width: 270,
      height: 155
    },
    { 
      title: 'VOCAL WARMUP', 
      width: 290,
      height: 165
    },
    { 
      title: 'MIXING BOARD', 
      width: 275,
      height: 158
    },
    { 
      title: 'STAGE SETUP', 
      width: 285,
      height: 162
    },
    { 
      title: 'ARTIST PREP', 
      width: 265,
      height: 152
    },
    { 
      title: 'VENUE TOUR', 
      width: 295,
      height: 168
    }
  ];

  /* BAND DATA PER TAHUN - SIMPLIFIED */
  const bandData = {
    '2025': {
      bands: [
        { name: 'BLEACH', youtube: 'https://www.youtube.com/results?search_query=BLEACH+band' },
        { name: 'BLEU HOUSE', youtube: 'https://www.youtube.com/results?search_query=BLEUHOUSE+band' },
        { name: 'CAL', youtube: 'https://www.youtube.com/results?search_query=CAL+band' },
        { name: 'DONGKER', youtube: 'https://www.youtube.com/results?search_query=DONGKER+band' },
        { name: 'ELKARMOYA', youtube: 'https://www.youtube.com/results?search_query=ELKARMOYA+band' }
      ]
    },
    '2024': {
      bands: [
        { name: 'BIN IDRIS', youtube: 'https://www.youtube.com/watch?v=rjgRFwz_uNs' },
        { name: 'DZUL FAHMI', youtube: 'https://www.youtube.com/watch?v=5IpwcWk67fA' },
        { name: 'EASTCAPE', youtube: 'https://www.youtube.com/watch?v=92XtSnzxAQ8' },
        { name: 'HONEY', youtube: 'https://www.youtube.com/watch?v=qEMKOja2sTg' },
        { name: 'IHCOD AGEDAS', youtube: 'https://www.youtube.com/watch?v=vLTU-xylMYk' }
      ]
    },
    '2023': {
      bands: [
        { name: 'KANEKURO', youtube: 'https://www.youtube.com/results?search_query=Kanekuro' },
        { name: 'RRAG', youtube: 'https://www.youtube.com/results?search_query=Rrag' },
        { name: 'ZEAL', youtube: 'https://www.youtube.com/results?search_query=Zeal+band' },
        { name: 'LAIR', youtube: 'https://www.youtube.com/results?search_query=Lair+band' },
        { name: 'SKY SUCAHYO', youtube: 'https://www.youtube.com/results?search_query=Sky+Sucahyo' }
      ]
    },
    '2022': {
      bands: [
        { name: 'BLEACH', youtube: 'https://www.youtube.com/results?search_query=BLEACH+band' },
        { name: 'BLEU HOUSE', youtube: 'https://www.youtube.com/results?search_query=BLEUHOUSE+band' },
        { name: 'CAL', youtube: 'https://www.youtube.com/results?search_query=CAL+band' },
        { name: 'DONGKER X KINDER BLOOMEN', youtube: 'https://www.youtube.com/results?search_query=DONGKER+KINDER+BLOOMEN' },
        { name: 'ELKARMOYA (LATIN GOES POP)', youtube: 'https://www.youtube.com/results?search_query=ELKARMOYA+LATIN+GOES+POP' }
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
      
      // Create placeholder content instead of images
      strukItem.innerHTML = `
        <div class="struk-placeholder" style="width:100%;height:100%;background:rgba(255,0,124,0.1);border:1px dashed #ff007c;display:flex;align-items:center;justify-content:center;color:#ff007c;font-size:12px;padding:10px;text-align:center;">
          ${item.title}
        </div>
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
              data-youtube="${band.youtube}">
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
              data-youtube="${band.youtube}">
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
                data-youtube="${band.youtube}">
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
      
      // Tampilkan band image container
      bandImageContainer.classList.add('show');
      
      let bandImage = bandImageContainer.querySelector('.band-image');
      if (!bandImage) {
        bandImage = document.createElement('div');
        bandImage.className = 'band-image';
        bandImageContainer.appendChild(bandImage);
      }
      
      // Create placeholder content
      bandImage.innerHTML = `<div class="band-name-display">${bandName}</div>`;
      
      const placeholder = bandImageContainer.querySelector('.band-image-placeholder');
      if (placeholder) {
        placeholder.style.display = 'none';
      }
      
      bandImage.classList.add('active');
      
      // Tampilkan band gif background
      bandGifBackground.classList.add('show');
      
      let bandGif = bandGifBackground.querySelector('.band-gif');
      if (!bandGif) {
        bandGif = document.createElement('div');
        bandGif.className = 'band-gif';
        bandGifBackground.appendChild(bandGif);
      }
      
      // Create animated background
      bandGif.innerHTML = `<div class="band-animation">${bandName}</div>`;
      
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
