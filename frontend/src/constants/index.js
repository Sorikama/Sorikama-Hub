import {
  benefitIcon1,
  benefitIcon2,
  benefitIcon3,
  benefitIcon4,
  benefitImage2,
  chromecast,
  disc02,
  discord,
  discordBlack,
  facebook,
  figma,
  file02,
  framer,
  homeSmile,
  instagram,
  logoImage,
  notion,
  photoshop,
  plusSquare,
  protopie,
  raindrop,
  recording01,
  recording03,
  searchMd,
  slack,
  sliders04,
  telegram,
  twitter,
  yourlogo,
} from "../assets";

export const navigation = [
  {
    id: "0",
    title: "Solutions",
    url: "#ecosystem",
  },
  {
    id: "1",
    title: "Avantages",
    url: "#features",
  },
  {
    id: "2",
    title: "Contribuer",
    url: "#contribute",
  },
  {
    id: "3",
    title: "Vision",
    url: "#roadmap",
  },
  {
    id: "4",
    title: "À propos",
    url: "/about",
  },
  {
    id: "5",
    title: "Créer un compte",
    url: "/signup",
    onlyMobile: true,
  },
  {
    id: "6",
    title: "Se connecter",
    url: "/login",
    onlyMobile: true,
  },
];

export const sorikama = {
  apps: [
    {
      id: "0",
      title: "Masebuy",
      text: "Plateforme de commerce électronique permettant aux entrepreneurs africains de créer facilement leur boutique en ligne et de vendre partout.",
      iconUrl: benefitIcon2,
      light: true,
      status: "development",
    },
    {
      id: "1",
      title: "Jobowo",
      text: "Plateforme de recrutement et de freelance connectant talents africains et opportunités professionnelles locales et internationales.",
      iconUrl: benefitIcon3,
      status: "development",
    },
    {
      id: "2",
      title: "SoriLead",
      text: "Outil de gestion d'entreprise tout-en-un pour les PME africaines : CRM, facturation, comptabilité et plus encore.",
      iconUrl: benefitIcon4,
      light: true,
      status: "development",
    },
    {
      id: "3",
      title: "SoriPay",
      text: "Solution de paiement intégrée avec wallet, cartes virtuelles et support multi-devises pour les transactions locales et internationales.",
      iconUrl: benefitIcon1,
      status: "planned",
    },
    {
      id: "4",
      title: "SoriMail",
      text: "Service de messagerie sécurisé et adapté aux besoins locaux avec support hors ligne et faible consommation de données.",
      iconUrl: benefitIcon1,
      status: "planned",
    },
    {
      id: "5",
      title: "SoriLearn",
      text: "Plateforme éducative proposant des formations adaptées aux besoins du marché africain, accessibles même avec une connexion limitée.",
      iconUrl: benefitIcon2,
      light: true,
      status: "planned",
    },
  ],
};

export const contribute = [
  {
    id: "0",
    title: "Développeur",
    text: "Vous êtes développeur et souhaitez contribuer au projet ? Rejoignez notre équipe de développement et participez à la création d'un écosystème numérique africain innovant.",
    iconUrl: benefitIcon1,
    buttonText: "Rejoindre l'équipe",
    buttonUrl: "#developer",
  },
  {
    id: "1",
    title: "Investisseur",
    text: "Vous souhaitez soutenir financièrement le projet Sorikama ? Investissez dans l'avenir numérique de l'Afrique et contribuez à la création d'un écosystème digital inclusif.",
    iconUrl: benefitIcon2,
    buttonText: "Investir dans Sorikama",
    buttonUrl: "#investor",
  },
];

export const heroIcons = [homeSmile, file02, searchMd, plusSquare];

// Les notifications ont été supprimées



export const sorikamaServices = [
  "Compte unique",
  "Applications interconnectées",
  "Expérience utilisateur unifiée",
];

export const sorikamaServicesIcons = [
  recording03,
  recording01,
  disc02,
  chromecast,
  sliders04,
];

// La feuille de route a été remplacée par une présentation de la vision

export const collabText =
  "Toutes les applications de l'écosystème Sorikama sont interconnectées et accessibles avec un seul compte utilisateur, offrant une expérience fluide et intégrée.";

export const collabContent = [
  {
    id: "0",
    title: "Un écosystème interconnecté",
    text: collabText,
  },
  {
    id: "1",
    title: "Compte utilisateur unique",
  },
  {
    id: "2",
    title: "Expérience utilisateur fluide",
  },
];

