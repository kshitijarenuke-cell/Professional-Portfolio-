import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config({ path: path.join(__dirname, '../../.env') });

const prisma = new PrismaClient();

export async function seedDatabase() {
  console.log('[Seed] Starting PostgreSQL database seeding...');

  const email = process.env.ADMIN_EMAIL || 'kshitija@gmail.com';
  const plainPassword = process.env.ADMIN_PASSWORD || 'kshitija3128';
  const hashed = await bcrypt.hash(plainPassword, 12);

  // Ensure admin account exists with exact credentials
  const existingAdmin = await prisma.admin.findUnique({ where: { email } });
  if (!existingAdmin) {
    // Delete any old admin records to ensure single admin account
    await prisma.admin.deleteMany();
    await prisma.admin.create({ data: { email, password: hashed } });
    console.log(`[Seed] Created primary admin account: ${email}`);
  } else {
    // Update password hash if needed
    await prisma.admin.update({ where: { email }, data: { password: hashed } });
    console.log(`[Seed] Updated admin password hash for: ${email}`);
  }

  // Copy Resume.pdf to uploads directory
  let resumeUrl = '/uploads/Resume.pdf';
  const resumeSrc = path.join(__dirname, '../../../Resume.pdf');
  const uploadsDir = path.join(__dirname, '../../../uploads');
  if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
  if (fs.existsSync(resumeSrc)) {
    fs.copyFileSync(resumeSrc, path.join(uploadsDir, 'Resume.pdf'));
    console.log('[Seed] Resume.pdf copied to uploads/');
  }

  // Seed About
  const aboutCount = await prisma.about.count();
  if (aboutCount === 0) {
    await prisma.about.create({
      data: {
        heading: 'Kshitija Renuke',
        description: 'Passionate MERN stack developer and UI designer dedicated to building beautiful, clean, and interactive digital solutions.',
        profileImage: '',
        resumeUrl,
        stats: [
          { label: 'Experience', value: 'Fresh Graduate' },
          { label: 'Projects', value: '10+' },
          { label: 'Skills', value: '20+' }
        ]
      }
    });
    console.log('[Seed] Created About record');
  }

  // Seed Contact
  const contactCount = await prisma.contact.count();
  if (contactCount === 0) {
    await prisma.contact.create({
      data: {
        email: 'kshitija@gmail.com',
        phone: '+91 8850535352',
        location: 'Lalbaug, Mumbai',
        available: true,
        resumeUrl,
        socials: {
          github: 'https://github.com/kshitijarenuke-cell',
          linkedin: 'https://www.linkedin.com/in/kshitija-renuke-5596452b4/',
          instagram: 'https://www.instagram.com/kshitijaa__x6/',
          leetcode: 'https://leetcode.com/u/kshitijarenuke/'
        }
      }
    });
    console.log('[Seed] Created Contact record');
  }

  // Seed TechStack
  const techCount = await prisma.techStack.count();
  if (techCount === 0) {
    await prisma.techStack.createMany({
      data: [
        { category: 'Languages', name: 'JavaScript', icon: 'fab fa-js', order: 0 },
        { category: 'Languages', name: 'HTML5', icon: 'fab fa-html5', order: 1 },
        { category: 'Languages', name: 'CSS3', icon: 'fab fa-css3-alt', order: 2 },
        { category: 'Frontend', name: 'React', icon: 'fab fa-react', order: 3 },
        { category: 'Frontend', name: 'Tailwind CSS', icon: 'fab fa-css3-alt', order: 4 },
        { category: 'Backend', name: 'Node.js', icon: 'fab fa-node-js', order: 5 },
        { category: 'Backend', name: 'Express.js', icon: 'fas fa-server', order: 6 },
        { category: 'Database', name: 'MongoDB', icon: 'fas fa-database', order: 7 },
        { category: 'Tools', name: 'Git', icon: 'fab fa-git-alt', order: 8 }
      ]
    });
    console.log('[Seed] Created TechStack records');
  }

  // Seed Projects
  const projectCount = await prisma.project.count();
  if (projectCount === 0) {
    await prisma.project.createMany({
      data: [
        {
          title: 'DevConnect Platform',
          description: 'A real-time developer collaboration platform with project rooms, live code sharing, and integrated chat — built with Socket.io and React.',
          technologies: ['React', 'Node.js', 'Socket.io', 'MongoDB'],
          githubUrl: 'https://github.com/kshitijarenuke-cell',
          liveUrl: '#',
          imageUrl: '',
          order: 0
        },
        {
          title: 'AI Image Generator',
          description: 'A web app that generates hyper-realistic images from text queries using neural networks, storing records in Cloudinary.',
          technologies: ['React', 'Express.js', 'OpenAI API', 'Cloudinary'],
          githubUrl: 'https://github.com/kshitijarenuke-cell',
          liveUrl: '#',
          imageUrl: '',
          order: 1
        },
        {
          title: 'TaskFlow Application',
          description: 'A visual task board with drag-and-drop workspace lanes, checklist workflows, and performance chart analytics.',
          technologies: ['React', 'CSS Grid', 'Tailwind', 'Chart.js'],
          githubUrl: 'https://github.com/kshitijarenuke-cell',
          liveUrl: '#',
          imageUrl: '',
          order: 2
        }
      ]
    });
    console.log('[Seed] Created Projects records');
  }

  // Seed Settings
  const settingsCount = await prisma.settings.count();
  if (settingsCount === 0) {
    await prisma.settings.create({ data: { projectView: 'grid' } });
    console.log('[Seed] Created Settings record');
  }

  console.log('[Seed] Database seeding complete!');
}

if (require.main === module) {
  seedDatabase()
    .then(() => prisma.$disconnect())
    .catch((e) => {
      console.error('[Seed Error]', e);
      prisma.$disconnect();
      process.exit(1);
    });
}
