class GenreManager {
  constructor() {
    this.genres = {
      General: [
        { word: "Computer", hints: { easy: ["Keyboard","Screen","Mouse","Internet","Software"], medium: ["Device","Technology","Monitor","Input","Laptop"], hard: ["Machine","Processing","CPU","Circuit","Binary"] }},
        { word: "Mountain", hints: { easy: ["Climb","Snow","Peak","Hiking","Rock"], medium: ["Slope","Range","Trail","Summit","Elevation"], hard: ["Geology","Terrain","Altitude","Landform","Formation"] }},
        { word: "River", hints: { easy: ["Water","Boat","Flow","Bridge","Fish"], medium: ["Stream","Current","Bank","Delta","Estuary"], hard: ["Hydrology","Aquatic","Meander","Watershed","Fluvial"] }},
        { word: "Airport", hints: { easy: ["Plane","Passport","Flight","Luggage","Terminal"], medium: ["Runway","Check-in","Gate","Arrival","Departure"], hard: ["Aviation","Hub","Airline","Control Tower","Tarmac"] }},
        { word: "Hospital", hints: { easy: ["Doctor","Nurse","Emergency","Medicine","Surgery"], medium: ["Ward","Clinic","Treatment","Patient","Operation"], hard: ["Healthcare","Medical Facility","Therapy","Diagnosis","Intensive Care"] }},
        { word: "Market", hints: { easy: ["Shop","Food","Cash","Crowd","Stalls"], medium: ["Bazaar","Vendor","Commerce","Goods","Crowded"], hard: ["Economy","Trade","Exchange","Retail","Merchandise"] }},
        { word: "Library", hints: { easy: ["Books","Quiet","Study","Shelf","Borrow"], medium: ["Reading","Archives","Catalog","Reference","Librarian"], hard: ["Literature","Information","Repository","Scholarship","Manuscripts"] }},
        { word: "Forest", hints: { easy: ["Trees","Wildlife","Nature","Camping","Trail"], medium: ["Woods","Vegetation","Hike","Canopy","Habitat"], hard: ["Ecosystem","Biome","Flora","Fauna","Conservation"] }},
        { word: "Bridge", hints: { easy: ["River","Cross","Traffic","Road","Structure"], medium: ["Span","Support","Arch","Engineering","Connection"], hard: ["Infrastructure","Civil Engineering","Suspension","Load Bearing","Architecture"] }},
        { word: "Beach", hints: { easy: ["Sand","Sea","Waves","Sun","Swim"], medium: ["Coast","Shore","Tide","Vacation","Surf"], hard: ["Geography","Erosion","Marine","Recreation","Coastal Zone"] }}
      ],

      Football: [
        { word: "Neymar", hints: { easy: ["Brazil","Skill","PSG","Dribble","Barcelona"], medium: ["Forward","Footballer","Famous","Transfer","National Team"], hard: ["Athlete","Soccer","Sports Star","World Cup","Professional"] }},
        { word: "Mbappé", hints: { easy: ["France","Speed","PSG","World Cup","Goal"], medium: ["Forward","Striker","Famous","Champion","Club"], hard: ["Athlete","Soccer","Sports Star","International","Professional"] }},
        { word: "Champions League", hints: { easy: ["Europe","Trophy","Final","UEFA","Clubs"], medium: ["Competition","Teams","Winner","Tournament","Season"], hard: ["Football","European Cup","Elite Clubs","International","Prestige"] }},
        { word: "Free Kick", hints: { easy: ["Wall","Curve","Foul","Goalkeeper","Shot"], medium: ["Set Piece","Indirect","Direct","Penalty Area","Kick"], hard: ["Tactical","Football Rule","Strategy","Execution","Soccer Technique"] }},
        { word: "Offside", hints: { easy: ["Rule","Line","Assistant Referee","Attack","Flag"], medium: ["Position","Penalty","Pass","Defense","Violation"], hard: ["Regulation","Soccer Tactic","Spatial Awareness","Game Rule","Match Enforcement"] }},
        { word: "Goalkeeper", hints: { easy: ["Gloves","Save","Penalty","Net","Dive"], medium: ["Goal","Defender","Shot Stopper","Position","Protection"], hard: ["Soccer Role","Custodian","Defense","Team Strategy","Athlete"] }},
        { word: "Barcelona", hints: { easy: ["Spain","Messi","Club","Stadium","Camp Nou"], medium: ["La Liga","Catalonia","Famous Team","Europe","Coach"], hard: ["Football Club","Soccer","Professional Team","League","Sports Institution"] }},
        { word: "Red Card", hints: { easy: ["Foul","Referee","Send Off","Player","Yellow Card"], medium: ["Discipline","Penalty","Game","Offense","Ejection"], hard: ["Soccer Rule","Punishment","Violation","Sportsmanship","Authority"] }}
      ],

      Music: [
        { word: "Taylor Swift", hints: { easy: ["Pop","Eras Tour","Album","Singer","Grammy"], medium: ["Songwriter","Tour","Famous","Hits","Performer"], hard: ["Artist","Music Industry","Celebrity","Discography","Entertainment"] }},
        { word: "Eminem", hints: { easy: ["Rap","Lose Yourself","Detroit","Lyrics","Fast"], medium: ["Rapper","Hip Hop","Famous","Albums","MC"], hard: ["Artist","Music Industry","Performer","Lyricist","Entertainment"] }},
        { word: "Drums", hints: { easy: ["Beat","Rhythm","Band","Sticks","Percussion"], medium: ["Instrument","Play","Music","Sound","Tempo"], hard: ["Percussion","Musical Equipment","Ensemble","Composition","Performance"] }},
        { word: "Violin", hints: { easy: ["Strings","Bow","Orchestra","Classical","Music"], medium: ["Instrument","Play","Famous","Concert","Sound"], hard: ["Orchestral","String Instrument","Composition","Technique","Performance"] }},
        { word: "Spotify", hints: { easy: ["Streaming","Playlist","Songs","App","Premium"], medium: ["Music App","Library","Subscription","Tracks","Listen"], hard: ["Digital Platform","Streaming Service","Audio","Entertainment","Music Technology"] }},
        { word: "DJ", hints: { easy: ["Club","Mix","Turntable","Party","Beat"], medium: ["Music","Performer","Nightlife","Mixing","Dance"], hard: ["Artist","Audio Mixing","Entertainment","Performance","Disc Jockey"] }},
        { word: "Guitar", hints: { easy: ["Strings","Play","Music","Band","Pick"], medium: ["Instrument","Chord","Solo","Strum","Acoustic"], hard: ["Musical Instrument","Performance","Composition","Orchestra","Technique"] }},
        { word: "Piano", hints: { easy: ["Keys","Music","Play","Melody","Classical"], medium: ["Instrument","Compose","Sheet Music","Concert","Sound"], hard: ["Musical Instrument","Performance","Technique","Composition","Entertainment"] }}
      ],

      Movies: [
        { word: "Inception", hints: { easy: ["Dream","Christopher Nolan","Mind","Heist","Leonardo DiCaprio"], medium: ["Film","Sci-Fi","Director","Plot","Thief"], hard: ["Movie","Cinema","Psychology","Suspense","Concept"] }},
        { word: "Marvel", hints: { easy: ["Superhero","Avengers","MCU","Comics","Iron Man"], medium: ["Comics","Movies","Fiction","Team","Universe"], hard: ["Entertainment","Film Franchise","Media","Pop Culture","Action"] }},
        { word: "Horror", hints: { easy: ["Scary","Ghost","Scream","Dark","Monster"], medium: ["Fear","Film","Thriller","Suspense","Story"], hard: ["Cinema Genre","Emotion","Psychology","Atmosphere","Entertainment"] }},
        { word: "Animation", hints: { easy: ["Cartoon","Pixar","Draw","Family","Voice Actor"], medium: ["Film","CGI","Movie","Characters","Studio"], hard: ["Entertainment","Visual Art","Cinema","Technique","Production"] }},
        { word: "Avatar", hints: { easy: ["Pandora","Blue","James Cameron","Sci-Fi","3D"], medium: ["Film","Fantasy","Characters","CGI","Box Office"], hard: ["Cinema","Science Fiction","Visual Effects","Director","Epic"] }},
        { word: "Joker", hints: { easy: ["Villain","Batman","Chaos","Clown","Gotham"], medium: ["DC","Comics","Movie","Character","Psychology"], hard: ["Film","Cinema","Character Study","Crime","Storytelling"] }},
        { word: "Titanic", hints: { easy: ["Ship","Rose","Jack","Ocean","Iceberg"], medium: ["Film","Romance","Disaster","Leonardo DiCaprio","History"], hard: ["Cinema","Epic","Tragedy","Historical Event","Box Office"] }},
        { word: "Star Wars", hints: { easy: ["Space","Lightsaber","Force","Jedi","Darth Vader"], medium: ["Saga","Movie","Galaxy","Adventure","Empire"], hard: ["Franchise","Science Fiction","Cinema","Pop Culture","Storytelling"] }}
      ],

      VideoGames: [
        { word: "Fortnite", hints: { easy: ["Battle Royale","Skins","Build","Victory Royale","Epic Games"], medium: ["Shooter","Multiplayer","Game","Season","Map"], hard: ["Video Game","Strategy","Online","Entertainment","Competition"] }},
        { word: "Minecraft", hints: { easy: ["Blocks","Survival","Craft","Creeper","Sandbox"], medium: ["Game","Build","Adventure","Multiplayer","Resources"], hard: ["Video Game","Construction","Virtual World","Simulation","Open World"] }},
        { word: "FIFA", hints: { easy: ["Football","EA Sports","Ultimate Team","Career Mode","Goals"], medium: ["Soccer","Game","Simulation","Clubs","Tournaments"], hard: ["Sports Game","Video Game","Competition","Strategy","Entertainment"] }},
        { word: "Call of Duty", hints: { easy: ["Shooter","War","Multiplayer","Zombies","FPS"], medium: ["Game","Combat","Mission","Campaign","Weapons"], hard: ["Video Game","Strategy","Tactics","Entertainment","Simulation"] }},
        { word: "PlayStation", hints: { easy: ["Console","Sony","Controller","Games","PS5"], medium: ["Gaming","System","Platform","Entertainment","Hardware"], hard: ["Video Game Console","Technology","Brand","Digital","Media"] }},
        { word: "Nintendo", hints: { easy: ["Mario","Switch","Zelda","Console","Japan"], medium: ["Games","Platform","Characters","Franchise","Entertainment"], hard: ["Video Game Company","Industry","Brand","Software","Global"] }},
        { word: "Among Us", hints: { easy: ["Crewmate","Imposter","Space","Tasks","Game"], medium: ["Multiplayer","Suspicion","Strategy","Players","Online"], hard: ["Social Deduction","Video Game","Teamwork","Gameplay","Communication"] }},
        { word: "League of Legends", hints: { easy: ["Champion","MOBA","Summoner","Lane","Minions"], medium: ["Strategy","Game","Multiplayer","Team","Skills"], hard: ["Video Game","Competition","Esports","Tactics","Entertainment"] }}
      ]
    };
  }

  getGenres() {
    return Object.keys(this.genres);
  }

  getRandomWord(genre) {
    // If genre is "Random", pick a real one
    if (genre === "Random") {
      const genres = Object.keys(this.genres);
      genre = genres[Math.floor(Math.random() * genres.length)];

      // Optional: store the chosen genre for later (like hints)
      localStorage.setItem("Gamegenre", genre);
    }
    else{
      localStorage.setItem("Gamegenre", genre);
    }

    const words = this.genres[genre];
    if (!words) return null;

    const randomIndex = Math.floor(Math.random() * words.length);
    return words[randomIndex]; // returns full object
  }

  // Get random hint for selected word with difficulty
  getHintWord(genre, actualWord, difficulty = "easy") {
    const words = this.genres[genre];
    if (!words) return null;

    const wordObj = words.find(w => w.word === actualWord);
    if (!wordObj || !wordObj.hints[difficulty]) return null;

    const hintsArray = wordObj.hints[difficulty];
    const randomIndex = Math.floor(Math.random() * hintsArray.length);
    return hintsArray[randomIndex];
  }
}

if (typeof window !== "undefined") window.GenreManager = GenreManager;
if (typeof module !== "undefined") module.exports = GenreManager;