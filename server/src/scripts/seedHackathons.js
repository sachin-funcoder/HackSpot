import { connectDatabase, disconnectDatabase } from '../config/database.js';
import env from '../config/env.js';
import Hackathon, { computeHackathonStatus } from '../models/hackathon.model.js';
import User from '../models/user.model.js';

function addDays(baseDate, days) {
  const date = new Date(baseDate.getTime());
  date.setUTCDate(date.getUTCDate() + days);
  return date;
}

function buildDemoHackathons(now) {
  return [
    {
      title: 'NovaMind AI Campus Challenge',
      slug: 'demo-novamind-ai-campus-challenge',
      shortDescription:
        'Build practical generative AI tools and agentic workflows that solve real student productivity and campus accessibility challenges.',
      description:
        'NovaMind AI Campus Challenge is a 48-hour fictional demonstration hackathon bringing together student engineers, designers, and researchers to build helpful AI applications. Teams will receive curated evaluation datasets, mentor office hours, and judging feedback across technical execution, safety, and real-world impact. Prototype ideas can range from study assistants and lecture accessibility tools to automated lab-note organizers.',
      organizerName: 'NovaMind Student Collective (Demo)',
      organizerLogo: '',
      bannerImage: '',
      mode: 'online',
      location: 'Virtual (Global)',
      startDate: addDays(now, 6),
      endDate: addDays(now, 8),
      registrationDeadline: addDays(now, 5),
      registrationLink: 'https://demo.hackspot.example/events/novamind-ai-campus-challenge',
      eligibility: 'Open to undergraduate and graduate students worldwide',
      prizePool: '$15,000 in prizes & compute credits',
      teamSizeMin: 2,
      teamSizeMax: 4,
      requiredSkills: ['Python', 'React', 'LLMs', 'FastAPI'],
      categories: ['Artificial Intelligence', 'Open Innovation'],
    },
    {
      title: 'TensorForge Applied ML Sprint',
      slug: 'demo-tensorforge-applied-ml-sprint',
      shortDescription:
        'Design, train, and evaluate lightweight machine learning models for healthcare diagnostics, climate forecasting, and edge inference.',
      description:
        'TensorForge Applied ML Sprint is a weekend machine learning showcase focused on reproducible experimentation and model efficiency. Participants tackle open benchmark problems with clear evaluation rubrics covering accuracy, latency, and fairness. All submissions include a working inference demo and concise model card.',
      organizerName: 'TensorForge Academic Labs (Demo)',
      organizerLogo: '',
      bannerImage: '',
      mode: 'hybrid',
      location: 'Bengaluru Tech Hub & Online',
      startDate: addDays(now, 12),
      endDate: addDays(now, 14),
      registrationDeadline: addDays(now, 10),
      registrationLink: 'https://demo.hackspot.example/events/tensorforge-applied-ml-sprint',
      eligibility: 'Open to college students and recent graduates',
      prizePool: '$12,000 + GPU Lab Grants',
      teamSizeMin: 2,
      teamSizeMax: 4,
      requiredSkills: ['Python', 'PyTorch', 'Scikit-Learn', 'Data Science'],
      categories: ['Machine Learning', 'Artificial Intelligence'],
    },
    {
      title: 'PixelCraft Full-Stack Web Jam',
      slug: 'demo-pixelcraft-fullstack-web-jam',
      shortDescription:
        'Ship a fast, accessible, full-stack web product from scratch in 36 hours with live deployment and peer design reviews.',
      description:
        'PixelCraft Full-Stack Web Jam celebrates clean engineering, thoughtful user experience, and real working software. Teams design and deploy responsive web applications addressing campus life, creator tooling, or community collaboration. Judges score architecture clarity, accessibility, UI polish, and live reliability.',
      organizerName: 'PixelCraft Builders Guild (Demo)',
      organizerLogo: '',
      bannerImage: '',
      mode: 'online',
      location: 'Virtual (Discord & Live Stream)',
      startDate: addDays(now, -1),
      endDate: addDays(now, 2),
      registrationDeadline: addDays(now, 1),
      registrationLink: 'https://demo.hackspot.example/events/pixelcraft-fullstack-web-jam',
      eligibility: 'Open to all university students and self-taught student developers',
      prizePool: '$8,500 in cash & developer tools',
      teamSizeMin: 1,
      teamSizeMax: 4,
      requiredSkills: ['React', 'Node.js', 'MongoDB', 'CSS'],
      categories: ['Web Development'],
    },
    {
      title: 'LedgerPulse Next-Gen FinTech Hack',
      slug: 'demo-ledgerpulse-fintech-hack',
      shortDescription:
        'Reimagine student personal finance, transparent micro-savings, and fraud-resistant payment workflows using modern APIs.',
      description:
        'LedgerPulse Next-Gen FinTech Hack invites interdisciplinary student teams to craft trustworthy financial tools for young adults and small campus merchants. Tracks cover budgeting intelligence, real-time anomaly detection, instant split-payments, and financial literacy dashboards.',
      organizerName: 'LedgerPulse Innovation Forum (Demo)',
      organizerLogo: '',
      bannerImage: '',
      mode: 'offline',
      location: 'Mumbai Financial District Auditorium',
      startDate: addDays(now, 18),
      endDate: addDays(now, 20),
      registrationDeadline: addDays(now, 15),
      registrationLink: 'https://demo.hackspot.example/events/ledgerpulse-fintech-hack',
      eligibility: 'Undergraduate & postgraduate students with valid college ID',
      prizePool: '$20,000 + FinTech Accelerator Mentorship',
      teamSizeMin: 2,
      teamSizeMax: 5,
      requiredSkills: ['Node.js', 'PostgreSQL', 'React', 'API Security'],
      categories: ['FinTech', 'Web Development'],
    },
    {
      title: 'ShieldGrid Cyber Defense Invitational',
      slug: 'demo-shieldgrid-cyber-defense',
      shortDescription:
        'Build defensive security tooling, automated vulnerability scanners, and incident response dashboards for modern cloud apps.',
      description:
        'ShieldGrid Cyber Defense Invitational blends hands-on defensive engineering with capture-the-flag style threat scenarios. Teams build practical open-source security utilities such as dependency risk analyzers, phishing detectors, and zero-trust configuration auditors.',
      organizerName: 'ShieldGrid Security Society (Demo)',
      organizerLogo: '',
      bannerImage: '',
      mode: 'hybrid',
      location: 'Hyderabad Cyber Campus & Virtual',
      startDate: addDays(now, 24),
      endDate: addDays(now, 26),
      registrationDeadline: addDays(now, 21),
      registrationLink: 'https://demo.hackspot.example/events/shieldgrid-cyber-defense',
      eligibility: 'Open to cybersecurity clubs and university students',
      prizePool: '$14,000 + Security Certification Vouchers',
      teamSizeMin: 2,
      teamSizeMax: 4,
      requiredSkills: ['Linux', 'Networking', 'Python', 'Web Security'],
      categories: ['Cybersecurity'],
    },
    {
      title: 'CircuitWave Smart Campus IoT Makeathon',
      slug: 'demo-circuitwave-smart-campus-iot',
      shortDescription:
        'Connect sensors, microcontrollers, and real-time cloud telemetry to create smarter, energy-aware university campuses.',
      description:
        'CircuitWave Smart Campus IoT Makeathon combines embedded hardware prototyping with live web dashboards. Teams work with ESP32/Raspberry Pi hardware kits or simulated MQTT telemetry feeds to monitor air quality, smart lab occupancy, water conservation, and campus safety.',
      organizerName: 'CircuitWave Robotics & Embedded Club (Demo)',
      organizerLogo: '',
      bannerImage: '',
      mode: 'offline',
      location: 'Pune Engineering Innovation Center',
      startDate: addDays(now, 30),
      endDate: addDays(now, 32),
      registrationDeadline: addDays(now, 27),
      registrationLink: 'https://demo.hackspot.example/events/circuitwave-smart-campus-iot',
      eligibility: 'Open to engineering, hardware, and CS students',
      prizePool: '$10,000 + Hardware Starter Kits',
      teamSizeMin: 2,
      teamSizeMax: 4,
      requiredSkills: ['C++', 'MQTT', 'Embedded Systems', 'Node.js'],
      categories: ['IoT', 'Sustainability'],
    },
    {
      title: 'GreenGrid Climate & Sustainability Hack',
      slug: 'demo-greengrid-climate-sustainability-hack',
      shortDescription:
        'Tackle urban waste reduction, clean energy routing, and carbon footprint transparency through software and open climate data.',
      description:
        'GreenGrid Climate & Sustainability Hack unites students passionate about measurable environmental impact. Using public satellite, weather, and municipal energy datasets, teams build actionable web and data platforms that help campuses and local communities cut emissions and waste.',
      organizerName: 'GreenGrid Earth Initiative (Demo)',
      organizerLogo: '',
      bannerImage: '',
      mode: 'online',
      location: 'Virtual (Global)',
      startDate: addDays(now, 9),
      endDate: addDays(now, 11),
      registrationDeadline: addDays(now, 8),
      registrationLink: 'https://demo.hackspot.example/events/greengrid-climate-sustainability-hack',
      eligibility: 'Open to all students and interdisciplinary teams',
      prizePool: '$11,000 + Climate Impact Microgrants',
      teamSizeMin: 1,
      teamSizeMax: 5,
      requiredSkills: ['React', 'Python', 'Data Visualization', 'GIS'],
      categories: ['Sustainability', 'Open Innovation'],
    },
    {
      title: 'OpenForge Cross-College Innovation Summit',
      slug: 'demo-openforge-innovation-summit',
      shortDescription:
        'Collaborate across colleges on open-source developer tools, civic tech platforms, and accessible education software.',
      description:
        'OpenForge Cross-College Innovation Summit encourages cross-campus collaboration where students from different universities team up to build open-source projects with lasting value. Tracks include Developer Experience, Inclusive EdTech, Civic Data, and Campus Community Tools.',
      organizerName: 'OpenForge Collegiate Network (Demo)',
      organizerLogo: '',
      bannerImage: '',
      mode: 'hybrid',
      location: 'Delhi NCR Innovation Hub & Online',
      startDate: addDays(now, -2),
      endDate: addDays(now, 3),
      registrationDeadline: addDays(now, 1),
      registrationLink: 'https://demo.hackspot.example/events/openforge-innovation-summit',
      eligibility: 'Open to inter-college student teams (cross-college teams encouraged)',
      prizePool: '$16,000 + Open-Source Fellowship Stipends',
      teamSizeMin: 2,
      teamSizeMax: 4,
      requiredSkills: ['JavaScript', 'Git', 'Express', 'UI/UX'],
      categories: ['Open Innovation', 'Web Development'],
    },
    {
      title: 'SynapseHealth ML Diagnostics Challenge',
      slug: 'demo-synapsehealth-ml-diagnostics',
      shortDescription:
        'Build privacy-preserving machine learning prototypes for early triage, medical imaging assistance, and rural telehealth support.',
      description:
        'SynapseHealth ML Diagnostics Challenge brings together machine learning engineers, frontend builders, and healthcare enthusiasts to prototype accessible clinical support tools using synthetic public datasets. Emphasis is placed on explainability, clear UX for clinicians, and privacy by design.',
      organizerName: 'SynapseHealth Student Forum (Demo)',
      organizerLogo: '',
      bannerImage: '',
      mode: 'online',
      location: 'Virtual (Worldwide)',
      startDate: addDays(now, 36),
      endDate: addDays(now, 39),
      registrationDeadline: addDays(now, 34),
      registrationLink: 'https://demo.hackspot.example/events/synapsehealth-ml-diagnostics',
      eligibility: 'Open to undergraduate, graduate, and PhD students',
      prizePool: '$18,000 + Research Mentorship',
      teamSizeMin: 2,
      teamSizeMax: 4,
      requiredSkills: ['Python', 'TensorFlow', 'React', 'REST APIs'],
      categories: ['Machine Learning', 'Artificial Intelligence'],
    },
    {
      title: 'VaultZero Cloud & API Security Hack',
      slug: 'demo-vaultzero-cloud-security-hack',
      shortDescription:
        'Harden modern APIs, automate secret detection, and design developer-friendly security workflows for fast-moving startups.',
      description:
        'VaultZero Cloud & API Security Hack focuses on practical DevSecOps tools that developers actually enjoy using. Build automated policy checks, real-time API abuse monitors, or interactive security onboarding sandboxes for student engineering teams.',
      organizerName: 'VaultZero DevSecOps Community (Demo)',
      organizerLogo: '',
      bannerImage: '',
      mode: 'online',
      location: 'Virtual (Global)',
      startDate: addDays(now, 43),
      endDate: addDays(now, 45),
      registrationDeadline: addDays(now, 40),
      registrationLink: 'https://demo.hackspot.example/events/vaultzero-cloud-security-hack',
      eligibility: 'Open to college students interested in backend & security engineering',
      prizePool: '$9,000 + Cloud Security Credits',
      teamSizeMin: 1,
      teamSizeMax: 3,
      requiredSkills: ['Node.js', 'Docker', 'Cybersecurity', 'Go'],
      categories: ['Cybersecurity', 'Web Development'],
    },
    {
      title: 'AeroSense Industrial IoT & Edge Hackathon',
      slug: 'demo-aerosense-industrial-iot-hackathon',
      shortDescription:
        'Design predictive maintenance pipelines and low-power edge telemetry dashboards for clean manufacturing and logistics.',
      description:
        'AeroSense Industrial IoT & Edge Hackathon challenges teams to connect simulated or real sensor streams to anomaly-detection dashboards. Participants design resilient ingestion APIs, alerting rules, and mobile-friendly operator views.',
      organizerName: 'AeroSense Maker Consortium (Demo)',
      organizerLogo: '',
      bannerImage: '',
      mode: 'offline',
      location: 'Chennai Research Park',
      startDate: addDays(now, 50),
      endDate: addDays(now, 52),
      registrationDeadline: addDays(now, 47),
      registrationLink: 'https://demo.hackspot.example/events/aerosense-industrial-iot-hackathon',
      eligibility: 'Open to undergraduate and diploma engineering students',
      prizePool: '$13,500 + Lab Prototyping Grants',
      teamSizeMin: 2,
      teamSizeMax: 5,
      requiredSkills: ['Python', 'IoT', 'Time-Series DB', 'React'],
      categories: ['IoT', 'Machine Learning'],
    },
    {
      title: 'EcoPay Green FinTech Showcase (Past Demo)',
      slug: 'demo-ecopay-green-fintech-showcase',
      shortDescription:
        'Completed fictional showcase exploring transparent green bonds, carbon-aware checkout flows, and campus sustainability rewards.',
      description:
        'EcoPay Green FinTech Showcase is a completed demonstration event included so students and admins can test the Completed status filter and inspect historical hackathon layouts on HackSpot.',
      organizerName: 'EcoPay Collegiate Sandbox (Demo)',
      organizerLogo: '',
      bannerImage: '',
      mode: 'hybrid',
      location: 'Austin Student Center & Online',
      startDate: addDays(now, -10),
      endDate: addDays(now, -7),
      registrationDeadline: addDays(now, -11),
      registrationLink: 'https://demo.hackspot.example/events/ecopay-green-fintech-showcase',
      eligibility: 'Open to all university students',
      prizePool: '$7,500 in awards',
      teamSizeMin: 2,
      teamSizeMax: 4,
      requiredSkills: ['JavaScript', 'React', 'Node.js', 'SQL'],
      categories: ['FinTech', 'Sustainability'],
    },
  ];
}

