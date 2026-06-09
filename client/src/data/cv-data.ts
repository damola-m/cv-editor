/* ===================================
   cv-data.ts
   -----------------------------------
   - Structured CV content for Adedamola Michael.
   - AI edits only fields marked as editable in the type.
   =================================== */

// ==========================================
// TYPES
// ==========================================

export type ExperienceEntry = {
  id: string;
  period: string;
  role: string;
  company: string;
  location: string;
  bullets: string[];
  keyProject?: { name: string; bullets: string[] };
};

export type EducationEntry = {
  institution: string;
  degree: string;
  detail?: string;
};

export type SkillCategory = {
  label: string;
  items: string[];
};

export type CVData = {
  // =============================
  // Part 1 — Static (AI never touches)
  // =============================
  _static: {
    name: string;
    contact: {
      address: string;
      phone: string;
      email: string;
      portfolio: string;
    };
    registrations: {
      ribaMem: string;
      arbReg: string;
      ncarbCert: string;
    };
    military: {
      period: string;
      role: string;
      unit: string;
      location: string;
    };
  };

  // =============================
  // Part 2 — AI-editable fields
  // =============================
  summary: string;
  experience: ExperienceEntry[];
  education: EducationEntry[];
  certifications: string[];
  awards: string[];
  skills: SkillCategory[];
};

// ==========================================
// DEFAULT DATA
// ==========================================

