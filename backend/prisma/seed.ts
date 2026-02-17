import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const SAMPLE_GAMES = [
  {
    title: 'Snake',
    description: 'Classic snake game - eat food and grow longer!',
    gameLink: 'https://playsnake.org/',
    thumbnailUrl: 'https://playsnake.org/assets/og-image.png',
    sortOrder: 1,
  },
  {
    title: 'Tetris',
    description: 'Stack blocks and clear lines in this timeless puzzle game.',
    gameLink: 'https://tetris.com/play-tetris/',
    thumbnailUrl: 'https://tetris.com/img/favicon_192x192.png',
    sortOrder: 2,
  },
  {
    title: '2048',
    description: 'Slide and merge tiles to reach 2048!',
    gameLink: 'https://play2048.co/',
    thumbnailUrl: 'https://play2048.co/favicon.ico',
    sortOrder: 3,
  },
  {
    title: 'Pac-Man',
    description: 'Navigate the maze, eat pellets, avoid ghosts!',
    gameLink: 'https://www.google.com/logos/2010/pacman10-i.html',
    thumbnailUrl: null,
    sortOrder: 4,
  },
  {
    title: 'Wordle',
    description: 'Guess the 5-letter word in 6 tries.',
    gameLink: 'https://www.nytimes.com/games/wordle/index.html',
    thumbnailUrl: null,
    sortOrder: 5,
  },
];

async function main() {
  // Create admin user
  const adminEmail = process.env.ADMIN_EMAIL ?? 'admin@egaming.com';
  const adminPassword = process.env.ADMIN_PASSWORD ?? 'Admin@123';

  const existingUser = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (!existingUser) {
    const passwordHash = await bcrypt.hash(adminPassword, 10);
    await prisma.user.create({
      data: {
        email: adminEmail,
        passwordHash,
        name: 'Admin',
        role: 'ADMIN',
        emailVerified: true,
      },
    });
    console.log('Created admin user:', adminEmail);
    console.log('Default password:', adminPassword);
  } else {
    await prisma.user.update({
      where: { email: adminEmail },
      data: { emailVerified: true },
    });
    console.log('Admin user already exists:', adminEmail);
  }

  // Create sample games if none exist
  const gameCount = await prisma.game.count();
  if (gameCount === 0) {
    await prisma.game.createMany({
      data: SAMPLE_GAMES,
    });
    console.log(`Created ${SAMPLE_GAMES.length} sample games.`);
  } else {
    console.log('Games already exist, skipping game seed.');
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
