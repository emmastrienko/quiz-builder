import { prisma } from '../src/config/prisma';

interface SeedQuestion {
  type: 'boolean' | 'input' | 'checkbox';
  text: string;
  options?: string[];
  correctAnswer?: boolean | string;
  correctAnswers?: string[];
}

interface SeedQuiz {
  title: string;
  questions: SeedQuestion[];
}

const QUIZZES: SeedQuiz[] = [
  {
    title: 'Tech & Code Trivia',
    questions: [
      {
        type: 'boolean',
        text: 'Was the first recorded computer "bug" an actual moth found inside a computer in 1947?',
        correctAnswer: true,
      },
      {
        type: 'input',
        text: 'In JavaScript, what is the value of typeof null? (the famous Answer)',
        correctAnswer: 'object',
      },
      {
        type: 'checkbox',
        text: 'Which of these are actual programming paradigms?',
        options: [
          'Object-oriented',
          'Functional',
          'Competitive gardening',
          'Declarative',
          'Extreme napping',
        ],
        correctAnswers: ['Object-oriented', 'Functional', 'Declarative'],
      },
      {
        type: 'boolean',
        text: 'Does "git blame" tell you who last modified each line of code?',
        correctAnswer: true,
      },
      {
        type: 'input',
        text: 'What HTTP response code famously says "I\'m a teapot"?',
        correctAnswer: '418',
      },
    ],
  },
  {
    title: 'Movie & TV Trivia',
    questions: [
      {
        type: 'input',
        text: 'In The Matrix, which pill does Neo swallow?',
        correctAnswer: 'Red pill',
      },
      {
        type: 'checkbox',
        text: 'In which of these films does a wizard named Gandalf appear?',
        options: ['The Lord of the Rings', 'Harry Potter', 'The Hobbit', 'Toy Story'],
        correctAnswers: ['The Lord of the Rings', 'The Hobbit'],
      },
      {
        type: 'boolean',
        text: "In Star Wars, is Darth Vader actually Luke Skywalker's father?",
        correctAnswer: true,
      },
      {
        type: 'input',
        text: "What is the name of Elijah Wood's hobbit character in The Lord of the Rings?",
        correctAnswer: 'Frodo',
      },
      {
        type: 'boolean',
        text: 'Is Dory from Finding Nemo famous for her photographic memory?',
        correctAnswer: false,
      },
    ],
  },
  {
    title: 'Food for Thought',
    questions: [
      {
        type: 'checkbox',
        text: 'Which of these are botanically classified as berries?',
        options: ['Banana', 'Strawberry', 'Grape', 'Tomato', 'Pineapple'],
        correctAnswers: ['Banana', 'Grape', 'Tomato'],
      },
      {
        type: 'input',
        text: 'Which country is the birthplace of pizza?',
        correctAnswer: 'Italy',
      },
      {
        type: 'boolean',
        text: 'Was sushi originally invented as a way to preserve fish?',
        correctAnswer: true,
      },
      {
        type: 'input',
        text: 'What is the most consumed drink in the world after water?',
        correctAnswer: 'Tea',
      },
      {
        type: 'checkbox',
        text: 'Which of these drinks contain caffeine?',
        options: ['Coffee', 'Green tea', 'Orange juice', 'Energy drink'],
        correctAnswers: ['Coffee', 'Green tea', 'Energy drink'],
      },
    ],
  },
  {
    title: 'Web Development Fundamentals',
    questions: [
      {
        type: 'input',
        text: 'Which HTTP status code indicates that a resource was moved permanently?',
        correctAnswer: '301',
      },
      {
        type: 'checkbox',
        text: 'Which of these are valid HTTP methods?',
        options: ['GET', 'POST', 'FETCH', 'PATCH'],
        correctAnswers: ['GET', 'POST', 'PATCH'],
      },
      {
        type: 'boolean',
        text: 'In a REST API, is DELETE the idiomatic method for removing a resource?',
        correctAnswer: true,
      },
      {
        type: 'boolean',
        text: 'In JavaScript, does the === operator perform type coercion?',
        correctAnswer: false,
      },
      {
        type: 'input',
        text: 'What SQL clause is used to filter rows after grouping?',
        correctAnswer: 'HAVING',
      },
    ],
  },
  {
    title: 'World Geography Challenge',
    questions: [
      {
        type: 'input',
        text: 'What is the capital city of Australia?',
        correctAnswer: 'Canberra',
      },
      {
        type: 'checkbox',
        text: 'Which of these countries are landlocked?',
        options: ['Bolivia', 'Nepal', 'Vietnam', 'Switzerland'],
        correctAnswers: ['Bolivia', 'Nepal', 'Switzerland'],
      },
      {
        type: 'boolean',
        text: 'Is the ancient city of Petra located in Jordan?',
        correctAnswer: true,
      },
      {
        type: 'input',
        text: 'What is the largest ocean on Earth by surface area?',
        correctAnswer: 'Pacific',
      },
      {
        type: 'boolean',
        text: 'Is Asia the largest continent by land area?',
        correctAnswer: true,
      },
    ],
  },
  {
    title: 'Science & Nature Expeditions',
    questions: [
      {
        type: 'input',
        text: 'What is the chemical symbol for gold?',
        correctAnswer: 'Au',
      },
      {
        type: 'checkbox',
        text: 'Which planets in our solar system have rings?',
        options: ['Saturn', 'Jupiter', 'Uranus', 'Mars'],
        correctAnswers: ['Saturn', 'Jupiter', 'Uranus'],
      },
      {
        type: 'boolean',
        text: 'Do octopuses have three hearts?',
        correctAnswer: true,
      },
      {
        type: 'input',
        text: 'Which gas do plants primarily absorb for photosynthesis?',
        correctAnswer: 'Carbon dioxide',
      },
      {
        type: 'boolean',
        text: 'Can sound travel through the vacuum of space?',
        correctAnswer: false,
      },
    ],
  },
  {
    title: 'History & Curiosities',
    questions: [
      {
        type: 'boolean',
        text: 'Was Napoleon Bonaparte actually shorter than the average man of his time?',
        correctAnswer: false,
      },
      {
        type: 'input',
        text: 'In which year did the Great Fire of London take place?',
        correctAnswer: '1666',
      },
      {
        type: 'checkbox',
        text: 'Which of these inventions existed before 1900?',
        options: ['The telephone', 'The airplane', 'The fax machine', 'The electric light bulb'],
        correctAnswers: ['The telephone', 'The fax machine', 'The electric light bulb'],
      },
      {
        type: 'input',
        text: 'Which civilization built the city of Machu Picchu?',
        correctAnswer: 'Incas',
      },
      {
        type: 'boolean',
        text: 'Did Vikings reach North America before Columbus?',
        correctAnswer: true,
      },
    ],
  },
];

