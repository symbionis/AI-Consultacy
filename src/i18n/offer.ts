// Shared copy for the framework, the two offer pages (private clients,
// organisations) and the homepage doors, EN and FR. Source: the Claude Doc
// « Repositionnement : niveaux concrets et offre organisations » (Nov 2026),
// tabs « Repositionnement » and « Plan de contenu du site ».

import type { Locale } from './ui';

export type Audience = 'private' | 'organisation';

interface Level {
  num: string;
  name: string;
  who: string;
  example: string;
  sign: string;
}

interface Step {
  title: string;
  common: string;
  private: string;
  organisation: string;
}

interface Door {
  audience: Audience;
  label: string;
  title: string;
  text: string;
  link: string;
  href: string;
}

interface OfferCopy {
  labels: { example: string; sign: string; book: string };
  levels: { eyebrow: string; title: string; lead: string; items: Level[] };
  thread: { eyebrow: string; title: string; paragraphs: string[] };
  method: { eyebrow: string; title: string; lead: string; steps: Step[] };
  doors: { eyebrow: string; title: string; items: Door[] };
}

const fr: OfferCopy = {
  labels: {
    example: 'Exemple\u00a0:',
    sign: 'Le signe\u00a0:',
    book: 'Réserver un appel de 15 minutes',
  },
  levels: {
    eyebrow: 'Les cinq niveaux',
    title: "Ce que vous confiez à l'IA.",
    lead: "À chaque niveau, l'IA prend en charge un peu plus de travail. Le bon niveau dépend de la tâche, pas de l'ambition.",
    items: [
      {
        num: 'N1',
        name: 'Demander',
        who: "Vous posez la question, l'IA répond.",
        example: "comparer deux offres de fournisseurs, en lui donnant votre situation plutôt qu'une recherche Google.",
        sign: "vous passez votre temps à copier-coller entre l'IA et vos documents.",
      },
      {
        num: 'N2',
        name: 'Travailler avec',
        who: "L'IA est dans vos outils. Vous gardez la main, elle fait sa part à côté de vous.",
        example: 'dicter au lieu de taper, une réunion résumée toute seule, un premier jet de réponse dans votre messagerie.',
        sign: 'vous lui réexpliquez souvent la même chose.',
      },
      {
        num: 'N3',
        name: 'Déléguer une tâche',
        who: "Vous décrivez la tâche. L'IA la mène étape par étape et demande votre accord avant d'avancer.",
        example: 'préparer une proposition commerciale à partir de vos notes et de vos propositions passées.',
        sign: 'vous validez chaque étape sans rien changer.',
      },
      {
        num: 'N4',
        name: 'Laisser faire',
        who: "L'IA fait la tâche en entier, ou construit l'outil qui la fait. Vous relisez le résultat.",
        example: 'le rapport du mois prêt à relire, un petit outil de suivi des devis fait pour votre façon de travailler, sans coder.',
        sign: 'le même travail revient chaque semaine, et il est toujours bien fait.',
      },
      {
        num: 'N5',
        name: 'En arrière-plan',
        who: "L'IA travaille sans que vous la sollicitiez. Elle prépare, surveille et vous prévient quand quelque chose sort de l'ordinaire.",
        example: 'le point du lundi qui arrive tout seul, les relances clients préparées avant que vous y pensiez.',
        sign: "c'est le dernier niveau, pour une partie des tâches seulement. S'arrêter au bon niveau reste une réussite.",
      },
    ],
  },
  thread: {
    eyebrow: 'Le fil',
    title: 'Comment vous pensez avec elle.',
    paragraphs: [
      "À chaque niveau, l'IA peut aussi devenir un partenaire de réflexion.",
      "Pour les décisions qui mériteraient plus de temps qu'on ne leur en donne. Pour les idées que vous portez. Pour penser à voix haute, avec quelque chose qui écoute et qui répond.",
      "Les niveaux disent ce que vous confiez à l'IA. Le partenaire de réflexion, c'est la façon dont vous pensez avec elle. L'accompagnement travaille les deux.",
    ],
  },
  method: {
    eyebrow: 'La méthode',
    title: 'Cinq étapes, en boucle.',
    lead: "Les mêmes étapes pour une personne et pour une organisation. Seule la taille change. La première tâche prouve que la méthode marche, puis on recommence pour la suivante.",
    steps: [
      {
        title: 'Comprendre',
        common: "On commence par observer le travail tel qu'il se fait aujourd'hui. On regarde aussi la maturité d'adoption de l'IA et son étendue.",
        private: "Cela se fait pendant une séance de découverte d'une heure. On y parle de ce que vous portez, de ce qui revient chaque semaine et de ce qui attend depuis trop longtemps.",
        organisation: 'Nous commençons par un audit des outils métiers et des processus. Il montre ce que les équipes utilisent, comment le travail circule et où il bloque.',
      },
      {
        title: 'Choisir',
        common: "On fait la liste de ce qui revient, par ordre de priorité. On commence par les tâches récurrentes qui pèsent le plus et dont on peut vérifier le résultat. Certaines questions ne se règlent pas avec un outil. Celles-là, on les ouvre et on les décortique ensemble.",
        private: "Souvent, il s'agit du suivi et de la communication : les relances, les comptes rendus, les réponses aux clients. Parfois, c'est une question que vous repoussez depuis longtemps.",
        organisation: "La liste est validée avec la direction. Elle classe deux ou trois processus récurrents, pour que la suite soit visible dès le départ. Quand un problème dépasse une simple tâche, nous l'analysons d'abord avec les équipes concernées.",
      },
      {
        title: 'Façonner',
        common: "On façonne l'IA pour qu'elle réponde à la tâche ou au processus, avec une fiabilité qui permet de la prendre en main en confiance. Selon le besoin, cela prend la forme d'un agent : une IA configurée pour une tâche précise, avec ses instructions, ses outils et ses limites.",
        private: "Pendant les séances, on façonne l'IA à votre manière de travailler, avec vos outils, vos routines et votre voix. Vos premiers agents prennent en charge ce qui revient chaque semaine.",
        organisation: "Nous connectons les agents à vos outils métiers, pour que les équipes concernées s'en servent facilement. Nous y appliquons vos règles et vos limites : ce à quoi ils ont accès, ce qu'ils font seuls, ce qui passe par une validation.",
      },
      {
        title: 'Adopter',
        common: "Vous gardez la main sur ce qui a été déployé et adopté. On vous accompagne dans l'adoption, jusqu'à une intégration personnelle et réussie. Avec l'IA, cela va en général vite.",
        private: "Des séances d'intégration, pour que l'IA entre dans votre quotidien avec toutes ses astuces. Vous repartez avec un système qui vous appartient, et qui continue de tourner une fois l'accompagnement terminé.",
        organisation: 'Nous organisons des séances avec les équipes concernées, pour répondre à leurs questions et lever les incertitudes. Elles avancent ensuite en autonomie, avec un référent interne qui garde la main sur les outils.',
      },
      {
        title: 'Recommencer et étendre',
        common: "Une fois la première tâche adoptée, on reprend la liste et on recommence une étape de façonnage pour la suivante. Chaque nouvel agent s'appuie sur ce qui existe déjà : les outils connectés, les règles posées, les habitudes prises. À chaque tour, l'IA prend en charge une part plus grande du travail récurrent.",
        private: "Vos agents se complètent au fil des tours. Celui qui prépare vos relances peut s'appuyer sur celui qui résume vos réunions. Vous montez d'un niveau quand c'est utile, pas avant.",
        organisation: "Nous façonnons de nouveaux agents pour les processus suivants de la liste, puis pour d'autres équipes. Ce qui a marché dans une équipe sert de modèle aux autres. Ce qui ne marche pas, nous l'arrêtons.",
      },
    ],
  },
  doors: {
    eyebrow: 'Deux portes',
    title: 'Par où commencer.',
    items: [
      {
        audience: 'private',
        label: 'Clients privés',
        title: "D'abord, un second esprit.",
        text: "Mon rôle n'est pas de vous apprendre l'IA. C'est de comprendre votre façon de travailler, et d'y accorder les outils, à votre rythme.",
        link: "Voir l'accompagnement privé →",
        href: '/fr/private-clients/',
      },
      {
        audience: 'organisation',
        label: 'Organisations',
        title: 'Des mains en plus, là où le travail se répète.',
        text: 'Vos processus vivent déjà dans vos outils métiers. Vos équipes peuvent donc passer vite aux agents, connectés à ces outils, avec vos règles et vos validations.',
        link: "Voir l'accompagnement des organisations →",
        href: '/fr/organisations/',
      },
    ],
  },
};

