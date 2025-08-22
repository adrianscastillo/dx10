// Glass Effect Initialization
let glassEffect = null;
let backgroundTexture = null;

function createBackgroundTexture() {
    if (!glassEffect) return;
    
    // Create a canvas to capture the background
    const bgCanvas = document.createElement('canvas');
    const bgCtx = bgCanvas.getContext('2d');
    bgCanvas.width = window.innerWidth;
    bgCanvas.height = window.innerHeight;
    
    // Draw the background gradient
    const gradient = bgCtx.createRadialGradient(
        window.innerWidth * 0.2, window.innerHeight * 0.3, 0,
        window.innerWidth * 0.2, window.innerHeight * 0.3, window.innerWidth * 0.8
    );
    gradient.addColorStop(0, '#0002AA');
    gradient.addColorStop(0.5, '#000000');
    gradient.addColorStop(1, '#000000');
    
    bgCtx.fillStyle = gradient;
    bgCtx.fillRect(0, 0, bgCanvas.width, bgCanvas.height);
    
    // Create WebGL texture
    const texture = glassEffect.gl.createTexture();
    glassEffect.gl.bindTexture(glassEffect.gl.TEXTURE_2D, texture);
    glassEffect.gl.texImage2D(glassEffect.gl.TEXTURE_2D, 0, glassEffect.gl.RGBA, glassEffect.gl.RGBA, glassEffect.gl.UNSIGNED_BYTE, bgCanvas);
    glassEffect.gl.texParameteri(glassEffect.gl.TEXTURE_2D, glassEffect.gl.TEXTURE_MIN_FILTER, glassEffect.gl.LINEAR);
    glassEffect.gl.texParameteri(glassEffect.gl.TEXTURE_2D, glassEffect.gl.TEXTURE_MAG_FILTER, glassEffect.gl.LINEAR);
    glassEffect.gl.texParameteri(glassEffect.gl.TEXTURE_2D, glassEffect.gl.TEXTURE_WRAP_S, glassEffect.gl.CLAMP_TO_EDGE);
    glassEffect.gl.texParameteri(glassEffect.gl.TEXTURE_2D, glassEffect.gl.TEXTURE_WRAP_T, glassEffect.gl.CLAMP_TO_EDGE);
    
    backgroundTexture = texture;
    glassEffect.setBackground(texture);
}

function animate() {
    if (glassEffect) {
        glassEffect.render();
    }
    requestAnimationFrame(animate);
}

