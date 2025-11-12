import { NextRequest, NextResponse } from 'next/server';

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface AgentConfig {
  name: string;
  personality: string;
  expertise: string;
  temperature: number;
}

// Réponses intelligentes basées sur le contexte
function generateResponse(messages: Message[], config: AgentConfig): string {
  const lastMessage = messages[messages.length - 1];
  const userInput = lastMessage.content.toLowerCase();

  // Analyse du contexte
  const context = {
    isGreeting: /^(salut|bonjour|hello|hi|hey|coucou)/i.test(userInput),
    isQuestion: userInput.includes('?'),
    isFarewell: /^(au revoir|bye|à bientôt|adieu)/i.test(userInput),
    isThankYou: /(merci|thanks|merci beaucoup)/i.test(userInput),
    askingName: /(comment tu t'appelles|quel est ton nom|qui es-tu)/i.test(userInput),
    askingCapabilities: /(que peux-tu faire|tes capacités|aide|help)/i.test(userInput),
    askingPersonality: /(personnalité|comment tu es)/i.test(userInput),
  };

  // Réponses contextuelles
  if (context.isGreeting) {
    const greetings = [
      `Bonjour! Je suis ${config.name}, ravi de vous aider!`,
      `Salut! Comment puis-je vous assister aujourd'hui?`,
      `Hello! ${config.name} à votre service!`,
    ];
    return greetings[Math.floor(Math.random() * greetings.length)];
  }

  if (context.askingName) {
    return `Je m'appelle ${config.name}. Je suis un agent IA spécialisé en ${config.expertise} avec une personnalité ${config.personality}. Comment puis-je vous aider?`;
  }

  if (context.askingCapabilities) {
    return `En tant qu'agent IA spécialisé en ${config.expertise}, je peux:

• Répondre à vos questions dans mon domaine d'expertise
• Vous aider à résoudre des problèmes
• Fournir des conseils et des recommandations
• Avoir une conversation naturelle avec vous
• M'adapter à votre style de communication

Ma personnalité est ${config.personality}, ce qui influence mon style de réponse. N'hésitez pas à me poser n'importe quelle question!`;
  }

  if (context.askingPersonality) {
    return `Ma personnalité est ${config.personality}. Cela signifie que j'adapte mon ton et mon approche pour être ${config.personality} dans nos échanges. Mon expertise en ${config.expertise} me permet de vous offrir des réponses pertinentes et utiles.`;
  }

  if (context.isFarewell) {
    const farewells = [
      "Au revoir! N'hésitez pas à revenir si vous avez besoin d'aide!",
      "À bientôt! C'était un plaisir de discuter avec vous.",
      "Bonne journée! Je serai là si vous avez besoin.",
    ];
    return farewells[Math.floor(Math.random() * farewells.length)];
  }

  if (context.isThankYou) {
    return "Je vous en prie! C'est toujours un plaisir de vous aider. N'hésitez pas si vous avez d'autres questions!";
  }

  // Réponses basées sur l'expertise
  const expertiseResponses: { [key: string]: string } = {
    'programmation': `En tant qu'expert en programmation, je peux vous aider avec "${userInput}". Voici mon conseil:

Cette question touche à un aspect important du développement. Je recommande d'aborder ce problème de manière structurée en commençant par bien définir vos besoins, puis en choisissant les bonnes technologies et enfin en implémentant une solution robuste et maintenable.

Souhaitez-vous plus de détails sur un aspect particulier?`,

    'marketing': `Excellente question sur le marketing! Pour "${userInput}", voici mon analyse:

Dans le contexte marketing actuel, il est essentiel de comprendre votre audience cible, de créer du contenu engageant et de mesurer vos résultats. Je suggère une approche data-driven combinée avec une touche créative pour maximiser votre impact.

Voulez-vous que nous explorions une stratégie spécifique?`,

    'cuisine': `Ah, une question culinaire! Concernant "${userInput}", laissez-moi partager mon expertise:

La cuisine est un art qui combine technique et créativité. Pour réussir, il faut de bons ingrédients, une bonne maîtrise des techniques de base et un sens du timing. Je peux vous guider à travers les étapes nécessaires pour obtenir un résultat délicieux.

Avez-vous besoin d'une recette détaillée ou de conseils spécifiques?`,
  };

  // Recherche de l'expertise correspondante
  const expertiseKey = Object.keys(expertiseResponses).find(key =>
    config.expertise.toLowerCase().includes(key)
  );

  if (expertiseKey) {
    return expertiseResponses[expertiseKey];
  }

  // Réponse générique mais personnalisée
  const personalityAdj = config.personality === 'professionnel et amical' ? 'professionnel' :
                         config.personality.includes('humour') ? 'amusant' : 'utile';

  return `Merci pour votre question: "${userInput}"

En tant qu'assistant IA avec une expertise en ${config.expertise}, je suis là pour vous aider de manière ${personalityAdj}.

Voici ce que je peux vous dire: Cette question est intéressante et mérite une réponse réfléchie. En me basant sur mon expertise en ${config.expertise}, je vous recommande d'aborder ce sujet en plusieurs étapes:

1. **Analyse**: Comprendre tous les aspects du problème
2. **Planification**: Définir une stratégie claire
3. **Action**: Mettre en œuvre la solution
4. **Évaluation**: Mesurer les résultats

N'hésitez pas à me donner plus de détails pour que je puisse vous fournir une réponse plus précise et adaptée à votre situation!`;
}

export async function POST(request: NextRequest) {
  try {
    const { messages, config } = await request.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'Messages invalides' },
        { status: 400 }
      );
    }

    const response = generateResponse(messages, config);

    return NextResponse.json({ response });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}