function serializeQuestion(question: SeedQuestion, index: number) {
  switch (question.type) {
    case 'boolean':
      return {
        type: question.type,
        text: question.text,
        options: null,
        correctAnswer: JSON.stringify(question.correctAnswer === true),
        position: index,
      };
    case 'input':
      return {
        type: question.type,
        text: question.text,
        options: null,
        correctAnswer: JSON.stringify(question.correctAnswer),
        position: index,
      };
    case 'checkbox':
      return {
        type: question.type,
        text: question.text,
        options: JSON.stringify(question.options ?? []),
        correctAnswer: JSON.stringify(question.correctAnswers ?? []),
        position: index,
      };
  }
}

async function seed() {
  for (const quiz of QUIZZES) {
    const existing = await prisma.quiz.findFirst({
      where: { title: quiz.title },
    });
    if (existing) {
      console.log(`Quiz "${quiz.title}" already exists, skipping.`);
      continue;
    }
    await prisma.quiz.create({
      data: {
        title: quiz.title,
        questions: {
          create: quiz.questions.map(serializeQuestion),
        },
      },
    });
    console.log(`Created quiz "${quiz.title}" (${quiz.questions.length} questions).`);
  }
  await prisma.$disconnect();
}

seed().catch(async (error) => {
  console.error(error);
  await prisma.$disconnect();
  process.exit(1);
});
