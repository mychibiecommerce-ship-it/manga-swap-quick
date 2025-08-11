import { Manga, User, Exchange, Collection, Reward } from '../types';

// ===== DONNÉES VIDES POUR LA PRODUCTION =====
// Les utilisateurs réels ajouteront leurs propres contenus

export const mockMangas: Manga[] = [];

export const mockUsers: User[] = [
  // Utilisateur par défaut pour les tests
  {
    id: 'current_user',
    pseudo: 'MonPseudo',
    email: 'user@example.com',
    city: 'Ma Ville',
    level: 1,
    xp: 0,
    avatarUri: 'https://via.placeholder.com/200x200.png?text=👤',
    joinDate: new Date(),
    totalSwaps: 0,
    successfulSwaps: 0,
    rating: 0,
    badges: [],
    bio: 'Nouveau sur Manga Swap ! Ajoutez votre bio dans les paramètres.',
  }
];

export const mockExchanges: Exchange[] = [];

export const mockMyCollection: Collection[] = [];

export const mockWishedMangas: Manga[] = [];

export const mockConversations = [];

export const mockRewards: Reward[] = [
  // Récompenses de base pour la gamification
  {
    id: 'welcome_badge',
    name: 'Bienvenue !',
    description: 'Premier pas sur Manga Swap',
    icon: '🎉',
    type: 'badge',
    unlocked: true,
    unlockedAt: new Date(),
    xpValue: 10,
  },
  {
    id: 'first_manga_badge',
    name: 'Premier Manga',
    description: 'Ajout de votre premier manga',
    icon: '📚',
    type: 'badge',
    unlocked: false,
    xpValue: 50,
  },
  {
    id: 'first_exchange_badge',
    name: 'Premier Échange',
    description: 'Votre premier échange réussi',
    icon: '🤝',
    type: 'badge',
    unlocked: false,
    xpValue: 100,
  },
  {
    id: 'collector_badge',
    name: 'Collectionneur',
    description: '10 mangas dans votre collection',
    icon: '🏆',
    type: 'badge',
    unlocked: false,
    xpValue: 200,
  },
  {
    id: 'social_badge',
    name: 'Social',
    description: '5 conversations actives',
    icon: '💬',
    type: 'badge',
    unlocked: false,
    xpValue: 150,
  }
];

// Données pour les échanges (vides)
export const mockMyMangas: Manga[] = [];
export const mockRequesterMangas: Manga[] = [];

// Messages de bienvenue pour les écrans vides
export const emptyStateMessages = {
  noMangas: {
    title: "Aucun manga disponible",
    subtitle: "Soyez le premier à ajouter des mangas !",
    action: "Commencez en ajoutant vos mangas à échanger"
  },
  noCollection: {
    title: "Votre collection est vide",
    subtitle: "Ajoutez vos premiers mangas",
    action: "Cliquez sur '+' pour commencer"
  },
  noChats: {
    title: "Aucune conversation",
    subtitle: "Les discussions apparaîtront ici",
    action: "Lancez un échange pour commencer à chatter"
  },
  noWishlist: {
    title: "Liste de souhaits vide",
    subtitle: "Ajoutez des mangas que vous recherchez",
    action: "Explorez les mangas disponibles"
  }
};

// Données d'exemple pour le tutoriel (optionnel)
export const tutorialData = {
  welcomeSteps: [
    {
      title: "Bienvenue sur Manga Swap ! 📚",
      description: "Échangez vos mangas gratuitement avec d'autres passionnés"
    },
    {
      title: "Ajoutez vos mangas 📖",
      description: "Commencez par ajouter les mangas que vous souhaitez échanger"
    },
    {
      title: "Trouvez des échanges 🔍",
      description: "Parcourez les mangas disponibles et proposez des échanges"
    },
    {
      title: "Chattez et planifiez 💬",
      description: "Organisez vos rencontres et confirmez vos échanges"
    },
    {
      title: "Gagnez de l'XP ! ⭐",
      description: "Chaque échange réussi vous fait progresser"
    }
  ]
};