// Menu functionality
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded');
    
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

// Cursor-responsive background triangles
function initCursorResponsiveTriangles() {
    const hero = document.querySelector('.hero');
    let mouseX = 0;
    let mouseY = 0;
    let currentX = 0;
    let currentY = 0;
    let time = 0;
    
    // Track mouse movement
    document.addEventListener('mousemove', function(e) {
        mouseX = (e.clientX / window.innerWidth) * 100;
        mouseY = (e.clientY / window.innerHeight) * 100;
    });
    
    // Animate background position based on cursor
    function animateTriangles() {
        time += 0.01;
        
        // More organic interpolation with easing
        currentX += (mouseX - currentX) * 0.05;
        currentY += (mouseY - currentY) * 0.05;
        
        if (hero) {
            // Add subtle organic movement with sine waves
            const organicX = Math.sin(time * 0.5) * 2;
            const organicY = Math.cos(time * 0.3) * 2;
            
            // Update background position based on cursor movement with organic variation
            const moveX = (currentX - 50) * 0.6 + organicX;
            const moveY = (currentY - 50) * 0.6 + organicY;
            
            // Constrain movement to prevent horizontal scroll
            const constrainedMoveX = Math.max(-25, Math.min(25, moveX));
            const constrainedMoveY = Math.max(-25, Math.min(25, moveY));
            
            // Add individual triangle breathing with different frequencies
            const breath1 = Math.sin(time * 0.8) * 1;
            const breath2 = Math.cos(time * 1.2) * 1;
            const breath3 = Math.sin(time * 0.6) * 1;
            const breath4 = Math.cos(time * 0.9) * 1;
            const breath5 = Math.sin(time * 1.1) * 1;
            const breath6 = Math.cos(time * 0.7) * 1;
            const breath7 = Math.sin(time * 1.0) * 1;
            const breath8 = Math.cos(time * 0.5) * 1;
            const breath9 = Math.sin(time * 0.4) * 1;
            
            hero.style.backgroundPosition = `
                ${Math.max(5, Math.min(35, 20 + constrainedMoveX * 0.6 + breath1))}% ${Math.max(15, Math.min(45, 30 + constrainedMoveY * 0.6 + breath1))}%, 
                ${Math.max(65, Math.min(95, 80 + constrainedMoveX * 0.4 + breath2))}% ${Math.max(55, Math.min(85, 70 + constrainedMoveY * 0.4 + breath2))}%, 
                ${Math.max(25, Math.min(55, 40 + constrainedMoveX * 0.8 + breath3))}% ${Math.max(65, Math.min(95, 80 + constrainedMoveY * 0.8 + breath3))}%, 
                ${Math.max(75, Math.min(105, 90 + constrainedMoveX * 0.2 + breath4))}% ${Math.max(5, Math.min(35, 20 + constrainedMoveY * 0.2 + breath4))}%, 
                ${Math.max(-5, Math.min(25, 10 + constrainedMoveX * 1.0 + breath5))}% ${Math.max(45, Math.min(75, 60 + constrainedMoveY * 1.0 + breath5))}%, 
                ${Math.max(45, Math.min(75, 60 + constrainedMoveX * 0.6 + breath6))}% ${Math.max(25, Math.min(55, 40 + constrainedMoveY * 0.6 + breath6))}%, 
                ${Math.max(15, Math.min(45, 30 + constrainedMoveX * 0.4 + breath7))}% ${Math.max(35, Math.min(65, 50 + constrainedMoveY * 0.4 + breath7))}%, 
                ${Math.max(55, Math.min(85, 70 + constrainedMoveX * 0.8 + breath8))}% ${Math.max(15, Math.min(45, 30 + constrainedMoveY * 0.8 + breath8))}%, 
                ${Math.max(35, Math.min(65, 50 + constrainedMoveX * 0.2 + breath9))}% ${Math.max(35, Math.min(65, 50 + constrainedMoveY * 0.2 + breath9))}%, 
                0% 0%, 
                0% 0%
            `;
        }
        
        requestAnimationFrame(animateTriangles);
    }
    
    // Start animation
    animateTriangles();
}

// Initialize cursor-responsive triangles
initCursorResponsiveTriangles();
