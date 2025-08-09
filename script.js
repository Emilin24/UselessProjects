document.addEventListener('DOMContentLoaded', function () {
    // DOM elements
    const earth = document.querySelector('.earth');
    const earthOrbit = document.querySelector('.earth-orbit');
    const currentDateEl = document.getElementById('current-date');
    const physicsStatusEl = document.getElementById('physics-status');
    const orbitStabilityMeter = document.getElementById('orbit-stability-meter');
    const reminderText = document.getElementById('reminder-text');
    const setReminderBtn = document.getElementById('set-reminder'); // Fixed: consistent variable name
    const upgradeBtn = document.getElementById('upgrade-btn');
    const modal = document.getElementById('modal');
    const modalTitle = document.getElementById('modal-title');
    const modalMessage = document.getElementById('modal-message');
    const modalClose = document.getElementById('modal-close');
    const modalAction = document.getElementById('modal-action');
    const charCount = document.getElementById('char-count');
    const appVersionEl = document.querySelector('.app-version');

    // Create keyboard control hint
    const keyboardControl = document.createElement('div');
    keyboardControl.className = 'keyboard-control';
    keyboardControl.textContent = 'Use WASD keys to stabilize orbit';
    keyboardControl.style.display = 'none';
    document.body.appendChild(keyboardControl);

    // Physics variables
    let orbitSpeed = 0;
    let orbitAngle = 0;
    let isDragging = false;
    let dragStartAngle = 0;
    let physicsMode = false;
    let unstableOrbit = false;
    let orbitStability = 100;
    let currentYear = 3025;
    let extinctionTriggered = false;
    let stabilizeIntervalId = null;
    let lastDragTime = 0;
    const dragThrottle = 16; // ~60fps
    const daysPerYear = 365;
    let reminders = [];

function addReminderToBox(reminderText) {
    const list = document.getElementById('reminder-list');

    // Create list item
    const li = document.createElement('li');
    li.style.borderBottom = '1px solid #eee';
    li.style.padding = '5px 0';
    li.style.display = 'flex';
    li.style.alignItems = 'center';
    li.style.gap = '8px';

    // Create checkbox
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';

    // Create span for text
    const span = document.createElement('span');
    span.textContent = reminderText;

    // When checkbox is toggled, style the text
    checkbox.addEventListener('change', () => {
        if (checkbox.checked) {
            span.style.textDecoration = 'line-through';
            span.style.color = '#888';
        } else {
            span.style.textDecoration = 'none';
            span.style.color = '';
        }
    });

    // Append checkbox and text to li
    li.appendChild(checkbox);
    li.appendChild(span);

    // Add to list
    list.appendChild(li);

    // Save to localStorage if enabled
    let saved = JSON.parse(localStorage.getItem('reminders')) || [];
    saved.push(reminderText);
    localStorage.setItem('reminders', JSON.stringify(saved));
}


    // Initialize
    function init() {
        updateEarthPosition();
        updateDate();
        updateStabilityMeter();
        updateCharCount();
        
        // Make the button absolutely positioned so it can move
        setReminderBtn.style.position = 'absolute';
        setReminderBtn.style.zIndex = '1000';
    }
    init();

    // Event listeners
    earth.addEventListener('mousedown', startDrag);
    earth.addEventListener('touchstart', startDrag, { passive: false });
    document.addEventListener('mousemove', drag);
    document.addEventListener('touchmove', drag, { passive: false });
    document.addEventListener('mouseup', endDrag);
    document.addEventListener('touchend', endDrag);
    document.addEventListener('keydown', handleKeyDown);
    setReminderBtn.addEventListener('click',setReminder);
    upgradeBtn.addEventListener('click', showPremiumError);
    modalClose.addEventListener('click', closeModal);
    reminderText.addEventListener('input', updateCharCount);
    modalAction.addEventListener('click', function () {
        if (modalAction.textContent === 'Try Again') resetSimulation();
        closeModal();
    });
    
    // Evil button behavior - Super responsive and fast!
    const DETECTION_DISTANCE = 150; // Larger detection zone
    const MOVE_DISTANCE = 150; // How far the button jumps away
    let lastMoveTime = 0;
    const MOVE_COOLDOWN = 90; // Minimum time between moves (reduced for faster response)

    

    // High frequency mouse tracking - no throttling for maximum responsiveness
    document.addEventListener('mousemove', (e) => {
        const now = Date.now();
        // Prevent too frequent moves

        const mouseX = e.clientX;
        const mouseY = e.clientY;
        const buttonRect = setReminderBtn.getBoundingClientRect();
        
        // Calculate button center
        const buttonCenterX = buttonRect.left + buttonRect.width / 2;
        const buttonCenterY = buttonRect.top + buttonRect.height / 2;
        
        // Calculate distance from mouse to button center
        const distance = Math.sqrt(
            Math.pow(mouseX - buttonCenterX, 2) + 
            Math.pow(mouseY - buttonCenterY, 2)
        );
        
        // If mouse is too close, move the button away immediately
        if (distance < DETECTION_DISTANCE) {
            lastMoveTime = now;
            moveButtonAway(mouseX, mouseY, buttonRect);
        }
    });

    function moveButtonAway(mouseX, mouseY, buttonRect) {
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;
        
        // Calculate direction away from mouse
        const buttonCenterX = buttonRect.left + buttonRect.width / 2;
        const buttonCenterY = buttonRect.top + buttonRect.height / 2;
        
        let deltaX = buttonCenterX - mouseX;
        let deltaY = buttonCenterY - mouseY;
        
        // Normalize the direction
        const magnitude = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        if (magnitude === 0) {
            // If mouse is exactly on button, pick random direction
            deltaX = (Math.random() - 0.5) * 2;
            deltaY = (Math.random() - 0.5) * 2;
        } else {
            deltaX /= magnitude;
            deltaY /= magnitude;
        }
        
        // Add some randomness to make it more unpredictable
        const randomFactor = 0.3;
        deltaX += (Math.random() - 0.5) * randomFactor;
        deltaY += (Math.random() - 0.5) * randomFactor;
        
        // Calculate new position with variable move distance for more chaos
        const actualMoveDistance = MOVE_DISTANCE + Math.random() * 50;
        let newX = buttonRect.left + deltaX * actualMoveDistance;
        let newY = buttonRect.top + deltaY * actualMoveDistance;
        
        // Keep button within window bounds with padding
        const padding = 10; // Reduced padding so button can get closer to edges
        newX = Math.max(padding, Math.min(windowWidth - buttonRect.width - padding, newX));
        newY = Math.max(padding, Math.min(windowHeight - buttonRect.height - padding, newY));
        
        // Apply the new position with fast transition for snappy movement
        setReminderBtn.style.transition = 'all 0.15s ease-out';
        setReminderBtn.style.left = `${newX}px`;
        setReminderBtn.style.top = `${newY}px`;
        
        // Remove transition quickly for immediate subsequent moves
        setTimeout(() => {
            setReminderBtn.style.transition = 'all 0.05s ease-out';
        }, 150);
    }

    function moveButtonToRandomPosition() {
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;
        const buttonRect = setReminderBtn.getBoundingClientRect();
        
        const padding = 20;
        const newX = Math.random() * (windowWidth - buttonRect.width - 2 * padding) + padding;
        const newY = Math.random() * (windowHeight - buttonRect.height - 2 * padding) + padding;
        
        setReminderBtn.style.transition = 'all 0.2s ease-out';
        setReminderBtn.style.left = `${newX}px`;
        setReminderBtn.style.top = `${newY}px`;
    }

    function startDrag(e) {
        e.preventDefault();
        isDragging = true;
        const rect = earthOrbit.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const clientX = e.clientX || e.touches[0].clientX;
        const clientY = e.clientY || e.touches[0].clientY;
        dragStartAngle = Math.atan2(clientY - centerY, clientX - centerX);

        physicsMode = true;
        updateStabilityDisplay();
        keyboardControl.style.display = 'block';
    }

    function drag(e) {
        if (!isDragging || extinctionTriggered) return;
        e.preventDefault();

        const now = Date.now();
        if (now - lastDragTime < dragThrottle) return;
        lastDragTime = now;

        const rect = earthOrbit.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const clientX = e.clientX || e.touches[0].clientX;
        const clientY = e.clientY || e.touches[0].clientY;
        const angle = Math.atan2(clientY - centerY, clientX - centerX);

        const maxSpeed = 0.3;
        let speed = angle - dragStartAngle;
        speed = Math.max(-maxSpeed, Math.min(maxSpeed, speed));

        orbitSpeed = speed * 3;
        orbitAngle += speed;
        orbitAngle = ((orbitAngle % (2 * Math.PI)) + (orbitAngle < 0 ? 2 * Math.PI : 0));
        dragStartAngle = angle;

        updateOrbitStability(Math.abs(speed));
        updateEarthPosition();
        updateDate();
    }

    function updateOrbitStability(speed) {
        earthOrbit.classList.remove('unstable-orbit', 'critical-orbit');

        if (speed > 0.05) {
            unstableOrbit = true;
            orbitStability = Math.max(0, orbitStability - speed * 8);

            if (orbitStability < 30) {
                earthOrbit.classList.add('critical-orbit');
                if (orbitStability <= 0 && !extinctionTriggered) {
                    extinctionEvent();
                    return;
                }
            } else if (orbitStability < 70) {
                earthOrbit.classList.add('unstable-orbit');
            }
        } else {
            orbitStability = Math.min(100, orbitStability + 0.8);
        }

        updateStabilityDisplay();
    }

    function endDrag() {
        if (extinctionTriggered) return;
        isDragging = false;
        physicsMode = false;
        keyboardControl.style.display = 'none';
        earthOrbit.classList.remove('unstable-orbit', 'critical-orbit');

        if (stabilizeIntervalId) clearInterval(stabilizeIntervalId);

        stabilizeIntervalId = setInterval(() => {
            orbitSpeed *= 0.96;
            orbitAngle += orbitSpeed;
            orbitAngle = ((orbitAngle % (2 * Math.PI)) + (orbitAngle < 0 ? 2 * Math.PI : 0));
            orbitStability = Math.min(100, orbitStability + 0.8);

            updateEarthPosition();
            updateDate();
            updateStabilityDisplay();

            if (Math.abs(orbitSpeed) < 0.001) {
                clearInterval(stabilizeIntervalId);
                stabilizeIntervalId = null;
                unstableOrbit = false;
                updateStabilityDisplay();
            }
        }, 16);
    }

    function handleKeyDown(e) {
        if (extinctionTriggered || !physicsMode) return;

        const force = 0.004;
        const stabilityGain = 0.8;

        switch (e.key.toLowerCase()) {
            case 'w': orbitSpeed -= force; break;
            case 's': orbitSpeed += force; break;
            case 'a': orbitSpeed -= force * 2; break;
            case 'd': orbitSpeed += force * 2; break;
            default: return;
        }

        orbitStability = Math.min(100, orbitStability + stabilityGain);
        updateEarthPosition();
        updateDate();
        updateStabilityDisplay();
    }

    function updateEarthPosition() {
        const radius = earthOrbit.offsetWidth / 2;
        const x = Math.cos(orbitAngle) * radius;
        const y = Math.sin(orbitAngle) * radius;
        earth.style.transform = `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`;
    }

    function updateDate() {
        const totalOrbits = orbitAngle / (2 * Math.PI);
        const totalDays = totalOrbits * daysPerYear;
        const yearsPassed = Math.floor(totalDays / daysPerYear);
        currentYear = 3025 + yearsPassed;
        const dayOfYear = Math.floor(totalDays % daysPerYear);

        const date = new Date(currentYear, 0, 1);
        date.setDate(dayOfYear + 1);

        const options = { month: 'long', day: 'numeric' };
        currentDateEl.textContent = `${date.toLocaleDateString('en-US', options)}, ${currentYear}`;
        appVersionEl.textContent = `v1.0.0 - Free Trial (Year ${currentYear} Only)`;
    }

    function updateStabilityDisplay() {
        orbitStabilityMeter.style.width = `${orbitStability}%`;

        if (orbitStability < 30) {
            orbitStabilityMeter.style.background = 'var(--orbit-danger)';
            physicsStatusEl.textContent = "CRITICAL ORBIT INSTABILITY!";
        } else if (orbitStability < 70) {
            orbitStabilityMeter.style.background = 'var(--orbit-warning)';
            physicsStatusEl.textContent = "Unstable Orbit - Danger!";
        } else {
            orbitStabilityMeter.style.background = 'var(--orbit-stable)';
            physicsStatusEl.textContent = physicsMode ? "Physics Mode Active" : "Orbit Stable";
        }
    }

    function updateStabilityMeter() {
        orbitStabilityMeter.style.width = `${orbitStability}%`;
        updateStabilityDisplay();
    }

    function extinctionEvent() {
        extinctionTriggered = true;
        earth.classList.add('earth-extinct');

        if (stabilizeIntervalId) {
            clearInterval(stabilizeIntervalId);
            stabilizeIntervalId = null;
        }

        showModal(
            "🌌 Cosmic Catastrophe 🌌",
            "Oops, you caused an extinction event!\n\nEarth has been flung out of orbit.\nTry again in 65 million years.",
            "Try Again"
        );

        setTimeout(resetSimulation, 3000);
    }

    function resetSimulation() {
        orbitAngle = 0;
        orbitSpeed = 0;
        orbitStability = 100;
        unstableOrbit = false;
        physicsMode = false;
        extinctionTriggered = false;
        currentYear = 3025;

        earth.classList.remove('earth-extinct');
        earthOrbit.classList.remove('unstable-orbit', 'critical-orbit');
        updateStabilityDisplay();
        updateEarthPosition();
        updateDate();
    }

    function setReminder() {
        const reminder = reminderText.value.trim();

        if (!reminder) {
            showModal("No Reminder", "Please enter a reminder text.", "OK");
            return;
            // After showModal(...) in setReminder()


        }

        if (Math.random() < 0.2) {
            showModal(
                "☀️ Solar Flare Warning ☀️",
                "A solar flare wiped your reminder because 'the Sun got mad.'\n\nTry again when the Sun is in a better mood.",
                "OK"
            );
            addReminderToBox(reminder);
            return;
        }

        showModal(
            "🚀 Reminder Set",
            `"${reminder}" has been scheduled for:\n\n${currentDateEl.textContent}\n\nGood luck remembering across spacetime!`,
            "OK"
        );
        addReminderToBox(reminder);

    }
    function showPremiumError() {
        showModal(
            "💸 Payment Gateway Lost in Space 💸",
            "Our developers went to touch some cosmic grass.\n\nPremium features are temporarily unavailable while we retrieve our payment satellite from Jupiter's orbit.\n\nTry again later!",
            "Maybe Later"
        );
    }

    function showModal(title, message, actionText = "OK") {
        modalTitle.textContent = title;
        modalMessage.innerHTML = message.replace(/\n/g, '<br>');
        modalAction.textContent = actionText;
        modalAction.style.display = 'inline-block';
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }

    function closeModal() {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }

    function updateCharCount() {
        const count = reminderText.value.length;
        charCount.textContent = count;

        if (count >= 50) {
            charCount.style.color = 'var(--orbit-danger)';
        } else if (count >= 45) {
            charCount.style.color = 'var(--orbit-warning)';
        } else {
            charCount.style.color = '#aaa';
        }
    }
});