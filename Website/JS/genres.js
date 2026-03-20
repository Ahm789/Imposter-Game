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

      Sports: [
        { word: "Football", hints: { easy: ["Ball","Dead ball","Crossbar","Net","Foot"], medium: ["Pressing","Through","Stoppage","Post","Counter"], hard: ["Overlapping","Progressive","High line","Possession","Pressing"] }},
        { word: "American Football", hints: { easy: ["Throw","Helmet","Receiver","Touchdown","Catch"], medium: ["Blitz","Red zone","Screen","Pocket","Tight end"], hard: ["Nickel","Dime","Bunch","Mesh","Pigskin"] }},
        { word: "Tennis", hints: { easy: ["Yellow","Net","Racket","Love","Court"], medium: ["Tiebreak","Approach","Passing","Drop","Lob"], hard: ["Moonball","Topspin","Continental","Volley","Slice"] }},
        { word: "Cristiano Ronaldo", hints: { easy: ["Portugal","Seven","Header","Penalty","Right"], medium: ["Manchester","Juventus","Jump","Trophy","Champions"], hard: ["Sporting","Madeira","Forward","Scorer","Longevity"] }},
        { word: "Lionel Messi", hints: { easy: ["Argentina","Short","Barcelona","World Cup","Miami"], medium: ["False 9","Dribble","Left","Assists","Spain"], hard: ["PSG","Free kick","Smooth","Captain","Must watch"] }},
        { word: "Basketball", hints: { easy: ["Court","Hoop","Orange","Three","Guard"], medium: ["Wooden","Pick","Isolation","Paint","Shoot"], hard: ["Screen","Defence","Buzzer","Thunder","Transition"] }},
        { word: "LeBron James", hints: { easy: ["Lakers","King","Headband","Records","Akron"], medium: ["Heat","Clutch","Cleveland","Veteran","Sunshine"], hard: ["Longevity","Any position","Rim","Legacy","Greatest"] }},
        { word: "Usain Bolt", hints: { easy: ["Fast","Eight","Records","Pose","Jamaica"], medium: ["Beijing","Football","Track","Olympics","Dominance"], hard: ["Berlin","Tall","Greatest","Caribbean","Celebration"] }},
        { word: "Formula 1", hints: { easy: ["Flag","Stop","Car","Champagne","Monaco"], medium: ["Undercut","Overcut","Compound","Red Bull","Team Order"], hard: ["Energy","Parc Ferme","Abu Dhabi","CFD","Ground Effect"] }},
        { word: "Lewis Hamilton", hints: { easy: ["British","Seven","Champion","Records","Ferrari"], medium: ["Stevenage","Fashion","Dogs","McLaren","Best"], hard: ["Tattoos","Kardashian","Met Gala","Helmets","Silver"] }}
      ],

      Music: [
        { word: "Guitar", hints: { easy: ["Strings","Strum","Rock","Neck","Acoustic"], medium: ["Frets","Chords","Pick","Tune","Electric"], hard: ["Riff","Bridge","Resonance","Intonation","Tremolo"] }},
        { word: "Drum", hints: { easy: ["Hit","Bang","Beat","Sticks","Loud"], medium: ["Snare","Cymbal","Rhythm","Kit","Pedal"], hard: ["Tempo","Paradiddle","Rimshot","Rudiment","Syncopation"] }},
        { word: "Microphone", hints: { easy: ["Sing","Loud","Stage","Speak","Record"], medium: ["Wireless","Signal","Feedback","Cardioid","Studio"], hard: ["Phantom","Polar","Condenser","Proximity","Decibel"] }},
        { word: "Concert", hints: { easy: ["Live","Crowd","Stage","Loud","Tickets"], medium: ["Encore","Setlist","Venue","Backstage","Soundcheck"], hard: ["Rider","Acoustics","Earpiece","Rigging","FOH"] }},
        { word: "Chorus", hints: { easy: ["Repeat","Catchy","Sing","Hook","Loud"], medium: ["Verse","Melody","Bridge","Peak","Refrain"], hard: ["Modulate","Homophonic","Cadence","Antecedent","Dynamic"] }},
        { word: "Vinyl", hints: { easy: ["Round","Old","Spin","Crackle","Disc"], medium: ["Analog","Groove","Turntable","RPM","Needle"], hard: ["Lacquer","Pressing","Audiophile","Stylus","Mono"] }},
        { word: "Melody", hints: { easy: ["Tune","Hum","Notes","Whistle","Sing"], medium: ["Motif","Contour","Phrase","Harmony","Pitch"], hard: ["Inversion","Monophonic","Intervallic","Stepwise","Imitation"] }},
        { word: "Bass", hints: { easy: ["Low","Deep","Rumble","Feel","Bottom"], medium: ["Groove","Strings","Subwoofer","Funk","Vibration"], hard: ["Fundamental","Ostinato","Continuo","Inversion","Frequency"] }},
        { word: "Tempo", hints: { easy: ["Speed","Fast","Slow","Beat","BPM"], medium: ["Allegro","Adagio","Metronome","Rhythm","Pulse"], hard: ["Rubato","Fermata","Presto","Ritardando","Subdivision"] }},
        { word: "Lyrics", hints: { easy: ["Words","Sing","Rhyme","Song","Memorize"], medium: ["Verse","Story","Chorus","Metaphor","Songwriter"], hard: ["Prosody","Assonance","Enjambment","Melisma","Syllable"] }}
      ],

      Food: [
        { word: "Pizza", hints: { easy: ["Round","Cheesy","Slice","Crust","Deliver"], medium: ["Naples","Mozzarella","Dough","Foldable","Woodfired"], hard: ["Cornicione","Semolina","Hydration","DOP","Neapolitan"] }},
        { word: "Sushi", hints: { easy: ["Japanese","Raw","Chopsticks","Roll","Fish"], medium: ["Nori","Wasabi","Vinegar","Nigiri","Omakase"], hard: ["Shari","Neta","Shokunin","Umami","Fermented"] }},
        { word: "Chocolate", hints: { easy: ["Sweet","Brown","Melt","Bar","Cocoa"], medium: ["Dark","Temper","Cacao","Creamy","Bitter"], hard: ["Conching","Theobroma","Bloom","Origin","Fermentation"] }},
        { word: "Bread", hints: { easy: ["Baked","Flour","Loaf","Toast","Fluffy"], medium: ["Yeast","Gluten","Sourdough","Knead","Crust"], hard: ["Autolyse","Maillard","Crumb","Proofing","Steam"] }},
        { word: "Tacos", hints: { easy: ["Mexican","Shell","Meat","Salsa","Handheld"], medium: ["Tortilla","Cilantro","Lime","Street","Pork"], hard: ["Nixtamalization","Birria","Trompo","Masa","Molcajete"] }},
        { word: "Pasta", hints: { easy: ["Italian","Boiled","Sauce","Shapes","Flour"], medium: ["Aldente","Semolina","Egg","Extruded","Rigate"], hard: ["Gluten","Emulsify","DOP","Durum","Bronze"] }},
        { word: "Cheese", hints: { easy: ["Milk","Yellow","Melt","Sandwich","Slice"], medium: ["Aged","Rennet","Mold","Brie","Parmesan"], hard: ["Affinage","Casein","Terroir","Annatto","AOC"] }},
        { word: "Grill", hints: { easy: ["Fire","Outdoor","Marks","BBQ","Smoke"], medium: ["Charcoal","Direct","Indirect","Sear","Rested"], hard: ["Maillard","Flare","Thermometer","Zone","Fond"] }},
        { word: "Spice", hints: { easy: ["Hot","Flavor","Pepper","Jar","Sneeze"], medium: ["Cumin","Saffron","Bloom","Warming","Bark"], hard: ["Oleoresin","Terpenes","Piperine","Capsaicin","Volatile"] }},
        { word: "Cake", hints: { easy: ["Birthday","Sweet","Frosting","Candles","Baked"], medium: ["Sponge","Ganache","Layers","Buttercream","Tier"], hard: ["Emulsify","Leavening","Fondant","Crumb","Gravity"] }}
      ],

      Animals: [
        { word: "Elephant", hints: { easy: ["Big","Trunk","Tusks","Gray","Africa"], medium: ["Memory","Herd","Matriarch","Endangered","Ivory"], hard: ["Infrasound","Musth","Proboscis","Loxodonta","Temporal"] }},
        { word: "Shark", hints: { easy: ["Ocean","Teeth","Scary","Fast","Fin"], medium: ["Cartilage","Electroreception","Apex","Gills","Bite"], hard: ["Ampullae","Placoid","Nictitating","Countershading","Lateral"] }},
        { word: "Penguin", hints: { easy: ["Waddle","Cold","Flightless","BlackWhite","Swim"], medium: ["Antarctic","Huddle","Emperor","Blubber","Incubate"], hard: ["Countershading","Supraorbital","Molting","Porpoising","Brood"] }},
        { word: "Chameleon", hints: { easy: ["Color","Tongue","Lizard","Tree","Eyes"], medium: ["Mood","Zygodactyl","Madagascar","Grip","Camouflage"], hard: ["Iridophore","Nanocrystal","Casque","Turret","Accommodation"] }},
        { word: "Dolphin", hints: { easy: ["Jump","Smart","Click","Ocean","Friendly"], medium: ["Echolocation","Pod","Blowhole","Mimic","Sonar"], hard: ["Melon","NBHF","Spindle","Signature","Neocortex"] }},
        { word: "Owl", hints: { easy: ["Hoot","Night","Eyes","Rotate","Tree"], medium: ["Silent","Pellet","Nocturnal","Facial","Disc"], hard: ["Asymmetrical","Strigiformes","Serration","Binocular","Nictitating"] }},
        { word: "Cheetah", hints: { easy: ["Fast","Spots","Africa","Sprint","Lean"], medium: ["Claws","Purr","Exhausted","Agile","Hunter"], hard: ["Acinonyx","Dewclaw","Nasal","Spine","Stride"] }},
        { word: "Parrot", hints: { easy: ["Colorful","Talk","Jungle","Repeat","Bird"], medium: ["Mimic","Tropical","Lifespan","Beak","Zygodactyl"], hard: ["Syrinx","Psittacine","Powder","Psittaciformes","Mirror"] }},
        { word: "Kangaroo", hints: { easy: ["Hop","Pouch","Australia","Joey","Jump"], medium: ["Boomer","Balance","Box","Backward","Tail"], hard: ["Macropod","Diapause","Tendon","Dimorphic","Fermentation"] }},
        { word: "Octopus", hints: { easy: ["8Arms","Ink","Squishy","Ocean","Colorchange"], medium: ["Hearts","BlueBlood","Intelligent","Jar","Tentacles"], hard: ["Chromatophore","Distributed","Chitin","Iridophore","Papillae"] }}
      ],

      Travel: [
        { word: "Passport", hints: { easy: ["Booklet","Photo","Border","Travel","Stamp"], medium: ["Biometric","Visa","Government","Expire","Chip"], hard: ["ICAO","RFID","MRZ","Consular","Reciprocity"] }},
        { word: "Hotel", hints: { easy: ["Sleep","Room","Reception","Star","Key"], medium: ["Checkin","Concierge","Amenities","Loyalty","Suite"], hard: ["RevPAR","ADR","OTA","MICE","Yield"] }},
        { word: "Landmark", hints: { easy: ["Famous","Photo","Tourist","Historic","Icon"], medium: ["UNESCO","Identity","Protected","Postcard","Symbol"], hard: ["Geodetic","Intangible","Conservation","Covenant","Palimpsest"] }},
        { word: "Layover", hints: { easy: ["Wait","Airport","Hours","Terminal","Boring"], medium: ["Transit","Connecting","Lounge","Overnight","Visa"], hard: ["Interline","Misconnect","Protected","Hub","MCT"] }},
        { word: "Backpack", hints: { easy: ["Bag","Hike","Travel","Pockets","Shoulders"], medium: ["HipBelt","Carry-on","Locker","Straps","Volume"], hard: ["Torso","Frameless","Sternum","Liter","Rigidity"] }},
        { word: "Visa", hints: { easy: ["Permission","Embassy","Stamp","Entry","Apply"], medium: ["Tourist","Schengen","Multiple","Overstay","Online"], hard: ["Reciprocity","Biometric","NIV","POE","Bilateral"] }},
        { word: "Itinerary", hints: { easy: ["Plan","Schedule","Places","Days","List"], medium: ["Flexible","Buffer","Operator","Details","Route"], hard: ["CriticalPath","DwellTime","DMC","GDS","Logistics"] }},
        { word: "Souvenir", hints: { easy: ["Gift","Memory","Magnet","Keychain","Tourist"], medium: ["Authentic","Handmade","Edible","Customs","Kitsch"], hard: ["Commodification","Heritage","Terroir","McDonaldization","Material"] }},
        { word: "Hostel", hints: { easy: ["Cheap","Bunk","Share","Backpacker","Social"], medium: ["Locker","Kitchen","Dorm","Communal","Rating"], hard: ["RevPBed","HI","Occupancy","Interlining","Affiliate"] }},
        { word: "Resort", hints: { easy: ["Luxury","Pool","AllInclusive","Beach","Relax"], medium: ["Spa","Butler","Activities","Tier","Tropical"], hard: ["RevPAR","MICE","CompSet","F&B","Flag"] }}
      ],

      VideoGames: [
        { word: "Minecraft", hints: { easy: ["Microsoft","Cubes","Mojang","Sandbox","Steve"], medium: ["Survival","Creativity","Bed","Notch","Caves"], hard: ["Server","PvP","PvE","Alex","Open world"] }},
        { word: "GTA V", hints: { easy: ["Rockstar","Casino","Los Angeles","Heists","Wasted"], medium: ["Driving","Lamar","RPG","Third person","Loading screen"], hard: ["Open world","Story","Online","First person","Customisation"] }},
        { word: "Red Dead 2", hints: { easy: ["Bounty","Revolver","Horse","Arthur","Outlaw"], medium: ["West","Boah","Dead eye","Honor","Rifle"], hard: ["Tonic","Wolf","Open world","Ghosts","Hampshire"] }},
        { word: "Fortnite", hints: { easy: ["Shooter","Unreal engine","Skins","Bushes","Zone"], medium: ["Cars","Map","Vault","Glide","Stars"], hard: ["Kevin","Swimming","Weak point","Mantle","Barrel"] }},
        { word: "Mario Kart", hints: { easy: ["Banana","Racing","Boxes","Coins","Ghost"], medium: ["Mall","Water park","Dinosaur","Skeleton","Rocket"], hard: ["Villager","Draft","Lakitu","Shortcut","Glide"] }},
        { word: "Among Us", hints: { easy: ["Kill","Reports","Roles","Vote","Skip"], medium: ["Maps","Vitals","Ventilation","Skeld","Polus"], hard: ["Camping","Crew","Skeptical","Food","Airship"] }},
        { word: "FIFA", hints: { easy: ["Sport","Finesse","Kick","Run","Dive"], medium: ["Shadow","Rainbow","Counter","Ultimate","Draft"], hard: ["Through","Consumables","Green Time","Moments","Position"] }},
        { word: "Batman Arkham City", hints: { easy: ["Grapel","Arkham","City","Mobile","Hero"], medium: ["Pennyworth","Glide","Face","Predator","Knight"], hard: ["Hush","Falcone","Zsasz","Police station","Tyger"] }},
        { word: "Angry Birds", hints: { easy: ["Red","Sling","Fast","Bomb","King"], medium: ["Terence","Chuck","Ice","Wood","Glass"], hard: ["Blocks","Blues","Bubbles","Matilda","Fortress"] }},
        { word: "Roblox", hints: { easy: ["Avatar","Block","Gear","Servers","Sandbox"], medium: ["Bucks","Phone","Plaza","Tycoon","Simulator"], hard: ["Racing","Tool","Tower defence","Parkour","Plaza"] }}
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
    else if (typeof localStorage !== "undefined") {
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