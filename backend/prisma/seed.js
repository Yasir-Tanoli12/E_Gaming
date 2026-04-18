"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcrypt = __importStar(require("bcrypt"));
const crypto = __importStar(require("crypto"));
const prisma = new client_1.PrismaClient();
const BOOTSTRAP_ADMIN_EMAIL = 'moeedabdul261@gmail.com';
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
    const adminEmail = BOOTSTRAP_ADMIN_EMAIL.toLowerCase();
    await prisma.admin.upsert({
        where: { email: adminEmail },
        create: { email: adminEmail },
        update: {},
    });
    console.log('Admin allowlist entry:', adminEmail);
    const existingUser = await prisma.user.findUnique({
        where: { email: adminEmail },
    });
    if (!existingUser) {
        const passwordHash = await bcrypt.hash(crypto.randomUUID() + crypto.randomUUID(), 12);
        await prisma.user.create({
            data: {
                email: adminEmail,
                passwordHash,
                name: 'Admin',
                role: client_1.UserRole.ADMIN,
                emailVerified: true,
            },
        });
        console.log('Created admin user for OTP sign-in:', adminEmail);
    }
    else {
        await prisma.user.update({
            where: { email: adminEmail },
            data: {
                role: client_1.UserRole.ADMIN,
                emailVerified: true,
            },
        });
        console.log('Admin user already exists, ensured ADMIN role:', adminEmail);
    }
    const gameCount = await prisma.game.count();
    if (gameCount === 0) {
        await prisma.game.createMany({
            data: SAMPLE_GAMES,
        });
        console.log(`Created ${SAMPLE_GAMES.length} sample games.`);
    }
    else {
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
//# sourceMappingURL=seed.js.map