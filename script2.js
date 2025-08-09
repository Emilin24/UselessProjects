document.addEventListener('DOMContentLoaded', function() {
   const loginBtn = document.getElementById('loginBtn');
   const movableImage = document.getElementById('movableImage');
   const targetImage = document.getElementById('targetImage');
   const loginForm = document.getElementById('loginForm');
   
   // Initially hide the images
   movableImage.style.display = 'none';
   targetImage.style.display = 'none';
   
   loginBtn.addEventListener('click', function(e) {
       e.preventDefault(); // Prevent form submission
       
       const username = document.getElementById('username').value.trim();
       const password = document.getElementById('password').value.trim();
       
       if (username && password) {
           // Create and show the pinky promise text
           createPinkyPromiseText();
           
           // Show the images after login button is clicked
           movableImage.style.display = 'block';
           targetImage.style.display = 'block';
           
           // Calculate responsive image size based on viewport
           const viewportWidth = window.innerWidth;
           const imageSize = Math.min(200, viewportWidth * 0.15); // Max 200px or 15% of viewport width
           
           // Set image sizes
           movableImage.style.width = imageSize + 'px';
           movableImage.style.height = imageSize + 'px';
           targetImage.style.width = imageSize + 'px';
           targetImage.style.height = imageSize + 'px';
           
           // Ensure images fit within viewport bounds
           const leftMargin = Math.max(10, (viewportWidth * 0.05)); // 5% margin or 10px minimum
           const rightMargin = Math.max(10, (viewportWidth * 0.05));
           const bottomMargin = Math.max(10, window.innerHeight * 0.1); // 10% from bottom or 10px minimum
           
           // Position the target image on left bottom (fixed positioning)
           targetImage.style.position = 'fixed';
           targetImage.style.left = leftMargin + 'px';
           targetImage.style.bottom = bottomMargin + 'px';
           targetImage.style.transform = 'none';
           targetImage.style.zIndex = '10';
           targetImage.style.right = 'auto'; // Clear any existing right positioning
           targetImage.style.top = 'auto'; // Clear any existing top positioning
           
           // Position the movable image on right bottom (fixed positioning)
           movableImage.style.position = 'fixed';
           movableImage.style.right = rightMargin + 'px';
           movableImage.style.bottom = bottomMargin + 'px';
           movableImage.style.transform = 'none';
           movableImage.style.zIndex = '20';
           movableImage.style.left = 'auto'; // Clear any existing left positioning
           movableImage.style.top = 'auto'; // Clear any existing top positioning
           
           // Make the movable image draggable
           makeDraggable(movableImage);
       } else {
           alert('Please enter both username and password');
       }
   });
   
   function createPinkyPromiseText() {
       // Remove existing text if it exists
       const existingText = document.getElementById('pinkyPromiseText');
       if (existingText) {
           existingText.remove();
       }
       
       // Create the pinky promise text element
       const promiseText = document.createElement('div');
       promiseText.id = 'pinkyPromiseText';
       promiseText.innerHTML = 'Do you pinky promise this is your account?';
       promiseText.style.position = 'fixed';
       promiseText.style.top = '20%';
       promiseText.style.left = '50%';
       promiseText.style.transform = 'translateX(-50%)';
       promiseText.style.fontSize = '24px';
       promiseText.style.fontWeight = 'bold';
       promiseText.style.color = '#333';
       promiseText.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
       promiseText.style.padding = '15px 25px';
       promiseText.style.borderRadius = '10px';
       promiseText.style.boxShadow = '0 4px 15px rgba(0,0,0,0.2)';
       promiseText.style.zIndex = '100';
       promiseText.style.textAlign = 'center';
       promiseText.style.border = '2px solid #667eea';
       promiseText.style.opacity = '0';
       promiseText.style.transition = 'opacity 0.5s ease-in';
       
       // Add to document
       document.body.appendChild(promiseText);
       
       // Fade in animation
       setTimeout(() => {
           promiseText.style.opacity = '1';
       }, 100);
   }
   
   function createConfetti() {
       // Create confetti container
       const confettiContainer = document.createElement('div');
       confettiContainer.id = 'confettiContainer';
       confettiContainer.style.position = 'fixed';
       confettiContainer.style.bottom = '0';
       confettiContainer.style.left = '0';
       confettiContainer.style.width = '100%';
       confettiContainer.style.height = '100%';
       confettiContainer.style.pointerEvents = 'none';
       confettiContainer.style.zIndex = '1000';
       confettiContainer.style.overflow = 'hidden';
       
       document.body.appendChild(confettiContainer);
       
       // Colors for confetti
       const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57', '#ff9ff3', '#54a0ff'];
       
       // Create multiple confetti pieces
       for (let i = 0; i < 100; i++) {
           setTimeout(() => {
               createConfettiPiece(confettiContainer, colors);
           }, i * 20); // Stagger the creation
       }
       
       // Remove confetti container after animation
       setTimeout(() => {
           if (confettiContainer.parentNode) {
               confettiContainer.parentNode.removeChild(confettiContainer);
           }
       }, 5000);
   }
   
   function createConfettiPiece(container, colors) {
       const confetti = document.createElement('div');
       const color = colors[Math.floor(Math.random() * colors.length)];
       const size = Math.random() * 8 + 4; // 4-12px
       const startX = Math.random() * window.innerWidth;
       const endX = startX + (Math.random() * 200 - 100); // Random horizontal drift
       const rotation = Math.random() * 360;
       const duration = Math.random() * 2 + 2; // 2-4 seconds
       
       confetti.style.position = 'absolute';
       confetti.style.width = size + 'px';
       confetti.style.height = size + 'px';
       confetti.style.backgroundColor = color;
       confetti.style.left = startX + 'px';
       confetti.style.bottom = '-10px';
       confetti.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px'; // Circle or square
       confetti.style.transform = `rotate(${rotation}deg)`;
       confetti.style.opacity = '0.8';
       
       container.appendChild(confetti);
       
       // Animate the confetti piece
       const animation = confetti.animate([
           {
               transform: `translateY(0px) translateX(0px) rotate(${rotation}deg)`,
               opacity: 0.8
           },
           {
               transform: `translateY(-${window.innerHeight + 100}px) translateX(${endX - startX}px) rotate(${rotation + 720}deg)`,
               opacity: 0
           }
       ], {
           duration: duration * 1000,
           easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
       });
       
       // Remove the confetti piece after animation
       animation.addEventListener('finish', () => {
           if (confetti.parentNode) {
               confetti.parentNode.removeChild(confetti);
           }
       });
   }
   
   function makeDraggable(element) {
       let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
       let isDragging = false;
       
       element.onmousedown = dragMouseDown;
       
       function dragMouseDown(e) {
           e = e || window.event;
           e.preventDefault();
           isDragging = true;
           
           // Get the initial mouse position
           pos3 = e.clientX;
           pos4 = e.clientY;
           
           document.onmouseup = closeDragElement;
           document.onmousemove = elementDrag;
           
           // Add visual feedback
           element.style.opacity = '0.8';
           element.style.cursor = 'grabbing';
       }
       
       function elementDrag(e) {
           if (!isDragging) return;
           
           e = e || window.event;
           e.preventDefault();
           
           // Calculate the new position
           pos1 = pos3 - e.clientX;
           pos2 = pos4 - e.clientY;
           pos3 = e.clientX;
           pos4 = e.clientY;
           
           // Calculate new position
           const newTop = element.offsetTop - pos2;
           const newLeft = element.offsetLeft - pos1;
           
           // Keep element within viewport bounds with padding
           const padding = 10;
           const maxTop = window.innerHeight - element.offsetHeight - padding;
           const maxLeft = window.innerWidth - element.offsetWidth - padding;
           
           element.style.top = Math.max(padding, Math.min(newTop, maxTop)) + 'px';
           element.style.left = Math.max(padding, Math.min(newLeft, maxLeft)) + 'px';
           element.style.right = 'auto'; // Clear right positioning
           element.style.bottom = 'auto'; // Clear bottom positioning
           
           // Check for collision with target image
           if (checkCollision(element, targetImage)) {
               // Trigger confetti explosion
               createConfetti();
               
               // Hide the pinky promise text
               const promiseText = document.getElementById('pinkyPromiseText');
               if (promiseText) {
                   promiseText.style.opacity = '0';
                   setTimeout(() => {
                       if (promiseText.parentNode) {
                           promiseText.parentNode.removeChild(promiseText);
                       }
                   }, 500);
               }
               
               // Delay redirect to allow confetti animation
               setTimeout(() => {
                   window.location.href = 'afterlogin.html';
               }, 2000);
           }
       }
       
       function closeDragElement() {
           // Stop moving when mouse button is released
           isDragging = false;
           document.onmouseup = null;
           document.onmousemove = null;
           
           // Reset visual feedback
           element.style.opacity = '1';
           element.style.cursor = 'move';
       }
   }
   
   function checkCollision(element1, element2) {
       const rect1 = element1.getBoundingClientRect();
       const rect2 = element2.getBoundingClientRect();
       
       // Check if elements overlap with some tolerance
       const tolerance = 30; // Increased tolerance for easier collision
       return !(
           rect1.right < rect2.left - tolerance || 
           rect1.left > rect2.right + tolerance || 
           rect1.bottom < rect2.top - tolerance || 
           rect1.top > rect2.bottom + tolerance
       );
   }
});