async function resolveSeedAdmin() {
  const seedEmail = process.env.SEED_ADMIN_EMAIL?.trim().toLowerCase() || '';
  const seedPassword = process.env.SEED_ADMIN_PASSWORD || '';
  const seedName = process.env.SEED_ADMIN_NAME?.trim() || 'HackSpot Admin';
  const seedCollege = process.env.SEED_ADMIN_COLLEGE?.trim() || 'HackSpot Platform Administration';

  if (seedEmail) {
    const existingByEmail = await User.findOne({ email: seedEmail });
    if (existingByEmail) {
      if (existingByEmail.role !== 'admin') {
        throw new Error(
          'SEED_ADMIN_EMAIL points to an existing non-admin user. Use an existing admin email or a dedicated new admin email.',
        );
      }
      return { admin: existingByEmail, createdAdmin: false };
    }

    if (!seedPassword || seedPassword.length < 8) {
      throw new Error(
        'SEED_ADMIN_PASSWORD (at least 8 characters) is required in server/.env to create the initial seed admin account.',
      );
    }

    const created = await User.create({
      name: seedName,
      email: seedEmail,
      password: seedPassword,
      college: seedCollege,
      skills: ['Platform Administration', 'Community Management'],
      interests: ['Hackathons', 'Student Communities'],
      role: 'admin',
    });

    return { admin: created, createdAdmin: true };
  }

  const existingAdmin = await User.findOne({ role: 'admin' }).sort({ createdAt: 1 });
  if (existingAdmin) {
    return { admin: existingAdmin, createdAdmin: false };
  }

  throw new Error(
    'No admin user found in MongoDB. Set SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD (min 8 chars) in server/.env before running the seed script.',
  );
}