const en: OfferCopy = {
  labels: {
    example: 'Example:',
    sign: 'The sign:',
    book: 'Book a 15-minute call',
  },
  levels: {
    eyebrow: 'The five levels',
    title: 'What you hand to AI.',
    lead: 'At each level, AI takes on a little more of the work. The right level depends on the task, not on ambition.',
    items: [
      {
        num: 'L1',
        name: 'Ask',
        who: 'You ask the question, AI answers.',
        example: 'comparing two supplier quotes, giving it your situation rather than running a Google search.',
        sign: 'you spend your time copying and pasting between AI and your documents.',
      },
      {
        num: 'L2',
        name: 'Work alongside',
        who: 'AI sits inside your tools. You stay in charge, it does its part next to you.',
        example: 'dictating instead of typing, a meeting that summarises itself, a first draft of a reply in your inbox.',
        sign: 'you keep explaining the same thing to it.',
      },
      {
        num: 'L3',
        name: 'Delegate a task',
        who: 'You describe the task. AI works through it step by step and asks for your go-ahead before moving on.',
        example: 'preparing a proposal from your notes and your past proposals.',
        sign: 'you approve every step without changing anything.',
      },
      {
        num: 'L4',
        name: 'Let it run',
        who: 'AI does the whole task, or builds the tool that does it. You review the result.',
        example: 'the monthly report ready to review, a small quote tracker built around how you work, without writing code.',
        sign: "the same work comes back every week, and it's always done well.",
      },
      {
        num: 'L5',
        name: 'In the background',
        who: 'AI works without being asked. It prepares, keeps watch, and tells you when something is out of the ordinary.',
        example: 'the Monday brief that arrives on its own, client follow-ups prepared before you think of them.',
        sign: 'this is the last level, and only for some tasks. Stopping at the right level is a success.',
      },
    ],
  },
  thread: {
    eyebrow: 'The thread',
    title: 'How you think with it.',
    paragraphs: [
      'At every level, AI can also become a thinking partner.',
      'For the decisions that deserve more time than they get. For the ideas you carry. For thinking out loud, with something that listens and answers back.',
      'The levels say what you hand to AI. The thinking partner is how you think with it. The work covers both.',
    ],
  },
  method: {
    eyebrow: 'The method',
    title: 'Five steps, on repeat.',
    lead: 'The same steps for one person and for an organisation. Only the size changes. The first task proves the method works, then we go again for the next one.',
    steps: [
      {
        title: 'Understand',
        common: "We start by looking at the work as it's done today. We also look at how far AI has been adopted, and how widely.",
        private: 'This happens in a one-hour Discovery session. We talk about what you carry, what comes back every week, and what has been waiting too long.',
        organisation: 'We start with an audit of your business tools and processes. It shows what the teams use, how the work flows and where it gets stuck.',
      },
      {
        title: 'Choose',
        common: "We list what keeps coming back, in order of priority. We start with the recurring tasks that weigh the most and whose results we can check. Some questions can't be solved with a tool. Those, we open up and take apart together.",
        private: "Often it's follow-up and communication: chasers, meeting notes, replies to clients. Sometimes it's a question you've been putting off for a long time.",
        organisation: 'The list is agreed with management. It ranks two or three recurring processes, so the next steps are visible from the start. When a problem is bigger than a single task, we work through it with the teams involved first.',
      },
      {
        title: 'Shape',
        common: 'We shape AI to fit the task or the process, reliably enough that people can pick it up with confidence. Where it helps, this takes the form of an agent: an AI set up for one specific task, with its own instructions, tools and limits.',
        private: 'During the sessions, we shape AI to the way you work, with your tools, your routines and your voice. Your first agents take on what comes back every week.',
        organisation: 'We connect the agents to your business tools, so the teams involved can use them easily. We apply your rules and limits: what they can access, what they do on their own, what needs sign-off.',
      },
      {
        title: 'Adopt',
        common: "You stay in control of what has been deployed and adopted. We support you through adoption, until it's part of how you work. With AI, this usually goes quickly.",
        private: 'Onboarding sessions, so AI becomes part of your day, with all its shortcuts. You leave with a system that belongs to you, and keeps running once our work together ends.',
        organisation: 'We run sessions with the teams involved, to answer their questions and clear up uncertainty. Then they carry on by themselves, with an internal lead who keeps hold of the tools.',
      },
      {
        title: 'Repeat and extend',
        common: "Once the first task is adopted, we go back to the list and start a new round of shaping for the next one. Each new agent builds on what's already there: the connected tools, the rules in place, the habits formed. With each round, AI takes on a larger share of the recurring work.",
        private: "Your agents start to work together over time. The one that prepares your follow-ups can draw on the one that summarises your meetings. You move up a level when it's useful, not before.",
        organisation: "We shape new agents for the next processes on the list, then for other teams. What worked in one team becomes the model for the others. What doesn't work, we stop.",
      },
    ],
  },
  doors: {
    eyebrow: 'Two doors',
    title: 'Where to start.',
    items: [
      {
        audience: 'private',
        label: 'Private clients',
        title: 'A second mind, first.',
        text: "My role isn't to teach you AI. It's to understand the way you actually work, and to weave the tools in at your pace.",
        link: 'See private client work →',
        href: '/private-clients/',
      },
      {
        audience: 'organisation',
        label: 'Organisations',
        title: 'Extra hands, where the work repeats.',
        text: 'Your processes already live in your business tools. So your teams can move quickly to agents, connected to those tools, within your rules and sign-offs.',
        link: 'See work with organisations →',
        href: '/organisations/',
      },
    ],
  },
};

export const offer: Record<Locale, OfferCopy> = { fr, en };
