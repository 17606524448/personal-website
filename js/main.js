
let scene, camera, renderer;
let particles, particleSystem;
let backgroundParticles; // New background particles
let trail; // Mouse trail line
let mouse = new THREE.Vector2();
let target = new THREE.Vector3();
let windowHalfX = window.innerWidth / 2;
let windowHalfY = window.innerHeight / 2;
let isHolding = false;
let holdProgress = 0;
let completed = false;
const holdDuration = 2000; // 2 seconds to hold
let holdStartTime = 0;
let baseSpeed = 0.002;
let targetSpeed = 0.05;
let currentSpeed = baseSpeed;
let isWarping = false; // Warp state

// DOM Elements
const overlay = document.getElementById('overlay');
const loader = document.getElementById('loader');
const loaderBar = document.getElementById('loader-bar');
const content = document.getElementById('content');
const timelineSection = document.getElementById('timeline-section');
const detailPage = document.getElementById('detail-page');

init();
animate();

function init() {
    // Scene setup
    scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x000000, 0.001);

    // Camera setup
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 50;

    // Renderer setup
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true }); // alpha: true for transparent bg if needed
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.getElementById('canvas-container').appendChild(renderer.domElement);

    // Create Particles
    createParticles();
    createBackgroundParticles();
    createTrail(); // Create mouse trail

    // Load Texture
    const loader = new THREE.TextureLoader();
    const circleTexture = loader.load('https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/sprites/circle.png');

    // Store texture for reuse
    window.particleTexture = circleTexture;

    // Event Listeners
    window.addEventListener('resize', onWindowResize, false);
    document.addEventListener('mousemove', onMouseMove, false);
    
    // Mouse/Touch Interaction
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('mouseup', onPointerUp);
    document.addEventListener('touchstart', onPointerDown, { passive: false });
    document.addEventListener('touchend', onPointerUp);
}

function createParticles() {
    const geometry = new THREE.BufferGeometry();
    const vertices = [];
    const colors = [];

    const particleCount = 2000;
    const color = new THREE.Color();

    for (let i = 0; i < particleCount; i++) {
        // Create a sphere distribution
        const theta = 2 * Math.PI * Math.random();
        const phi = Math.acos(2 * Math.random() - 1);
        const radius = 20 + Math.random() * 10; // Base radius

        const x = radius * Math.sin(phi) * Math.cos(theta);
        const y = radius * Math.sin(phi) * Math.sin(theta);
        const z = radius * Math.cos(phi);

        vertices.push(x, y, z);

        // Color gradient based on position or random
        color.setHSL(Math.random() * 0.1 + 0.5, 0.8, 0.6); // Blueish/Cyan
        colors.push(color.r, color.g, color.b);
    }

    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

    // Load texture
    const textureLoader = new THREE.TextureLoader();
    const sprite = textureLoader.load('https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/sprites/circle.png');

    const material = new THREE.PointsMaterial({
        size: 0.5,
        vertexColors: true,
        map: sprite, // Use circle texture
        blending: THREE.AdditiveBlending,
        depthTest: false,
        transparent: true,
        opacity: 0.8
    });

    particleSystem = new THREE.Points(geometry, material);
    scene.add(particleSystem);
}

function createBackgroundParticles() {
    // INCREASED COUNT significantly for density
    const particleCount = 180000; 
    const geometry = new THREE.BufferGeometry();
    const vertices = [];
    
    // Use SPHERICAL VOLUME distribution instead of BOX
    // This removes the "corners" and "layers" feeling
    for (let i = 0; i < particleCount; i++) {
        // Random point inside a sphere of radius 6000
        // Using cube root of random for uniform distribution within sphere
        const r = 6000 * Math.cbrt(Math.random());
        const theta = Math.random() * 2 * Math.PI;
        const phi = Math.acos(2 * Math.random() - 1);
        
        const x = r * Math.sin(phi) * Math.cos(theta);
        const y = r * Math.sin(phi) * Math.sin(theta);
        const z = r * Math.cos(phi);
        
        vertices.push(x, y, z);
    }

    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));

    const textureLoader = new THREE.TextureLoader();
    const sprite = textureLoader.load('https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/sprites/circle.png');

    const material = new THREE.PointsMaterial({
        color: 0xffffff,
        size: 2.2, // Larger particles for better visibility
        map: sprite,
        blending: THREE.AdditiveBlending,
        depthTest: false,
        transparent: true,
        opacity: 0.95, // Higher opacity for better visibility
        sizeAttenuation: true
    });

    backgroundParticles = new THREE.Points(geometry, material);
    backgroundParticles.frustumCulled = false;
    scene.add(backgroundParticles);
}

