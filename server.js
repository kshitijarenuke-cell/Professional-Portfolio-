const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const path = require('path');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');

// Load environment variables
dotenv.config({ path: path.join(__dirname, 'config.env') });

// ── Startup Environment Validation ─────────────────────────────────────────
// Fail loudly with a clear message if critical variables are missing.
// IMPORTANT: Never log the actual secret values — only the variable names.
const REQUIRED_ENV = ['MONGO_URI', 'JWT_SECRET'];
const missingEnv = REQUIRED_ENV.filter((k) => !process.env[k]);
if (missingEnv.length > 0) {
  console.error('[ENV ERROR] Missing required environment variables:', missingEnv.join(', '));
  console.error('[ENV ERROR] Please check your config.env file against .env.example');
  process.exit(1);
}
if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
  console.error('[ENV ERROR] JWT_SECRET must be at least 32 characters long.');
  process.exit(1);
}
// ────────────────────────────────────────────────────────────────────────────

const app = express();
const PORT = process.env.PORT || 3000;

// Apply Helmet Security Headers (disabling default strict CSP for CDN compatibility)
app.use(helmet({
  contentSecurityPolicy: false
}));

// Apply MongoDB operator injection prevention
app.use(mongoSanitize());

// Setup rate limiters
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 mins
  max: 10, // 10 attempts
  message: { success: false, message: 'Too many login attempts. Please try again after 15 minutes.' }
});

const messageLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // 5 requests
  message: { success: false, message: 'Too many messages sent. Please try again after an hour.' }
});

// Setup Middlewares
// In production, restrict CORS to the deployed frontend URL (CLIENT_URL).
// In development, allow all origins so local Vite dev server works seamlessly.
const allowedOrigin = process.env.NODE_ENV === 'production'
  ? process.env.CLIENT_URL
  : true;