async function seedHackathons() {
  if (env.nodeEnv === 'production' && !process.argv.includes('--allow-production')) {
    console.error(
      '[Seed] Refusing to seed demo hackathons in production mode. Pass --allow-production only if explicitly intended.',
    );
    process.exit(1);
  }

  try {
    await connectDatabase();

    const { admin, createdAdmin } = await resolveSeedAdmin();
    if (createdAdmin) {
      console.log(`[Seed] Created admin account from environment variables (${admin.name}).`);
    } else {
      console.log(`[Seed] Using existing admin account (${admin.name}).`);
    }

    const demoRecords = buildDemoHackathons(new Date());
    let insertedCount = 0;
    let updatedCount = 0;

    for (const record of demoRecords) {
      const computedStatus = computeHackathonStatus(record.startDate, record.endDate);
      const existing = await Hackathon.findOne({ slug: record.slug });

      if (existing) {
        if (!existing.isDemo) {
          console.warn(
            `[Seed] Skipping slug "${record.slug}" because it belongs to a non-demo record.`,
          );
          continue;
        }

        Object.assign(existing, record, {
          status: computedStatus,
          isDemo: true,
          createdBy: existing.createdBy || admin._id,
        });
        await existing.save();
        updatedCount += 1;
      } else {
        await Hackathon.create({
          ...record,
          status: computedStatus,
          isDemo: true,
          createdBy: admin._id,
        });
        insertedCount += 1;
      }
    }

    console.log(
      `[Seed] Demo hackathons complete — inserted: ${insertedCount}, updated: ${updatedCount}, total processed: ${demoRecords.length}.`,
    );
  } catch (error) {
    console.error(`[Seed] Failed to seed demo hackathons: ${error.message}`);
    process.exitCode = 1;
  } finally {
    await disconnectDatabase();
  }
}

seedHackathons();