// Menu functionality
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded');
    
    // Initialize glass effect
    const canvas = document.getElementById('glassCanvas');
    const logoElement = document.getElementById('dx10Logo');
    
    console.log('Glass effect elements:', { canvas, logoElement });
    
    if (canvas && logoElement) {
        console.log('Creating LiquidGlassEffect...');
        glassEffect = new LiquidGlassEffect(canvas, logoElement);
        console.log('Creating background texture...');
        createBackgroundTexture();
        console.log('Starting animation...');
        animate();
    } else {
        console.error('Glass effect elements not found:', { canvas, logoElement });
    }
    
    const customCursor = document.getElementById('customCursor');
    
    // Track mouse movement and detect white elements for custom cursor
    document.addEventListener('mousemove', function(e) {
        if (customCursor) {
            // Update cursor position
            customCursor.style.left = e.clientX + 'px';
            customCursor.style.top = e.clientY + 'px';
            
            // Detect white elements and change cursor color
            const element = document.elementFromPoint(e.clientX, e.clientY);
            if (element && element !== customCursor) {
                const computedStyle = window.getComputedStyle(element);
                const backgroundColor = computedStyle.backgroundColor;
                
                // Check if element has white background
                if (backgroundColor.includes('255, 255, 255') || 
                    backgroundColor.includes('rgb(255, 255, 255)') ||
                    backgroundColor.includes('#ffffff') ||
                    backgroundColor.includes('#fff')) {
                    customCursor.classList.add('black');
                } else {
                    customCursor.classList.remove('black');
                }
            }
        }
    });
    
    const menuToggle = document.getElementById('menuToggle');
    const sideMenu = document.getElementById('sideMenu');
    const mainContent = document.getElementById('mainContent');
    const contentSection = document.querySelector('.content-section');
    
    console.log('Menu elements:', { menuToggle, sideMenu, mainContent, contentSection });
    
    if (!menuToggle || !sideMenu || !mainContent) {
        console.error('Menu elements not found!');
        return;
    }
    
    // Show/hide menu button based on scroll position
    function checkMenuVisibility() {
        if (contentSection) {
            const contentSectionTop = contentSection.offsetTop;
            const scrollY = window.scrollY;
            const windowHeight = window.innerHeight;
            
            // Show menu when scrolled past the "What We Do" section
            if (scrollY > contentSectionTop - windowHeight) {
                menuToggle.classList.add('visible');
            } else {
                menuToggle.classList.remove('visible');
            }
        }
    }
    
    // Check on scroll
    window.addEventListener('scroll', checkMenuVisibility);
    
    // Check on page load
    checkMenuVisibility();
    
    menuToggle.addEventListener('click', function(e) {
        e.preventDefault();
        console.log('Menu toggle clicked!');
        
        const isOpening = !sideMenu.classList.contains('open');
        
        if (isOpening) {
            // Add shooting animation only when opening
            menuToggle.classList.add('shooting');
            
            // Remove shooting class after animation completes and ensure menu-open position
            setTimeout(() => {
                menuToggle.classList.remove('shooting');
                // Force the menu-open position with inline style
                menuToggle.style.transform = 'translateY(-50%) translateX(-20vw)';
            }, 300);
        } else {
            // When closing, reset the transform
            menuToggle.style.transform = 'translateY(-50%) translateX(0)';
        }
        
        menuToggle.classList.toggle('active');
        menuToggle.classList.toggle('menu-open');
        sideMenu.classList.toggle('open');
        mainContent.classList.toggle('menu-open');
        console.log('Menu classes after toggle:', {
            menuToggleClasses: menuToggle.className,
            sideMenuClasses: sideMenu.className
        });
    });
    

    
    // Close menu when clicking outside
    document.addEventListener('click', function(event) {
        if (!sideMenu.contains(event.target) && !menuToggle.contains(event.target)) {
            menuToggle.classList.remove('active');
            menuToggle.classList.remove('menu-open');
            sideMenu.classList.remove('open');
            mainContent.classList.remove('menu-open');
            
            // Reset burger button position
            menuToggle.style.transform = 'translateY(-50%) translateX(0)';
        }
    });
    
    // Close menu when pressing Escape key
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape') {
            menuToggle.classList.remove('active');
            menuToggle.classList.remove('menu-open');
            sideMenu.classList.remove('open');
            mainContent.classList.remove('menu-open');
            
            // Reset burger button position
            menuToggle.style.transform = 'translateY(-50%) translateX(0)';
        }
    });
    
    // Close menu when clicking on navigation links
    const menuLinks = document.querySelectorAll('.menu-content a');
    menuLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Close menu
            menuToggle.classList.remove('active');
            menuToggle.classList.remove('menu-open');
            sideMenu.classList.remove('open');
            mainContent.classList.remove('menu-open');
            
            // Reset burger button position
            menuToggle.style.transform = 'translateY(-50%) translateX(0)';
            
            // Get target section
            const targetId = this.getAttribute('href').substring(1);
            const targetSection = document.getElementById(targetId);
            
            if (targetSection) {
                // Smooth scroll to target
                const targetPosition = targetSection.offsetTop;
                const startPosition = window.pageYOffset;
                const distance = targetPosition - startPosition;
                const duration = 1500; // 1.5 seconds
                let start = null;
                
                function animation(currentTime) {
                    if (start === null) start = currentTime;
                    const timeElapsed = currentTime - start;
                    const run = easeInOutCubic(timeElapsed, startPosition, distance, duration);
                    window.scrollTo(0, run);
                    if (timeElapsed < duration) requestAnimationFrame(animation);
                }
                
                // Easing function for buttery smooth animation
                function easeInOutCubic(t, b, c, d) {
                    t /= d / 2;
                    if (t < 1) return c / 2 * t * t * t + b;
                    t -= 2;
                    return c / 2 * (t * t * t + 2) + b;
                }
                
                requestAnimationFrame(animation);
            }
        });
    });
});