app.use(cors({
  origin: allowedOrigin,
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// Disable API Caching to ensure browser reloads fetch fresh database records
app.use('/api', (req, res, next) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.set('Pragma', 'no-cache');
  res.set('Expires', '0');
  next();
});

// Database connection
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/portfolio')
  .then(() => {
    console.log('[MongoDB] Connected successfully');
    seedDatabase(); // Run seed logic on connect
  })
  .catch(err => {
    console.error('[MongoDB] Connection error:', err);
  });

// Models imports
const Admin = require('./backend/models/Admin');
const Project = require('./backend/models/Project');
const TechStack = require('./backend/models/TechStack');
const About = require('./backend/models/About');
const Contact = require('./backend/models/Contact');
const Message = require('./backend/models/Message');
const Settings = require('./backend/models/Settings');

// Middleware & Utilities imports
const authMiddleware = require('./backend/middleware/auth');
const { uploadMiddleware, uploadToCloud, sendNotificationEmail, isCloudinaryMock } = require('./backend/utils/helpers');

// Static folders serving
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
// Serve static client assets
app.use(express.static(__dirname));

/* ==========================================================================
   AUTHENTICATION ROUTES
   ========================================================================== */

app.post('/api/auth/login', loginLimiter, async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Please provide email and password' });
  }

  try {
    const admin = await Admin.findOne({ email });
    if (!admin || !(await admin.comparePassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Sign JWT token
    const token = jwt.sign({ id: admin._id, email: admin.email }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d'
    });

    // Set cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.json({ success: true, message: 'Login successful' });
  } catch (error) {
    console.error('[Login Error]', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});

app.post('/api/auth/logout', (req, res) => {
  res.clearCookie('token');
  res.json({ success: true, message: 'Logout successful' });
});

app.get('/api/auth/status', (req, res) => {
  const token = req.cookies.token;
  if (!token) return res.json({ isAuthenticated: false });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    res.json({ isAuthenticated: true, email: decoded.email });
  } catch (err) {
    res.json({ isAuthenticated: false });
  }
});

/* ==========================================================================
   DASHBOARD STATS ROUTE
   ========================================================================== */

app.get('/api/admin/stats', authMiddleware, async (req, res) => {
  try {
    const projectsCount = await Project.countDocuments();
    const skillsCount = await TechStack.countDocuments();
    const messagesCount = await Message.countDocuments();
    
    // Get recent messages list (max 5)
    const recentMessages = await Message.find().sort({ createdAt: -1 }).limit(5);

    res.json({
      success: true,
      stats: {
        projects: projectsCount,
        skills: skillsCount,
        messages: messagesCount
      },
      recentMessages
    });
  } catch (error) {
    console.error('[Admin Stats Error]', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

/* ==========================================================================
   ABOUT & RESUME ROUTES
   ========================================================================== */

app.get('/api/about', async (req, res) => {
  try {
    let about = await About.findOne();
    if (!about) {
      return res.status(444).json({ success: false, message: 'No content found' });
    }
    res.json(about);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

app.put('/api/about', authMiddleware, async (req, res) => {
  try {
    let about = await About.findOne();
    if (!about) about = new About(req.body);
    else Object.assign(about, req.body);

    await about.save();
    res.json({ success: true, data: about });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

/* ==========================================================================
   CONTACT ROUTES
   ========================================================================== */

app.get('/api/contact', async (req, res) => {
  try {
    const contact = await Contact.findOne();
    res.json(contact);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

app.put('/api/contact', authMiddleware, async (req, res) => {
  try {
    let contact = await Contact.findOne();
    if (!contact) contact = new Contact(req.body);
    else Object.assign(contact, req.body);

    await contact.save();
    res.json({ success: true, data: contact });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

/* ==========================================================================
   PROJECTS ROUTES
   ========================================================================== */

app.get('/api/projects', async (req, res) => {
  try {
    const projects = await Project.find().sort({ order: 1 });
    res.json(projects);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

app.post('/api/projects', authMiddleware, async (req, res) => {
  try {
    const count = await Project.countDocuments();
    const newProject = new Project({
      ...req.body,
      order: count
    });
    await newProject.save();
    res.json({ success: true, data: newProject });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

app.put('/api/projects/:id', authMiddleware, async (req, res) => {
  try {
    const project = await Project.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });
    res.json({ success: true, data: project });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

app.delete('/api/projects/:id', authMiddleware, async (req, res) => {
  try {
    const project = await Project.findByIdAndDelete(req.params.id);
    if (!project) return res.status(444).json({ success: false, message: 'Project not found' });
    res.json({ success: true, message: 'Project deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

/* ==========================================================================
   TECHSTACK ROUTES
   ========================================================================== */

app.get('/api/techstack', async (req, res) => {
  try {
    const list = await TechStack.find().sort({ order: 1 });
    res.json(list);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

app.post('/api/techstack', authMiddleware, async (req, res) => {
  try {
    const count = await TechStack.countDocuments();
    const item = new TechStack({
      ...req.body,
      order: count
    });
    await item.save();
    res.json({ success: true, data: item });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

app.put('/api/techstack/:id', authMiddleware, async (req, res) => {
  try {
    const item = await TechStack.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, data: item });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

app.delete('/api/techstack/:id', authMiddleware, async (req, res) => {
  try {
    await TechStack.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Skill deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

/* ==========================================================================
   MESSAGES & CONTACT FORM
   ========================================================================== */

app.post('/api/messages', messageLimiter, async (req, res) => {
  const { name, email, subject, message } = req.body;
  if (!name || !email || !subject || !message) {
    return res.status(400).json({ success: false, message: 'All fields are required' });
  }

  try {
    // Save to database first (guarantees we never lose a message)
    const newMessage = new Message({ name, email, subject, message });
    await newMessage.save();

    // Trigger Resend email notification in background
    sendNotificationEmail({ name, email, subject, message });

    res.json({ success: true, message: 'Message sent successfully!' });
  } catch (error) {
    console.error('[Contact Form Error]', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

app.get('/api/messages', authMiddleware, async (req, res) => {
  try {
    const list = await Message.find().sort({ createdAt: -1 });
    res.json(list);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

/* ==========================================================================
   FILE UPLOAD ENDPOINTS
   ========================================================================== */

app.post('/api/upload', authMiddleware, uploadMiddleware.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    // Call Cloudinary upload helper (falls back to local filesystem if mock config)
    const fileUrl = await uploadToCloud(req.file);
    res.json({ success: true, url: fileUrl });
  } catch (error) {
    console.error('[Upload Error]', error);
    res.status(500).json({ success: false, message: 'Upload failed' });
  }
});

/* ==========================================================================
   SETTINGS PREFERENCE ENDPOINTS
   ========================================================================== */

app.get(['/api/settings', '/api/admin/settings'], async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = new Settings();
      await settings.save();
    }
    res.json(settings);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

app.put(['/api/settings', '/api/admin/settings'], async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) settings = new Settings();
    settings.projectView = req.body.projectView || 'grid';
    await settings.save();
    res.json({ success: true, data: settings });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

// Expose static files robots.txt and sitemap.xml
app.get('/robots.txt', (req, res) => {
  res.sendFile(path.join(__dirname, 'robots.txt'));
});

app.get('/sitemap.xml', (req, res) => {
  res.sendFile(path.join(__dirname, 'sitemap.xml'));
});

/* ==========================================================================
   DATABASE BACKUP ROUTES (IMPORT/EXPORT)
   ========================================================================== */

app.get('/api/admin/export', authMiddleware, async (req, res) => {
  try {
    const about = await About.find();
    const contact = await Contact.find();
    const projects = await Project.find().sort({ order: 1 });
    const settings = await Settings.find();
    const techstack = await TechStack.find();

    const backupData = {
      about,
      contact,
      projects,
      settings,
      techstack
    };

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', 'attachment; filename=portfolio-backup.json');
    res.json(backupData);
  } catch (error) {
    console.error('[Backup Export Error]', error);
    res.status(500).json({ success: false, message: 'Backup export failed' });
  }
});

app.post('/api/admin/import', authMiddleware, async (req, res) => {
  const { about, contact, projects, settings, techstack } = req.body;
  
  if (!about || !contact || !projects || !settings || !techstack) {
    return res.status(400).json({ success: false, message: 'Invalid backup data format' });
  }

  try {
    // Clear all existing data
    await About.deleteMany({});
    await Contact.deleteMany({});
    await Project.deleteMany({});
    await Settings.deleteMany({});
    await TechStack.deleteMany({});

    // Restore data
    if (about && about.length > 0) await About.insertMany(about);
    if (contact && contact.length > 0) await Contact.insertMany(contact);
    if (projects && projects.length > 0) await Project.insertMany(projects);
    if (settings && settings.length > 0) await Settings.insertMany(settings);
    if (techstack && techstack.length > 0) await TechStack.insertMany(techstack);

    res.json({ success: true, message: 'Portfolio data imported successfully' });
  } catch (error) {
    console.error('[Backup Import Error]', error);
    res.status(500).json({ success: false, message: 'Backup import failed' });
  }
});

// Fallback to index.html for undefined routes (supporting routing fallback)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Launch Server
app.listen(PORT, () => {
  console.log(`[Server] Listening on http://localhost:${PORT}`);
});

/* ==========================================================================
   DATABASE SEEDING LOGIC
   ========================================================================== */

async function seedDatabase() {
  try {
    // 0. Seed Resume PDF file to Cloudinary / uploads folder
    const fs = require('fs');
    const path = require('path');
    let seededResumeUrl = '/uploads/Resume.pdf';
    try {
      const resumePath = path.join(__dirname, 'Resume.pdf');
      if (fs.existsSync(resumePath)) {
        console.log('[Seed] Found Resume.pdf, copying to uploads directory...');
        const uploadsDir = path.join(__dirname, 'uploads');
        if (!fs.existsSync(uploadsDir)) {
          fs.mkdirSync(uploadsDir, { recursive: true });
        }
        fs.copyFileSync(resumePath, path.join(uploadsDir, 'Resume.pdf'));

        if (!isCloudinaryMock) {
          console.log('[Seed] Uploading Resume.pdf to Cloudinary...');
          const fileBuffer = fs.readFileSync(resumePath);
          const uploadRes = await uploadToCloud({ buffer: fileBuffer, filename: 'Resume.pdf' });
          if (uploadRes) {
            seededResumeUrl = uploadRes;
            console.log(`[Seed] Resume uploaded to Cloudinary successfully: ${seededResumeUrl}`);
          }
        } else {
          console.log(`[Seed] Cloudinary is mock. Using local fallback: ${seededResumeUrl}`);
        }
      } else {
        console.log('[Seed] Resume.pdf was not found in root directory.');
      }
    } catch (err) {
      console.error('[Seed Error] Failed to seed/upload Resume PDF:', err);
    }

    // 1. Seed Admin Account
    const adminCount = await Admin.countDocuments();
    if (adminCount === 0) {
      const defaultEmail = process.env.ADMIN_EMAIL || 'kshitijarenuke@gmail.com';
      const defaultPass = process.env.ADMIN_PASSWORD || 'admin12345';
      const defaultAdmin = new Admin({ email: defaultEmail, password: defaultPass });
      await defaultAdmin.save();
      console.log(`[Seed] Created default Admin account: ${defaultEmail}`);
    }

    // 2. Seed About info
    const aboutCount = await About.countDocuments();
    if (aboutCount === 0) {
      const defaultAbout = new About({
        heading: 'Kshitija Renuke',
        description: 'Passionate MERN stack developer and UI designer dedicated to building beautiful, clean, and interactive digital solutions.',
        profileImage: '',
        stats: [
          { label: 'Experience', value: 'Fresh Graduate' },
          { label: 'Projects', value: '10+' },
          { label: 'Skills', value: '20+' }
        ],
        resumeUrl: seededResumeUrl
      });
      await defaultAbout.save();
      console.log('[Seed] Created default About info');
    } else {
      // Update existing record if it points to placeholder
      const aboutDoc = await About.findOne();
      if (aboutDoc && (aboutDoc.resumeUrl === '/Resume.pdf' || !aboutDoc.resumeUrl.startsWith('http'))) {
        aboutDoc.resumeUrl = seededResumeUrl;
        await aboutDoc.save();
        console.log(`[Seed] Existing About resumeUrl updated to: ${seededResumeUrl}`);
      }
    }

    // 3. Seed Contact Details
    const contactCount = await Contact.countDocuments();
    if (contactCount === 0) {
      const defaultContact = new Contact({
        email: 'kshitijarenuke@gmail.com',
        phone: '+91 8850535352',
        location: 'Lalbaug, Mumbai',
        available: true,
        socials: {
          github: 'https://github.com/kshitijarenuke-cell',
          linkedin: 'https://www.linkedin.com/in/kshitija-renuke-5596452b4/',
          instagram: 'https://www.instagram.com/kshitijaa__x6/',
          leetcode: 'https://leetcode.com/u/kshitijarenuke/'
        },
        resumeUrl: seededResumeUrl
      });
      await defaultContact.save();
      console.log('[Seed] Created default Contact details');
    } else {
      // Update existing record if it points to placeholder
      const contactDoc = await Contact.findOne();
      if (contactDoc && (contactDoc.resumeUrl === '/Resume.pdf' || !contactDoc.resumeUrl.startsWith('http'))) {
        contactDoc.resumeUrl = seededResumeUrl;
        await contactDoc.save();
        console.log(`[Seed] Existing Contact resumeUrl updated to: ${seededResumeUrl}`);
      }
    }

    // 4. Seed TechStack
    const techCount = await TechStack.countDocuments();
    if (techCount === 0) {
      const defaultTech = [
        { category: 'Languages', name: 'JavaScript', icon: 'fab fa-js text-[#F7DF1E]', order: 0 },
        { category: 'Languages', name: 'HTML5', icon: 'fab fa-html5 text-[#E34F26]', order: 1 },
        { category: 'Languages', name: 'CSS3', icon: 'fab fa-css3-alt text-[#1572B6]', order: 2 },
        { category: 'Frontend', name: 'React', icon: 'fab fa-react text-[#61DAFB]', order: 3 },
        { category: 'Frontend', name: 'Tailwind CSS', icon: 'fab fa-css3-alt text-[#38BDF8]', order: 4 },
        { category: 'Backend', name: 'Node.js', icon: 'fab fa-node-js text-[#339933]', order: 5 },
        { category: 'Backend', name: 'Express.js', icon: 'fas fa-server text-gray-400', order: 6 },
        { category: 'Database', name: 'MongoDB', icon: 'fas fa-database text-[#47A248]', order: 7 },
        { category: 'Tools', name: 'Git', icon: 'fab fa-git-alt text-[#F05032]', order: 8 }
      ];
      await TechStack.insertMany(defaultTech);
      console.log('[Seed] Created default TechStack items');
    }

    // 5. Seed Projects
    const projectCount = await Project.countDocuments();
    if (projectCount === 0) {
      const defaultProjects = [
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
      ];
      await Project.insertMany(defaultProjects);
      console.log('[Seed] Created default Projects list');
    }
  } catch (error) {
    console.error('[Seed Error]', error);
  }
}