function createTrail() {
    const geometry = new THREE.BufferGeometry();
    const positions = [];
    const opacities = [];
    const trailLength = 100; // Increased length for long tail

    for (let i = 0; i < trailLength; i++) {
        positions.push(0, 0, 0);
        opacities.push(1.0 - (i / trailLength)); // Fade out from head (1.0) to tail (0.0)
    }

    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute('lineOpacity', new THREE.Float32BufferAttribute(opacities, 1));

    // Custom shader for smooth, connected line
    const material = new THREE.ShaderMaterial({
        uniforms: {
            color: { value: new THREE.Color(0xffffff) }
        },
        vertexShader: `
            attribute float lineOpacity;
            varying float vAlpha;
            void main() {
                vAlpha = lineOpacity;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `,
        fragmentShader: `
            uniform vec3 color;
            varying float vAlpha;
            void main() {
                gl_FragColor = vec4(color, vAlpha);
            }
        `,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthTest: false
    });

    trail = new THREE.Line(geometry, material);
    scene.add(trail);
}

function onWindowResize() {
    windowHalfX = window.innerWidth / 2;
    windowHalfY = window.innerHeight / 2;
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function onMouseMove(event) {
    mouse.x = (event.clientX - windowHalfX) * 0.05; // Scale down for scene coords
    mouse.y = (event.clientY - windowHalfY) * 0.05;
    
    // Unproject for 3D position
    const vector = new THREE.Vector3(
        (event.clientX / window.innerWidth) * 2 - 1,
        -(event.clientY / window.innerHeight) * 2 + 1,
        0.5
    );
    vector.unproject(camera);
    const dir = vector.sub(camera.position).normalize();
    const distance = -camera.position.z / dir.z;
    target = camera.position.clone().add(dir.multiplyScalar(distance));
}

function onPointerDown(e) {
    if (completed) return;
    if (e.type === 'touchstart') e.preventDefault(); // Prevent scrolling on mobile
    
    isHolding = true;
    loader.style.display = 'block';
    
    // Visual feedback
    overlay.style.opacity = 0.5;
}

function onPointerUp() {
    if (completed) return;
    
    isHolding = false;
    holdProgress = 0;
    updateLoader(0);
    
    // Reset visual feedback
    overlay.style.opacity = 1;
    loader.style.display = 'none';
}

function updateLoader(progress) {
    loaderBar.style.width = `${progress * 100}%`;
}

function animate() {
    requestAnimationFrame(animate);

    const time = Date.now() * 0.0005;

    // Logic for Holding
    if (isHolding && !completed) {
        // Accelerate rotation
        currentSpeed = THREE.MathUtils.lerp(currentSpeed, targetSpeed, 0.05);
        
        // Expand particles slightly
        particleSystem.scale.setScalar(THREE.MathUtils.lerp(particleSystem.scale.x, 1.2, 0.05));
        
        // Update Progress
        holdProgress += 1000/60 / holdDuration; // Approx frame time / duration
        if (holdProgress >= 1) {
            completeExperience();
        }
    } else {
        // Decelerate to base speed
        currentSpeed = THREE.MathUtils.lerp(currentSpeed, baseSpeed, 0.05);
        
        // Return to normal scale
        if (!completed) {
            particleSystem.scale.setScalar(THREE.MathUtils.lerp(particleSystem.scale.x, 1.0, 0.05));
        }
    }
    
    updateLoader(holdProgress);

    // Particle Animation
    particleSystem.rotation.y += currentSpeed;
    particleSystem.rotation.z += currentSpeed * 0.5;

    // Pulse effect if not holding
    if (!isHolding && !completed) {
         const pulse = Math.sin(time * 2) * 0.05 + 1;
         // particleSystem.scale.setScalar(pulse); // Subtle pulse
    }
    
    // Background Particles Animation
    if (backgroundParticles) {
        if (isWarping) {
            // Warp Effect: Move particles towards camera fast
            const positions = backgroundParticles.geometry.attributes.position.array;
            for (let i = 0; i < positions.length; i += 3) {
                // Z movement - much faster
                positions[i + 2] += 80;
                
                // If passed camera (Z > 1000)
                if (positions[i + 2] > 1000) {
                    positions[i + 2] = -3000; // Reset far back
                    
                    // Tunnel effect
                    const angle = Math.random() * Math.PI * 2;
                    const radius = 300 + Math.random() * 2000; 
                    positions[i] = Math.cos(angle) * radius;
                    positions[i + 1] = Math.sin(angle) * radius;
                }
            }
            backgroundParticles.geometry.attributes.position.needsUpdate = true;
        } else {
            // Normal rotation - Slow constant drift
            backgroundParticles.rotation.y = time * 0.05;
            backgroundParticles.rotation.x = time * 0.02;

            // INFINITE TUNNEL LOGIC (Even when not warping)
            // Instead of resetting X/Y, we maintain a deep field
            const positions = backgroundParticles.geometry.attributes.position.array;
            for (let i = 0; i < positions.length; i += 3) {
                // Move towards camera - faster speed for better visibility
                positions[i + 2] += 2; 
                
                // Add mouse influence - particles move in the direction of mouse
                const mouseInfluence = 0.1; // Adjust this value to control mouse influence
                positions[i] += mouse.x * mouseInfluence;
                positions[i + 1] += -mouse.y * mouseInfluence;

                // If passed camera (Z > 1000)
                if (positions[i + 2] > 1000) {
                    // Send to far background (-7000) - Deeper recycle
                    positions[i + 2] = -7000;
                    
                    // IMPORTANT: Re-randomize X/Y using SPHERICAL distribution
                    // This prevents "layers" or "sheets" from forming over time
                    // We project a point on a large circle at the back
                    const r = 4000 + Math.random() * 2000; // Radius between 4000 and 6000
                    const theta = Math.random() * 2 * Math.PI;
                    
                    positions[i] = r * Math.cos(theta);
                    positions[i + 1] = r * Math.sin(theta);
                }
            }
            backgroundParticles.geometry.attributes.position.needsUpdate = true;
        }
    }

    // Trail Animation
    if (trail) {
        const positions = trail.geometry.attributes.position.array;
        
        // Shift positions
        for (let i = positions.length - 1; i > 2; i -= 3) {
            positions[i] = positions[i - 3];
            positions[i - 1] = positions[i - 4];
            positions[i - 2] = positions[i - 5];
        }
        
        // Update head to mouse position
        positions[0] = target.x;
        positions[1] = target.y;
        positions[2] = target.z;
        
        trail.geometry.attributes.position.needsUpdate = true;
    }
    
    // Explosion effect when completed
    if (completed) {
        particleSystem.scale.setScalar(THREE.MathUtils.lerp(particleSystem.scale.x, 5, 0.02));
        particleSystem.material.opacity = THREE.MathUtils.lerp(particleSystem.material.opacity, 0, 0.05);
        particleSystem.rotation.y += 0.05;
    }

    renderer.render(scene, camera);
}

function completeExperience() {
    completed = true;
    isHolding = false;
    
    // Hide UI elements
    overlay.style.opacity = 0;
    loader.style.display = 'none';
    
    // Show Content after a delay (let explosion happen)
    setTimeout(() => {
        content.classList.add('visible');
    }, 800);
}

// Exposed to global scope for the button
window.resetExperience = function() {
    completed = false;
    holdProgress = 0;
    currentSpeed = baseSpeed;
    
    // Reset Particles
    particleSystem.scale.setScalar(1);
    particleSystem.material.opacity = 0.8;
    
    // Hide Content
    content.classList.remove('visible');
    
    // Show Overlay
    overlay.style.opacity = 1;
};

window.enterTimeline = function() {
    // Hide Content
    content.classList.remove('visible');
    
    // Show Timeline Section
    timelineSection.classList.add('visible');
    
    // Trigger timeline container animation
    setTimeout(() => {
        const container = document.querySelector('.timeline-container');
        // Reset styles to ensure animation works correctly
        container.style.opacity = '';
        container.style.transform = '';
        // Animation is handled by CSS class 'visible' on parent
    }, 50);
};

window.backToHome = function() {
    // Hide Timeline Section
    timelineSection.classList.remove('visible');
    
    // Reset timeline container position for next time
    const container = document.querySelector('.timeline-container');
    container.style.opacity = '0';
    container.style.transform = 'translateX(-50px)';
    
    // Show Content
    content.classList.add('visible');
};

// Show contact information
window.showContact = function(contactInfo) {
    alert(contactInfo);
};

// Navigation to Detail Pages (Overlay)
window.navigateTo = function(pageId) {
    // Start Warp Effect
    isWarping = true;
    
    // Hide Timeline UI temporarily for immersion
    document.querySelector('.timeline-container').style.opacity = '0';
    document.querySelector('.timeline-header').style.opacity = '0';
    document.querySelector('.timeline-motto').style.opacity = '0';

    // Delay showing content to let warp play
    setTimeout(() => {
        // Show Detail Page Overlay
        detailPage.classList.add('visible');

        // Hide all contents first
        document.querySelectorAll('.detail-content').forEach(el => el.classList.remove('active'));

        // Show specific content
        const targetContent = document.getElementById(`detail-content-${pageId}`);
        if (targetContent) {
            targetContent.classList.add('active');
        }
        
        // Stop Warp Effect
        isWarping = false;
        
        // Hide Timeline BACK button and motto when Detail is open
        document.querySelector('.btn-back').style.display = 'none';
        document.querySelector('.timeline-motto').style.display = 'none';
        
    }, 1500); // 1.5s warp duration
};

window.closeDetail = function() {
    // Hide Detail Page Overlay
    detailPage.classList.remove('visible');
    document.querySelectorAll('.detail-content').forEach(el => el.classList.remove('active'));

    // Restore timeline UI
    document.querySelector('.timeline-container').style.opacity = '1';
    document.querySelector('.timeline-header').style.opacity = '1';
    document.querySelector('.timeline-motto').style.opacity = '1';
    
    // Show Timeline BACK button and motto
    document.querySelector('.btn-back').style.display = 'block';
    document.querySelector('.timeline-motto').style.display = 'block';
};