export const collabApps = [
  {
    id: "0",
    title: "Masebuy",
    icon: logoImage,
    width: 24,
    height: 24,
    color: "#FF5733",
  },
  {
    id: "1",
    title: "Jobowo",
    icon: logoImage,
    width: 24,
    height: 24,
    color: "#33A1FF",
  },
  {
    id: "2",
    title: "SoriLead",
    icon: logoImage,
    width: 24,
    height: 24,
    color: "#33FF57",
  },
  {
    id: "3",
    title: "SoriPay",
    icon: logoImage,
    width: 24,
    height: 24,
    color: "#F3FF33",
  },
  {
    id: "4",
    title: "SoriMail",
    icon: logoImage,
    width: 24,
    height: 24,
    color: "#FF33E9",
  },
  {
    id: "5",
    title: "SoriLearn",
    icon: logoImage,
    width: 24,
    height: 24,
    color: "#33FFF6",
  },
  {
    id: "6",
    title: "SoriChat",
    icon: logoImage,
    width: 24,
    height: 24,
    color: "#D433FF",
  },
  {
    id: "7",
    title: "SoriSocial",
    icon: logoImage,
    width: 24,
    height: 24,
    color: "#FF8A33",
  },
];

export const pricing = [
  {
    id: "0",
    title: "Gratuit",
    description: "Accès de base à l'écosystème Sorikama",
    price: "0",
    features: [
      "Compte Sorikama unique pour toutes les applications",
      "Accès limité à SoriPay et Masebuy",
      "Fonctionnalités de base pour un usage personnel",
    ],
  },
  {
    id: "1",
    title: "Standard",
    description: "Pour les particuliers et les micro-entrepreneurs",
    price: "4.99",
    features: [
      "Accès complet à toutes les applications Sorikama",
      "Transactions SoriPay sans frais jusqu'à 500€/mois",
      "Support prioritaire et accès hors ligne avancé",
    ],
  },
  {
    id: "2",
    title: "Business",
    description: "Pour les PME et organisations",
    price: null,
    features: [
      "Solutions personnalisées pour votre entreprise",
      "Intégration API avec vos systèmes existants",
      "Accompagnement dédié et formation de votre équipe",
    ],
  },
];

export const benefits = [
  {
    id: "0",
    title: "Compte unique",
    text: "Un seul compte utilisateur pour accéder à toutes les applications de l'écosystème Sorikama, avec une authentification sécurisée.",
    backgroundUrl: "./src/assets/benefits/card-1.svg",
    iconUrl: benefitIcon1,
    imageUrl: benefitImage2,
  },
  {
    id: "1",
    title: "Adapté à l'Afrique",
    text: "Applications conçues pour répondre aux besoins spécifiques du marché africain, avec une attention particulière aux contraintes locales.",
    backgroundUrl: "./src/assets/benefits/card-2.svg",
    iconUrl: benefitIcon2,
    imageUrl: benefitImage2,
    light: true,
  },
  {
    id: "2",
    title: "Accès hors ligne",
    text: "Fonctionnalités essentielles accessibles même sans connexion internet stable, adaptées aux réalités des infrastructures africaines.",
    backgroundUrl: "./src/assets/benefits/card-3.svg",
    iconUrl: benefitIcon3,
    imageUrl: benefitImage2,
  },
  {
    id: "3",
    title: "Faible consommation",
    text: "Applications optimisées pour minimiser la consommation de données mobiles, réduisant ainsi les coûts pour les utilisateurs.",
    backgroundUrl: "./src/assets/benefits/card-4.svg",
    iconUrl: benefitIcon4,
    imageUrl: benefitImage2,
    light: true,
  },
  {
    id: "4",
    title: "Inclusivité",
    text: "Interfaces simples et intuitives, accessibles à tous les utilisateurs, quel que soit leur niveau de compétence numérique.",
    backgroundUrl: "./src/assets/benefits/card-5.svg",
    iconUrl: benefitIcon1,
    imageUrl: benefitImage2,
  },
  {
    id: "5",
    title: "Impact social",
    text: "Création d'opportunités économiques pour les entrepreneurs et les travailleurs africains, favorisant le développement local.",
    backgroundUrl: "./src/assets/benefits/card-6.svg",
    iconUrl: benefitIcon2,
    imageUrl: benefitImage2,
  },
];

export const socials = [
  {
    id: "0",
    title: "Discord",
    iconUrl: discordBlack,
    url: "#",
  },
  {
    id: "1",
    title: "Twitter",
    iconUrl: twitter,
    url: "#",
  },
  {
    id: "2",
    title: "Instagram",
    iconUrl: instagram,
    url: "#",
  },
  {
    id: "3",
    title: "Telegram",
    iconUrl: telegram,
    url: "#",
  },
  {
    id: "4",
    title: "Facebook",
    iconUrl: facebook,
    url: "#",
  },
];
