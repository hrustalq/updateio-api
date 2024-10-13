import { PrismaClient, UserRole } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const saltRounds = 10;
  const defaultAdminPassword = 'admin123'; // You should change this in production

  const passwordHash = await bcrypt.hash(defaultAdminPassword, saltRounds);

  const adminUser = await prisma.user.upsert({
    where: { id: '678478970' },
    update: {
      username: 'Kryst4l320',
      passwordHash: passwordHash,
      isBot: false,
      firstName: "El'dar",
      role: UserRole.ADMIN,
      languageCode: 'en',
    },
    create: {
      id: '678478970',
      username: 'Kryst4l320',
      passwordHash: passwordHash,
      isBot: false,
      firstName: "El'dar",
      role: UserRole.ADMIN,
      languageCode: 'en',
    },
  });

  console.log({ adminUser });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