// Circle animation code
function initCircleAnimations() {
    const circles = document.querySelectorAll('.gradient-circle');
    const leftColumn = document.querySelector('.left-column-new');
    let circleMouseX = 0;
    let circleMouseY = 0;
    let circlePositions = [];
    let circleScrollY = 0;

    // Initialize circle positions
    circles.forEach((circle, index) => {
        circlePositions[index] = {
            x: 0,
            y: 0,
            targetX: 0,
            targetY: 0,
            baseX: 0,
            baseY: 0
        };
    });

    // Track mouse movement for circles
    document.addEventListener('mousemove', function(e) {
        circleMouseX = e.clientX;
        circleMouseY = e.clientY;
    });

    // Track scroll for circles
    window.addEventListener('scroll', function() {
        circleScrollY = window.scrollY;
    });

    // Animate circles based on mouse movement and scroll
    function animateCircles() {
        const section = document.querySelector('.new-section');
        if (section) {
            const sectionRect = section.getBoundingClientRect();
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            const windowHeight = window.innerHeight;
            
            // Calculate parallax movement based on scroll position
            const scrollProgress = (circleScrollY - sectionTop + windowHeight) / (windowHeight + sectionHeight);
            const clampedProgress = Math.max(0, Math.min(1, scrollProgress));
            
            // Parallax movement for the entire component
            const maxParallaxMove = 300;
            const parallaxY = clampedProgress * maxParallaxMove;
            
            if (leftColumn) {
                leftColumn.style.transform = `translateY(${parallaxY}px)`;
            }
        }

        circles.forEach((circle, index) => {
            const position = circlePositions[index];
            
            // Calculate random movement based on mouse position
            const mouseInfluence = 0.01;
            const randomFactor = 0.008;
            const maxMovement = 60; // Constrain movement to 60px radius
            
            // Add some randomness to the movement (horizontal only)
            position.targetX += (Math.random() - 0.5) * randomFactor * circleMouseX;
            position.targetY = 0; // Keep vertical position fixed
            
            // Constrain movement to stay within general area (horizontal only)
            position.targetX = Math.max(-maxMovement, Math.min(maxMovement, position.targetX));
            
            // Smooth movement towards target (horizontal only)
            position.x += (position.targetX - position.x) * 0.02;
            position.y = 0; // Keep vertical position at 0
            
            // Apply transform
            circle.style.transform = `translate(${position.x}px, ${position.y}px)`;
        });
        
        requestAnimationFrame(animateCircles);
    }

    // Start animation
    animateCircles();
}

// Initialize circle animations
initCircleAnimations();

// Parallax effect for offset paragraph
function initParallaxEffect() {
    const offsetParagraph = document.querySelector('.larger-text');
    let parallaxScrollY = 0;

    window.addEventListener('scroll', function() {
        parallaxScrollY = window.scrollY;
        
        if (offsetParagraph) {
            const section = document.querySelector('.new-section');
            if (section) {
                const sectionRect = section.getBoundingClientRect();
                const sectionTop = section.offsetTop;
                const sectionHeight = section.offsetHeight;
                const windowHeight = window.innerHeight;
                
                // Calculate parallax movement - start higher
                const scrollProgress = (parallaxScrollY - sectionTop + windowHeight * 0.5) / (windowHeight + sectionHeight);
                const clampedProgress = Math.max(0, Math.min(1, scrollProgress));
                
                // Move the paragraph vertically based on scroll
                const maxMove = 200;
                const moveY = clampedProgress * maxMove;
                
                offsetParagraph.style.transform = `translateY(${moveY}px)`;
            }
        }
    });
}

// Initialize parallax effect
initParallaxEffect();

// Handle window resize for glass effect
window.addEventListener('resize', function() {
    if (glassEffect) {
        glassEffect.resize();
        createBackgroundTexture();
    }
});
