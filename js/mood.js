const Mood = {
    current: 'happy', // default mood
    
    set: (moodStr) => {
        Mood.current = moodStr;
        
        // Change body class to switch CSS color variables and gradients
        document.body.className = `mood-${moodStr}`;
        
        // Update active states on mood buttons globally
        document.querySelectorAll('.mood-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.mood === moodStr);
        });
        
        Mood.createParticles(moodStr);
    },
    
    createParticles: (mood) => {
        const container = document.getElementById('particles');
        if (!container) return;
        container.innerHTML = '';
        
        const numParticles = mood === 'energetic' ? 40 : (mood === 'sad' ? 20 : 30);
        for (let i = 0; i < numParticles; i++) {
            const particle = document.createElement('div');
            particle.className = `particle ${mood}`;
            
            const size = Math.random() * 8 + 4;
            particle.style.width = `${size}px`;
            particle.style.height = `${size}px`;
            particle.style.left = `${Math.random() * 100}vw`;
            particle.style.top = `${Math.random() * 100}vh`;
            particle.style.setProperty('--peak-op', Math.random() * 0.5 + 0.2);
            
            const duration = mood === 'energetic' ? (Math.random() * 3 + 3) : 
                             (mood === 'sad' ? (Math.random() * 15 + 15) : (Math.random() * 8 + 6));
            
            particle.style.animationDuration = `${duration}s`;
            particle.style.animationDelay = `${Math.random() * 5}s`;
            
            container.appendChild(particle);
        }
    }
};
