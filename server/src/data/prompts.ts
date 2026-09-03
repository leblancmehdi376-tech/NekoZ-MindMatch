import type { Prompt } from '@nekozmindmatch/shared';

let counter = 0;
function p(category: string, title: string, subtitle?: string, emoji?: string): Prompt {
  counter += 1;
  return { id: `p${counter}`, category, title, subtitle, emoji };
}

export const CATEGORIES = [
  'Anime',
  'Perso Jeu Vidéo',
  'Jeu Vidéo',
  'Films',
  'Séries',
  'Objets',
  'Animaux',
  'Nourriture',
  'Lieux',
  'Situations',
  'Memes & Personnalités',
] as const;

export const PROMPTS: Prompt[] = [
  // Anime
  p('Anime', 'Gojo Satoru', 'Jujutsu Kaisen', '🕶️'),
  p('Anime', 'Hakari', 'Jujutsu Kaisen', '🎰'),
  p('Anime', 'Naruto Uzumaki', 'Naruto', '🍥'),
  p('Anime', 'Luffy', 'One Piece', '🏴‍☠️'),
  p('Anime', 'Light Yagami', 'Death Note', '📓'),
  p('Anime', 'Saitama', 'One Punch Man', '👊'),
  p('Anime', 'Eren Yeager', "L'Attaque des Titans", '🧱'),
  p('Anime', 'Goku', 'Dragon Ball', '🐉'),
  p('Anime', 'Levi Ackerman', "L'Attaque des Titans", '⚔️'),
  p('Anime', 'Denji', 'Chainsaw Man', '🪚'),
  p('Anime', 'Rem', 'Re:Zero', '💙'),
  p('Anime', 'All Might', 'My Hero Academia', '💪'),

  // Perso Jeu Vidéo
  p('Perso Jeu Vidéo', 'Mario', undefined, '🍄'),
  p('Perso Jeu Vidéo', 'Kratos', 'God of War', '🪓'),
  p('Perso Jeu Vidéo', 'Master Chief', 'Halo', '🪖'),
  p('Perso Jeu Vidéo', 'Lara Croft', 'Tomb Raider', '🏺'),
  p('Perso Jeu Vidéo', 'Link', 'The Legend of Zelda', '🛡️'),
  p('Perso Jeu Vidéo', 'Sonic', undefined, '💨'),
  p('Perso Jeu Vidéo', 'Geralt de Riv', 'The Witcher', '🐺'),
  p('Perso Jeu Vidéo', 'Pikachu', 'Pokémon', '⚡'),
  p('Perso Jeu Vidéo', 'Solid Snake', 'Metal Gear Solid', '🐍'),
  p('Perso Jeu Vidéo', 'Arthur Morgan', 'Red Dead Redemption 2', '🤠'),

  // Jeu Vidéo
  p('Jeu Vidéo', 'Minecraft', undefined, '⛏️'),
  p('Jeu Vidéo', 'League of Legends', undefined, '⚔️'),
  p('Jeu Vidéo', 'Fortnite', undefined, '🪂'),
  p('Jeu Vidéo', 'GTA V', undefined, '🚔'),
  p('Jeu Vidéo', 'Among Us', undefined, '🔪'),
  p('Jeu Vidéo', 'The Sims', undefined, '🏠'),
  p('Jeu Vidéo', 'Elden Ring', undefined, '💍'),
  p('Jeu Vidéo', 'Valorant', undefined, '🎯'),
  p('Jeu Vidéo', 'Animal Crossing', undefined, '🍃'),
  p('Jeu Vidéo', 'FIFA', undefined, '⚽'),

  // Films
  p('Films', 'Titanic', undefined, '🚢'),
  p('Films', 'Star Wars', undefined, '🚀'),
  p('Films', 'Le Seigneur des Anneaux', undefined, '💍'),
  p('Films', 'Jurassic Park', undefined, '🦖'),
  p('Films', 'Avengers: Endgame', undefined, '🦸'),
  p('Films', 'Le Roi Lion', undefined, '🦁'),
  p('Films', 'Harry Potter', undefined, '⚡'),
  p('Films', 'Shrek', undefined, '🧅'),
  p('Films', 'Joker', undefined, '🃏'),
  p('Films', 'Interstellar', undefined, '🌌'),

  // Séries
  p('Séries', 'Game of Thrones', undefined, '🐉'),
  p('Séries', 'Breaking Bad', undefined, '🧪'),
  p('Séries', 'Friends', undefined, '☕'),
  p('Séries', 'Stranger Things', undefined, '🚲'),
  p('Séries', 'The Office', undefined, '📎'),
  p('Séries', 'Peaky Blinders', undefined, '🎩'),
  p('Séries', 'Squid Game', undefined, '🦑'),
  p('Séries', 'La Casa de Papel', undefined, '💰'),

  // Objets
  p('Objets', 'Un parapluie', undefined, '☂️'),
  p('Objets', 'Une bougie', undefined, '🕯️'),
  p('Objets', 'Un miroir', undefined, '🪞'),
  p('Objets', 'Un couteau suisse', undefined, '🔪'),
  p('Objets', 'Une horloge', undefined, '🕰️'),
  p('Objets', 'Un aimant', undefined, '🧲'),
  p('Objets', 'Une échelle', undefined, '🪜'),
  p('Objets', 'Un cadenas', undefined, '🔒'),

  // Animaux
  p('Animaux', 'Le renard', undefined, '🦊'),
  p('Animaux', 'Le paresseux', undefined, '🦥'),
  p('Animaux', 'Le requin', undefined, '🦈'),
  p('Animaux', 'Le poulpe', undefined, '🐙'),
  p('Animaux', 'Le panda', undefined, '🐼'),
  p('Animaux', 'Le corbeau', undefined, '🐦‍⬛'),
  p('Animaux', 'La hyène', undefined, '🐆'),
  p('Animaux', "L'aigle", undefined, '🦅'),

  // Nourriture
  p('Nourriture', 'La pizza', undefined, '🍕'),
  p('Nourriture', 'Les sushis', undefined, '🍣'),
  p('Nourriture', 'Le kebab', undefined, '🥙'),
  p('Nourriture', 'La raclette', undefined, '🧀'),
  p('Nourriture', 'Le popcorn', undefined, '🍿'),
  p('Nourriture', 'Les pâtes', undefined, '🍝'),
  p('Nourriture', 'Le chocolat', undefined, '🍫'),
  p('Nourriture', 'La baguette', undefined, '🥖'),

  // Lieux
  p('Lieux', 'Paris', undefined, '🗼'),
  p('Lieux', 'Un hôpital', undefined, '🏥'),
  p('Lieux', 'Une prison', undefined, '⛓️'),
  p('Lieux', 'Las Vegas', undefined, '🎰'),
  p('Lieux', 'Un cimetière', undefined, '🪦'),
  p('Lieux', 'Une bibliothèque', undefined, '📚'),
  p('Lieux', "Le pôle Nord", undefined, '🧊'),
  p('Lieux', 'Un aéroport', undefined, '✈️'),

  // Situations
  p('Situations', 'Se faire larguer par SMS', undefined, '💔'),
  p('Situations', 'Perdre son mot de passe', undefined, '🔐'),
  p('Situations', 'Arriver en retard à un mariage', undefined, '💒'),
  p('Situations', 'Rater son bus de justesse', undefined, '🚌'),
  p('Situations', 'Se tromper de groupe WhatsApp', undefined, '📱'),
  p('Situations', 'Oublier un anniversaire', undefined, '🎂'),
  p('Situations', "Tomber en panne d'essence", undefined, '⛽'),
  p('Situations', 'Se faire contrôler sans ticket', undefined, '🎫'),

  // Memes & Personnalités
  p('Memes & Personnalités', 'Un influenceur Instagram', undefined, '📸'),
  p('Memes & Personnalités', 'Un streamer Twitch', undefined, '🎮'),
  p('Memes & Personnalités', 'Un vendeur de crypto', undefined, '🪙'),
  p('Memes & Personnalités', 'Un coach de développement personnel', undefined, '🧘'),
  p('Memes & Personnalités', 'Un politicien en campagne', undefined, '🎤'),
  p('Memes & Personnalités', 'Un influenceur voyage', undefined, '✈️'),
  p('Memes & Personnalités', 'Un youtubeur gaming', undefined, '🕹️'),
];
