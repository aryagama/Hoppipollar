document.addEventListener('DOMContentLoaded', function () {
  // ========== [START: BACKGROUND MUSIC SETUP] ========== //
  const bgMusic = document.getElementById('bgMusic');
  
  // Fungsi untuk memutar audio setelah interaksi pengguna
  function enableAudio() {
    document.removeEventListener('click', enableAudio);
    document.removeEventListener('keydown', enableAudio);
    document.removeEventListener('touchstart', enableAudio);
    
    bgMusic.volume = 0.5; // Volume 50%
    const playPromise = bgMusic.play();
    
    if (playPromise !== undefined) {
      playPromise.catch(error => {
        console.log('Autoplay prevented:', error);
      });
    }
  }

  // Aktifkan audio saat pengguna pertama kali berinteraksi
  document.addEventListener('click', enableAudio, { once: true });
  document.addEventListener('keydown', enableAudio, { once: true });
  document.addEventListener('touchstart', enableAudio, { once: true });

  const isTouchDevice = window.matchMedia("(pointer: coarse)").matches;
  
  // Initialize elements
  const strukContainer = document.getElementById('strukContainer');
  const scrollContainer = document.getElementById('scrollContainer');
  const cursor = document.getElementById('cursor');
  const cursorFollower = document.getElementById('cursorFollower');
  const cursorText = document.getElementById('cursorText');
  const videos = document.querySelectorAll('.video-background video');
  const infoModal = document.getElementById('infoModal');
  const closeModal = document.getElementById('closeModal');
  const zoomInBtn = document.getElementById('zoomIn');
  const zoomOutBtn = document.getElementById('zoomOut');
  const previewModal = document.getElementById('previewModal');
  const previewImage = document.getElementById('previewImage');
  const closePreview = document.getElementById('closePreview');
  const shareButton = document.getElementById('shareButton');
  const infoBtn = document.getElementById('infoBtn');
  const moodBtn = document.getElementById('moodBtn');
  const dropMomentBtn = document.getElementById('dropMomentBtn');
  
  // Search elements
  const searchModal = document.getElementById('searchModal');
  const searchInput = document.getElementById('searchInput');
  const searchResults = document.getElementById('searchResults');
  const closeSearch = document.getElementById('closeSearch');
  const searchButton = document.getElementById('searchButton');

  // Mood settings
  const moods = ['default', 'black', 'yellow', 'purple'];
  const moodLabels = ['DEFAULT', 'BLACK', 'YELLOW', 'PURPLE'];
  let currentMoodIndex = 0;

  // Initialize mood
  document.body.setAttribute('data-mood', moods[currentMoodIndex]);
  moodBtn.textContent = `MOOD (${moodLabels[currentMoodIndex]})`;

  // Receipt data with names
  const strukFiles = [
    { name: "Struk 1", file: 'Struk 1.png' },
    { name: "Struk 2", file: 'Struk 2.png' },
    { name: "Struk 4", file: 'Struk 4.png' },
  ];

  // Generate struks in a grid
  const strukWidth = 150;
  const gap = 20;
  const gridSize = 5000;
  const cols = Math.ceil(gridSize / (strukWidth + gap));
  const rows = Math.ceil(gridSize / (strukWidth + gap));

  // Store all struk elements and their initial positions
  const struks = [];
  let isHovering = false; // Track hover state for cursor
  
  // Function to create struk elements
  function createStruk(i, j) {
    const struk = document.createElement('img');
    struk.className = 'struk';
    const randomStruk = strukFiles[Math.floor(Math.random() * strukFiles.length)];
    struk.src = randomStruk.file;
    struk.alt = randomStruk.name;
    struk.loading = 'lazy';
    const randomRotation = Math.random() * 20 - 10;
    
    // Store initial position and rotation
    const strukObj = {
      element: struk,
      baseX: j * (strukWidth + gap),
      baseY: i * (strukWidth + gap),
      rotation: randomRotation,
      src: randomStruk.file,
      name: randomStruk.name
    };
    
    struks.push(strukObj);
    strukContainer.appendChild(struk);
    
    return strukObj;
  }

  // Create struks in batches for better performance
  function createStruksBatch() {
    const batchSize = 50;
    let i = 0, j = 0;
    
    function processBatch() {
      const endI = Math.min(i + batchSize, rows);
      const endJ = Math.min(j + batchSize, cols);
      
      for (; i < endI; i++) {
        for (; j < endJ; j++) {
          createStruk(i, j);
        }
        j = 0;
      }
      
      if (i < rows) {
        requestAnimationFrame(processBatch);
      } else {
        // Center the scroll after all struks are loaded
        scrollContainer.scrollTo(gridSize/2 - window.innerWidth/2, gridSize/2 - window.innerHeight/2);
      }
    }
    
    processBatch();
  }
  
  createStruksBatch();

  // Zoom functionality
  let scale = 1;
  const minScale = 0.3;
  const maxScale = 2;
  const scaleStep = 0.2;

  function updateZoom() {
    strukContainer.style.transform = `scale(${scale})`;
  }

  zoomInBtn.addEventListener('click', () => {
    scale = Math.min(scale + scaleStep, maxScale);
    updateZoom();
  });

  zoomOutBtn.addEventListener('click', () => {
    scale = Math.max(scale - scaleStep, minScale);
    updateZoom();
  });

  // Handle mouse wheel for zoom
  scrollContainer.addEventListener('wheel', (e) => {
    if (e.ctrlKey) {
      e.preventDefault();
      const delta = e.deltaY;
      if (delta < 0) {
        scale = Math.min(scale + scaleStep, maxScale);
      } else {
        scale = Math.max(scale - scaleStep, minScale);
      }
      updateZoom();
    }
  }, { passive: false });

  // Custom cursor movement (only for non-touch devices)
  if (!isTouchDevice) {
    let mouseX = 0, mouseY = 0;
    let followerX = 0, followerY = 0;

    function animateCursor() {
      // Main cursor (small circle)
      cursor.style.left = mouseX + 'px';
      cursor.style.top = mouseY + 'px';
      
      // Follower cursor (larger circle with delay)
      followerX += (mouseX - followerX) * 0.2;
      followerY += (mouseY - followerY) * 0.2;
      cursorFollower.style.left = followerX + 'px';
      cursorFollower.style.top = followerY + 'px';
      
      // Cursor text position
      cursorText.style.left = mouseX + 'px';
      cursorText.style.top = mouseY + 'px';
      
      requestAnimationFrame(animateCursor);
    }

    animateCursor();

    // Track mouse position
    document.addEventListener('mousemove', function (e) {
      mouseX = e.clientX;
      mouseY = e.clientY;

      const scrollX = e.clientX + scrollContainer.scrollLeft;
      const scrollY = e.clientY + scrollContainer.scrollTop;
      
      let activeStruk = null;
      let minDistance = Infinity;

      // Find the closest struk to cursor
      struks.forEach(strukObj => {
        const struk = strukObj.element;
        const rect = struk.getBoundingClientRect();
        const centerX = rect.left + rect.width/2 + scrollContainer.scrollLeft;
        const centerY = rect.top + rect.height/2 + scrollContainer.scrollTop;
        const distance = Math.sqrt(
          Math.pow(scrollX - centerX, 2) + 
          Math.pow(scrollY - centerY, 2)
        );

        // Only activate if cursor is within 200px of struk center
        if (distance < 200) {
          if (distance < minDistance) {
            minDistance = distance;
            activeStruk = strukObj;
          }
        }
      });

      // Apply effects to all struks
      struks.forEach(strukObj => {
        const struk = strukObj.element;
        const rect = struk.getBoundingClientRect();
        const centerX = rect.left + rect.width/2;
        const centerY = rect.top + rect.height/2;
        const distance = Math.sqrt(
          Math.pow(e.clientX - centerX, 2) + 
          Math.pow(e.clientY - centerY, 2)
        );

        if (strukObj === activeStruk) {
          // For the closest struk - follow cursor and scale up
          const followAmount = 0.2;
          const targetX = strukObj.baseX + (e.clientX - centerX) * followAmount;
          const targetY = strukObj.baseY + (e.clientY - centerY) * followAmount;
          
          const scaleAmount = 1.5 - (distance / 200) * 0.5; // Scale up to 1.5x
          
          struk.style.transform = `
            translate(${targetX}px, ${targetY}px)
            rotate(${strukObj.rotation}deg)
            scale(${scaleAmount})
          `;
          struk.style.zIndex = '10';
          
          // Update cursor state
          cursor.classList.add('hover');
          cursorFollower.style.width = '30px';
          cursorFollower.style.height = '30px';
          cursorText.classList.add('active');
          isHovering = true;
        } else {
          // For other struks - return to original position
          struk.style.transform = `
            translate(${strukObj.baseX}px, ${strukObj.baseY}px)
            rotate(${strukObj.rotation}deg)
            scale(1)
          `;
          struk.style.zIndex = '0';
        }
      });

      // Reset cursor if not hovering over any struk
      if (!activeStruk && isHovering) {
        cursor.classList.remove('hover');
        cursorFollower.style.width = '10px';
        cursorFollower.style.height = '10px';
        cursorText.classList.remove('active');
        isHovering = false;
      }
    });

    document.addEventListener('mousedown', () => {
      cursor.classList.add('active');
      cursorFollower.style.width = '15px';
      cursorFollower.style.height = '15px';
    });
    
    document.addEventListener('mouseup', () => {
      cursor.classList.remove('active');
      cursorFollower.style.width = isHovering ? '30px' : '10px';
      cursorFollower.style.height = isHovering ? '30px' : '10px';
    });
    
    // Add cursor effects to modal elements (including dropMomentBtn)
    const modalInteractiveElements = [
      closeModal, zoomInBtn, zoomOutBtn, closePreview, shareButton,
      infoBtn, moodBtn, dropMomentBtn, closeSearch, searchButton
    ];
    
    modalInteractiveElements.forEach(el => {
      if (el) {
        el.addEventListener('mouseenter', () => {
          cursor.classList.add('hover');
          cursorFollower.style.width = '30px';
          cursorFollower.style.height = '30px';
          isHovering = true;
        });
        
        el.addEventListener('mouseleave', () => {
          cursor.classList.remove('hover');
          cursorFollower.style.width = '10px';
          cursorFollower.style.height = '10px';
          isHovering = false;
        });
      }
    });
  }

  // Click handler for struks to show preview
  struks.forEach(strukObj => {
    strukObj.element.addEventListener('click', (e) => {
      e.preventDefault();
      previewImage.src = strukObj.src;
      previewModal.classList.add('active');
      document.body.style.overflow = 'hidden';
      
      // Force reflow to trigger animation
      void previewModal.offsetWidth;
    });
  });

  // Close preview modal
  closePreview.addEventListener('click', () => {
    previewModal.classList.remove('active');
    setTimeout(() => {
      document.body.style.overflow = '';
    }, 500);
  });

  // Enhanced share functionality with receipt name
  shareButton.addEventListener('click', () => {
    const strukObj = struks.find(s => s.src === previewImage.src);
    const strukName = strukObj?.name || "My Receipt";
    
    if (navigator.share) {
      navigator.share({
        title: `Alternative Stage: ${strukName}`,
        text: 'Check out my receipt from Alternative Stage',
        url: previewImage.src
      }).catch(err => {
        console.log('Error sharing:', err);
        fallbackShare(previewImage.src, strukName);
      });
    } else {
      fallbackShare(previewImage.src, strukName);
    }
  });

  function fallbackShare(imageSrc, name) {
    // Create a temporary link for download
    const link = document.createElement('a');
    link.href = imageSrc;
    link.download = `alternative-stage-${name.replace(/\s+/g, '-').toLowerCase()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Alert user about the download
    alert(`"${name}" has been downloaded. You can now share it from your gallery.`);
  }

  // Close preview when clicking outside
  previewModal.addEventListener('click', (e) => {
    if (e.target === previewModal) {
      previewModal.classList.remove('active');
      setTimeout(() => {
        document.body.style.overflow = '';
      }, 500);
    }
  });

  // Video rotation
  let currentVideoIndex = 0;
  const videoPositions = [
    { top: '30%', left: '20%' },
    { top: '50%', left: '50%' },
    { top: '70%', left: '80%' }
  ];

  // Initialize video positions
  videos.forEach((video, index) => {
    const position = videoPositions[index];
    video.style.top = position.top;
    video.style.left = position.left;
    video.style.transform = 'translate(-50%, -50%)';
    
    // Handle video autoplay
    video.play().catch(e => console.log('Autoplay prevented:', e));
  });

  function changeVideo() {
    videos[currentVideoIndex].classList.remove('active');
    currentVideoIndex = (currentVideoIndex + 1) % videos.length;
    const nextVideo = videos[currentVideoIndex];
    nextVideo.classList.add('active');
    setTimeout(changeVideo, 5000);
  }

  if (videos.length > 1) {
    setTimeout(changeVideo, 5000);
  }

  // Info button functionality
  infoBtn.addEventListener('click', () => {
    infoModal.style.display = 'flex';
  });

  closeModal.addEventListener('click', () => {
    infoModal.style.display = 'none';
  });

  window.addEventListener('click', (e) => {
    if (e.target === infoModal) {
      infoModal.style.display = 'none';
    }
  });

  // Mood button functionality - single click cycle through moods
  moodBtn.addEventListener('click', () => {
    // Cycle to next mood
    currentMoodIndex = (currentMoodIndex + 1) % moods.length;
    
    // Apply new mood
    document.body.setAttribute('data-mood', moods[currentMoodIndex]);
    
    // Update button text
    moodBtn.textContent = `MOOD (${moodLabels[currentMoodIndex]})`;
  });

  // ========== [START: SEARCH FUNCTIONALITY] ========== //
  // Open search modal when clicking "Let's drop a micro moment"
  dropMomentBtn.addEventListener('click', () => {
    searchModal.classList.add('active');
    document.body.style.overflow = 'hidden';
    searchInput.focus();
    searchReceipts(''); // Show all receipts initially
  });

  // Close search modal
  closeSearch.addEventListener('click', () => {
    searchModal.classList.remove('active');
    document.body.style.overflow = '';
  });

  // Search function
  function searchReceipts(query) {
    searchResults.innerHTML = '';
    const normalizedQuery = query.toLowerCase().trim();
    
    if (!normalizedQuery) {
      // Show all receipts if search is empty
      strukFiles.forEach((struk, index) => {
        addReceiptToSearchResults(struk, index);
      });
      return;
    }

    const filtered = strukFiles.filter(struk => 
      struk.name.toLowerCase().includes(normalizedQuery)
    );

    if (filtered.length === 0) {
      searchResults.innerHTML = '<p class="no-results">No receipts found. Try a different search term.</p>';
    } else {
      filtered.forEach((struk, index) => {
        addReceiptToSearchResults(struk, index);
      });
    }
  }

  function addReceiptToSearchResults(struk, index) {
    const receiptItem = document.createElement('div');
    receiptItem.className = 'receipt-item';
    receiptItem.innerHTML = `
      <span class="receipt-name">${struk.name}</span>
      <span class="receipt-view">VIEW</span>
    `;
    receiptItem.addEventListener('click', () => {
      highlightReceipt(struk.file);
      searchModal.classList.remove('active');
      document.body.style.overflow = '';
    });
    searchResults.appendChild(receiptItem);
  }

  function highlightReceipt(filePath) {
    // Find the struk in the grid
    const strukObj = struks.find(s => s.src === filePath);
    if (strukObj) {
      // Scroll to the struk
      scrollContainer.scrollTo({
        left: strukObj.baseX - window.innerWidth/2 + strukWidth/2,
        top: strukObj.baseY - window.innerHeight/2 + strukWidth/2,
        behavior: 'smooth'
      });

      // Add highlight effect
      strukObj.element.classList.add('highlight');
      setTimeout(() => {
        strukObj.element.classList.remove('highlight');
      }, 2000);
      
      // Show preview
      previewImage.src = strukObj.src;
      previewModal.classList.add('active');
    }
  }

  // Search when typing
  searchInput.addEventListener('input', (e) => {
    searchReceipts(e.target.value);
  });

  // Search when button clicked
  searchButton.addEventListener('click', () => {
    searchReceipts(searchInput.value);
  });

  // Search when pressing Enter
  searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      searchReceipts(searchInput.value);
    }
  });
});
