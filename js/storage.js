const AppStorage = {
    getFavorites: () => JSON.parse(localStorage.getItem('vibescape_favs') || '[]'),
    
    addFavorite: (song) => {
        const favs = AppStorage.getFavorites();
        if(!favs.find(s => s.id === song.id)) {
            favs.push(song);
            localStorage.setItem('vibescape_favs', JSON.stringify(favs));
        }
    },
    
    removeFavorite: (songId) => {
        const favs = AppStorage.getFavorites().filter(s => s.id !== songId);
        localStorage.setItem('vibescape_favs', JSON.stringify(favs));
    },
    
    isFavorite: (songId) => {
        return AppStorage.getFavorites().some(s => s.id === songId);
    },
    
    getRecent: () => JSON.parse(localStorage.getItem('vibescape_recent') || '[]'),
    
    addRecent: (song) => {
        let recents = AppStorage.getRecent();
        recents = recents.filter(s => s.id !== song.id); // remove duplicate
        recents.unshift(song);
        if(recents.length > 6) recents.pop();
        localStorage.setItem('vibescape_recent', JSON.stringify(recents));
    }
};