export const defaultCV: CVData = {
  _static: {
    name: 'Adedamola Michael',
    contact: {
      address: 'Seattle',
      phone: '+1 2*6992***',
      email: 'adedam***@yahoo.com',
      portfolio: 'www.damola.ca',
    },
    registrations: {
      ribaMem: 'MEM NO:20018797',
      arbReg: 'REG NO:110304C',
      ncarbCert: 'CERT NO:110848',
    },
    military: {
      period: '2016 – 2022',
      role: 'Class 4 Vehicle Mechanic',
      unit: 'British Army (Reservist)',
      location: 'Derby',
    },
  },

  summary:
    'I specialise in computational design and BIM management within the AEC industry, combining deep technical expertise with strategic leadership to deliver innovative, sustainable solutions. My career has spanned global firms across multiple continents, leading teams and driving the adoption of advanced computational workflows from conceptual design through to construction execution.\n\n' +
    'As an Associate Computational Design Specialist at CannonDesign, I develop and oversee custom script libraries, plugins, and web applications whilst mentoring teams in advanced computational design processes. My work includes leading the development of Aurora, a comprehensive environmental analysis suite, and CannonFly, a Grasshopper plugin suite for ArcGIS integration. I\'ve successfully led initiatives that accelerate modelling processes significantly, establish design consistency across teams, and enhance collaboration with fabrication partners and consultants.\n\n' +
    'My approach combines technical depth with strategic thinking. I\'ve mentored teams in BIM processes, managed project models for optimal performance, and developed automation solutions that resolve conflicts and extract critical data for CoBie and dRofus. My contributions have been recognised through published case studies, including work featured by Speckle on optimising processes and accelerating project delivery.\n\n' +
    'I hold a First-Class BA (Honours) in Architecture and a Distinction in MArch Architecture from the University of Portsmouth, alongside an MSc in Computer Science with Data Analytics. I\'m a registered architect in both the UK (ARB) and Washington State, bringing both design sensibility and technical rigour to leadership roles.\n\n' +
    'My technical proficiency spans visual programming platforms (Grasshopper, Dynamo, Rhino.Inside.Revit) and extensive programming experience in C#, Python, JavaScript, and C++, enabling me to guide technical strategy whilst remaining hands-on when needed. I\'m driven by the opportunity to lead teams, shape technical direction, and solve complex challenges that deliver tangible value to project teams and clients.',

  experience: [
    {
      id: 'cannon',
      period: 'Jun 2025 – Present',
      role: 'Computational Design Specialist',
      company: 'CannonDesign',
      location: 'Remote',
      bullets: [
        'Developed custom script libraries and automation workflows using Rhino.Inside.Revit, Revit API etc., accelerating complex tasks.',
        'Developed CannonFly, a custom company Grasshopper plugin featuring ArcGIS integration and geospatial analysis tools for concept-stage design.',
        'Created Aurora, a full-stack environmental analysis web application with 3D visualisation supporting wind, solar, and outdoor comfort analysis.',
        'Delivered company-wide computational design training and workshops, building internal capability and establishing best practices for adoption across teams.',
      ],
    },
    {
      id: 'pe-seattle',
      period: 'Sep 2024 – May 2025',
      role: 'Associate',
      company: 'Perkins Eastman',
      location: 'Seattle',
      bullets: [],
      keyProject: {
        name: 'Burnaby Pedestrian Bridge, Burnaby Canada',
        bullets: [
          'Integrated Grasshopper, Dynamo, and C# scripting to streamline workflows and ensure smooth use with Revit.',
          'Developed and managed scalable and robust computational solutions, enhancing design accuracy and automating documentation to align with BIM standards.',
          'Managed resource allocation using Deltek Vision in alignment with budget constraints in the £19 million project.',
          'Facilitated bi-weekly technical communication with stakeholders, fostering transparent communication among all involved parties.',
        ],
      },
    },
    {
      id: 'pe-vancouver',
      period: 'Jan 2022 – Aug 2024',
      role: 'Architect / Computational Manager',
      company: 'Perkins Eastman',
      location: 'Vancouver, BC',
      bullets: [],
    },
    {
      id: 'rps',
      period: 'Sep 2021 – Jan 2022',
      role: 'Architectural / Computational Designer',
      company: 'RPS Group',
      location: 'Newark',
      bullets: [
        'Conducted thorough data analysis using Python and SQL to extract meaningful insights, including PowerBI visualisation.',
        'Developed custom C# scripts and plugins using Microsoft Visual Studio to facilitate comprehensive data and design analysis.',
        'Utilised tools such as Revit, Rhinoceros and Grasshopper to enhance the design process and optimise project outcomes.',
      ],
    },
    {
      id: 'benoy',
      period: 'Sep 2019 – Sep 2021',
      role: 'Architectural / Computational Designer',
      company: 'Benoy',
      location: 'Newark & London',
      bullets: [],
      keyProject: {
        name: 'Gera Development, Pune India',
        bullets: [
          'Led the concept and detailed design for three 16-storey office buildings and a 2-storey podium with F&B, retail, and restaurants.',
          'Spearheaded the facade development using Grasshopper and bespoke Python/C# solutions to shape the building\'s form and mass.',
          'Collaborated closely with the local architect and structural team.',
          'Held regular design meetings with the client and visited the site every 3 months to ensure alignment with their vision and project objectives.',
        ],
      },
    },
    {
      id: 'noissap',
      period: 'Sep 2017 – Sep 2019',
      role: 'Computation Lead and Data Analyst',
      company: 'noissaP Studio',
      location: 'London',
      bullets: [],
      keyProject: {
        name: 'Eternal Wall of Answered Prayers, Birmingham UK',
        bullets: [
          'Led the winning £9.3 million RIBA competition entry as the Lead Designer, collaborating with a fellow Architectural Assistant.',
          'Conceptualised and developed the parametric sculpture design, integrating innovative architectural technology and artistic vision.',
          'Produced conceptual sketches, Photoshop renders, detailed plans, and meticulously crafted models for the competition submission.',
        ],
      },
    },
    {
      id: 'snug',
      period: 'Aug 2016 – Sep 2017',
      role: 'Architectural Designer',
      company: 'Snug Architects',
      location: 'Southampton',
      bullets: [],
      keyProject: {
        name: 'Envision Powerplant, Sunderland UK',
        bullets: [
          'Utilised Revit API and Dynamo to automate the generation of plans, sections, and elevations for the giga factory office section.',
          'Coordinated with the in-house structural team for seamless integration of architectural and structural elements.',
          'Developed custom JavaScript tools to enhance workflows in BIM 360, improving data management and collaboration.',
        ],
      },
    },
    {
      id: 'codemasters',
      period: 'Sep 2013 – Aug 2016',
      role: 'Programmer & 3D Environment Artist',
      company: 'Codemasters',
      location: 'Warwick',
      bullets: [
        'Developed and enhanced 3D graphics technologies including rendering, lighting, shaders, and scene management using C/C++ for PC and console platforms.',
        'Collaborated with cross-functional teams to integrate graphics solutions into game engines using tools such as Maya, Blender, and Unity.',
        'Created and refined 3D environments for games, ensuring visual fidelity and immersive experiences.',
      ],
    },
  ],

  education: [
    {
      institution: 'University of Portsmouth',
      degree: 'MArch Architecture',
      detail: 'Distinction',
    },
    {
      institution: 'University of Portsmouth',
      degree: 'BA (Hons) Architecture',
      detail: 'First Class',
    },
    {
      institution: 'University of York',
      degree: 'MSc Computer Science with Data Analytics',
    },
    {
      institution: 'Newcastle University',
      degree: 'Architectural Practice and Management',
      detail: 'PGDip',
    },
    {
      institution: 'Harvard University',
      degree: 'Introduction to Artificial Intelligence with Python',
    },
    {
      institution: 'Harvard University',
      degree: 'Machine Learning and AI with Python',
    },
    {
      institution: 'Northampton College',
      degree: 'National Diploma in Art & Design',
      detail: 'Distinction',
    },
  ],

  certifications: [
    'Architects Registration Board [UK] — Licensed Architect',
    'Washington State Department of Licensing — Architect\'s Certificate of Registration',
    'Royal Institute of British Architects — Chartered Architect',
    'National Council of Architectural Registration Boards — NCARB Certificate',
    'American Institute of Architects — AIA Member',
    'Project Management Institute — Project Management Professional (PMP)®',
  ],

  awards: [
    'Saving Efforts on Bridge Design with Speckle (Published Case Study)',
    'RIBA Presidents Medal Nomination',
    'Architect\'s Journal Student Prize Nomination',
    '3DReid Student Prize Nomination',
    'Dibben Prize for demonstrated understanding of construction and materials',
    'Architecture Prize for the best portfolio',
  ],

  skills: [
    {
      label: 'Data & Scripting',
      items: ['Python', 'C#', 'SQL', 'Grasshopper'],
    },
    {
      label: 'Visualisation',
      items: ['Power BI', 'Lumion', 'Unreal', 'Adobe'],
    },
    {
      label: '3D Modelling',
      items: ['Revit', 'AutoCAD', 'Rhino', 'SketchUp', 'Maya'],
    },
    {
      label: 'Rendering & Animation',
      items: ['Miro', 'Figma', 'Blender'],
    },
    {
      label: 'Collaboration',
      items: ['Power BI', 'Miro', 'Figma'],
    },
  ],
};
