export interface CategoryMetadataFieldConfig {
  specializationsLabel: string;
  specializationsPlaceholder: string;
  specializationsHelper: string;
  specializationsSuggestions: string[];

  practiceContextLabel: string;
  practiceContextPlaceholder: string;
  practiceContextHelper: string;
  practiceContextSuggestions: string[];

  toolsLabel: string;
  toolsPlaceholder: string;
  toolsHelper: string;
  toolsSuggestions: string[];

  languagesLabel: string;
  languagesPlaceholder: string;
  languagesHelper: string;

  // Optional category-specific field (only shown for relevant category)
  categorySpecificField?: {
    key: 'vocalType' | 'techniques' | 'mediums' | 'choreographyRoles' | 'certifications';
    label: string;
    placeholder: string;
    helper: string;
    suggestions?: string[];
  };
}

export function getCategoryMetadataConfig(categorySlug?: string): CategoryMetadataFieldConfig {
  switch (categorySlug) {
    case 'music':
      return {
        specializationsLabel: 'Musical Genres & Traditions',
        specializationsPlaceholder: 'e.g. Classical, Hindustani, Indie Fusion, Jazz, Ambient',
        specializationsHelper: 'Primary genres and traditions defining your musical identity',
        specializationsSuggestions: ['Classical', 'Fusion', 'Indie', 'Folk', 'Electronic', 'Jazz', 'Acoustic', 'Hip-Hop'],

        practiceContextLabel: 'Performance & Recording Context',
        practiceContextPlaceholder: 'e.g. Studio Recording, Live Stage, Acoustic Chamber, Session Artist',
        practiceContextHelper: 'Where your musical practice primarily takes place',
        practiceContextSuggestions: ['Studio Recording', 'Live Stage', 'Independent', 'Acoustic Chamber', 'Film Score'],

        toolsLabel: 'Instruments, DAWs & Audio Gear',
        toolsPlaceholder: 'e.g. Tanpura, Logic Pro, Ableton Live, Shure SM7B, Grand Piano',
        toolsHelper: 'Core instruments, software suites or hardware tools you create with',
        toolsSuggestions: ['Acoustic Guitar', 'Piano', 'Logic Pro', 'Ableton Live', 'Microphone', 'Synthesizer'],

        languagesLabel: 'Vocal / Lyricist Languages & Dialects',
        languagesPlaceholder: 'e.g. Hindi, English, Sanskrit, Urdu',
        languagesHelper: 'Languages you perform, write, or compose in',

        categorySpecificField: {
          key: 'vocalType',
          label: 'Vocal Register / Musical Range (Optional)',
          placeholder: 'e.g. Mezzo-Soprano, Tenor, Baritone, 3 Octaves',
          helper: 'Relevant for singers, vocalists, and voice performers',
          suggestions: ['Soprano', 'Mezzo-Soprano', 'Alto', 'Tenor', 'Baritone', 'Bass'],
        },
      };

    case 'film-acting':
      return {
        specializationsLabel: 'Cinematic Specializations & Formats',
        specializationsPlaceholder: 'e.g. Narrative Cinema, Documentary, Method Acting, Indie Short',
        specializationsHelper: 'Narrative or technical specializations in film and screen arts',
        specializationsSuggestions: ['Narrative Fiction', 'Documentary', 'Indie Feature', 'Short Film', 'Commercial', 'Method Acting'],

        practiceContextLabel: 'Production & Performance Context',
        practiceContextPlaceholder: 'e.g. Independent Film Set, Theatre Stage, Commercial Studio, Festival Circuit',
        practiceContextHelper: 'Production environments where you collaborate',
        practiceContextSuggestions: ['Independent Film', 'Theatre / Stage', 'Commercial Set', 'Festival Circuit', 'OTT / Web Series'],

        toolsLabel: 'Camera Systems, Editing & Rigging Tools',
        toolsPlaceholder: 'e.g. ARRI Alexa Mini, Cooke Anamorphic, DaVinci Resolve, Premiere Pro',
        toolsHelper: 'Gear, camera bodies, lenses, or editing suites you utilize',
        toolsSuggestions: ['ARRI Alexa', 'Cooke Anamorphic', 'DaVinci Resolve', 'Premiere Pro', 'Wireless Follow Focus'],

        languagesLabel: 'Screen / Dialogue Languages & Accents',
        languagesPlaceholder: 'e.g. Hindi, English, Marathi, Bengali',
        languagesHelper: 'Languages and accents for performance, screenwriting, or direction',

        categorySpecificField: {
          key: 'techniques',
          label: 'Acting or Film Techniques (Optional)',
          placeholder: 'e.g. Stanislavski Method, Meisner, Guerrilla Directing, Anamorphic Framing',
          helper: 'Specific technical methods, training lineage, or directorial approaches',
          suggestions: ['Stanislavski', 'Meisner', 'Guerilla Filmmaking', 'Colorist Grading', 'Voice Modulation'],
        },
      };

    case 'dance':
      return {
        specializationsLabel: 'Dance Forms & Movement Styles',
        specializationsPlaceholder: 'e.g. Contemporary, Contact Improvisation, Kathak, Bharatanatyam, Hip-Hop',
        specializationsHelper: 'Core movement idioms and dance forms in your repertoire',
        specializationsSuggestions: ['Contemporary', 'Classical Indian', 'Contact Improvisation', 'Hip-Hop', 'Folk Dance', 'Ballet'],

        practiceContextLabel: 'Stage & Performance Context',
        practiceContextPlaceholder: 'e.g. Theatre Stage, Dance Film, Site-Specific, Arena Tour',
        practiceContextHelper: 'Settings where your movement practice or choreography is presented',
        practiceContextSuggestions: ['Theatre Stage', 'Dance Film', 'Site-Specific', 'Live Arena', 'Movement Laboratory'],

        toolsLabel: 'Training Lineage & Movement Techniques',
        toolsPlaceholder: 'e.g. Kalaripayattu Grounding, Floorwork, Release Technique, Gaga',
        toolsHelper: 'Movement systems, training schools, or somatic techniques',
        toolsSuggestions: ['Kalaripayattu', 'Floorwork', 'Release Technique', 'Ballet Barre', 'Somatic Alignment'],

        languagesLabel: 'Cultural Traditions & Languages (Optional)',
        languagesPlaceholder: 'e.g. Malayalam, Tamil, Hindi, English',
        languagesHelper: 'Cultural lineage, mudras, or vocalized rhythm traditions (bols/solkattu)',

        categorySpecificField: {
          key: 'choreographyRoles',
          label: 'Choreography & Performance Roles (Optional)',
          placeholder: 'e.g. Principal Soloist, Movement Director, Ensemble lead, Choreographer',
          helper: 'Roles you take on in collaborative productions',
          suggestions: ['Choreographer', 'Movement Director', 'Principal Soloist', 'Ensemble Performer'],
        },
      };

    case 'photography-video':
      return {
        specializationsLabel: 'Visual Specializations & Genres',
        specializationsPlaceholder: 'e.g. Editorial, Street, Documentary, Portraiture, Fashion, Cinematography',
        specializationsHelper: 'Visual styles and subject domains in your photographic or video portfolio',
        specializationsSuggestions: ['Editorial', 'Documentary', 'Street & Urban', 'Portraiture', 'Fashion', 'Fine Art', 'Architecture'],

        practiceContextLabel: 'Shooting & Assignment Context',
        practiceContextPlaceholder: 'e.g. Editorial Studio, On-Location Fieldwork, Commercial Assignment, Gallery',
        practiceContextHelper: 'Environments where you execute photoshoots or video productions',
        practiceContextSuggestions: ['On-Location Fieldwork', 'Studio Lighting', 'Commercial Assignment', 'Editorial Press', 'Independent Project'],

        toolsLabel: 'Cameras, Optics & Post-Processing Tools',
        toolsPlaceholder: 'e.g. Sony FX3, Hasselblad, Leica M, Capture One, Lightroom, DaVinci Resolve',
        toolsHelper: 'Primary camera bodies, prime lenses, lighting systems, and grading tools',
        toolsSuggestions: ['Sony FX3', 'Prime Lenses', 'Capture One', 'Adobe Lightroom', 'Godox Lighting', 'Gimbal'],

        languagesLabel: 'Working & Client Languages (Optional)',
        languagesPlaceholder: 'e.g. English, Hindi, French',
        languagesHelper: 'Languages for client communication and on-location production',

        categorySpecificField: {
          key: 'mediums',
          label: 'Capture Mediums & Formats (Optional)',
          placeholder: 'e.g. 35mm Analog Film, 4K 10-bit Log, Medium Format, Anamorphic Aspect Ratio',
          helper: 'Preferred capture mediums, color profiles, or film stocks',
          suggestions: ['35mm Film', '120 Medium Format', '4K Raw', 'Anamorphic', 'Monochrome'],
        },
      };

    case 'design-digital-arts':
      return {
        specializationsLabel: 'Design Disciplines & Aesthetics',
        specializationsPlaceholder: 'e.g. 3D Motion Graphics, Brand Identity, Vector Illustration, Concept Art, UI/UX',
        specializationsHelper: 'Design and digital art domains you specialize in',
        specializationsSuggestions: ['3D Motion Graphics', 'Brand Identity', 'Vector Illustration', 'Concept Art', 'UI/UX Design', 'Generative Art'],

        practiceContextLabel: 'Creative Practice & Client Context',
        practiceContextPlaceholder: 'e.g. Independent Studio, Creative Agency, Commercial Client, Digital Product',
        practiceContextHelper: 'Context of your creative output and collaborations',
        practiceContextSuggestions: ['Independent Studio', 'Design Agency', 'Freelance Commissions', 'Digital Product', 'Print & Physical'],

        toolsLabel: 'Software, 3D Engines & Hardware',
        toolsPlaceholder: 'e.g. Blender, Figma, Cinema 4D, Unreal Engine, Adobe Creative Cloud, Wacom',
        toolsHelper: 'Digital applications, render engines, and creative hardware you rely on',
        toolsSuggestions: ['Figma', 'Blender', 'Cinema 4D', 'Unreal Engine', 'Adobe Illustrator', 'Photoshop'],

        languagesLabel: 'Working Languages (Optional)',
        languagesPlaceholder: 'e.g. English, Hindi',
        languagesHelper: 'Languages for design briefs and team collaboration',

        categorySpecificField: {
          key: 'mediums',
          label: 'Primary Render Pipelines & Mediums (Optional)',
          placeholder: 'e.g. Octane Render, Vector SVG, Mixed Media, WebGL / Three.js, Print CMYK',
          helper: 'Primary output mediums, rendering engines, or technical delivery formats',
          suggestions: ['Octane Render', 'Redshift', 'Vector Graphics', 'Mixed Media', 'WebGL'],
        },
      };

    case 'production-support':
      return {
        specializationsLabel: 'Departments & Technical Specializations',
        specializationsPlaceholder: 'e.g. Live Sound Reinforcement, Stage Lighting, Set Design, Costume Styling',
        specializationsHelper: 'Production departments and technical areas of focus',
        specializationsSuggestions: ['Live Sound Reinforcement', 'Lighting Design', 'Stage Management', 'Set Construction', 'Costume & Wardrobe'],

        practiceContextLabel: 'Production Environments',
        practiceContextPlaceholder: 'e.g. Concert Tours, Film Set, Theatre Repertory, Broadcast Studio',
        practiceContextHelper: 'Types of creative productions you support',
        practiceContextSuggestions: ['Concert Touring', 'Film Studio Set', 'Theatre Repertory', 'Broadcast Television', 'Live Event Festivals'],

        toolsLabel: 'Consoles, Systems & Technical Hardware',
        toolsPlaceholder: 'e.g. Allen & Heath dLive, GrandMA3, Pro Tools, DMX Rigging, Sound Devices',
        toolsHelper: 'Mixing consoles, lighting desks, or technical rigs you operate',
        toolsSuggestions: ['Digital Audio Console', 'GrandMA Lighting Desk', 'DMX Rigging', 'Pro Tools', 'RF Wireless Systems'],

        languagesLabel: 'Crew Communication Languages',
        languagesPlaceholder: 'e.g. English, Hindi, Punjabi',
        languagesHelper: 'Languages for radio coms and crew coordination',

        categorySpecificField: {
          key: 'certifications',
          label: 'Certifications & Technical Standards (Optional)',
          placeholder: 'e.g. Dante Certified Level 2, Rigging Safety, Pyro Safety Certification',
          helper: 'Industry certifications, technical licenses, or specialized protocols',
          suggestions: ['Dante Certified', 'Rigging Safety', 'Electrical License', 'First Aid Certified'],
        },
      };

    default:
      return {
        specializationsLabel: 'Creative Specializations & Domains',
        specializationsPlaceholder: 'e.g. Contemporary, Documentary, Experimental, Classical, Digital',
        specializationsHelper: 'Primary creative focus areas and artistic disciplines',
        specializationsSuggestions: ['Contemporary', 'Classical', 'Documentary', 'Experimental', 'Commercial', 'Independent'],

        practiceContextLabel: 'Practice & Portfolio Context',
        practiceContextPlaceholder: 'e.g. Studio, Live Stage, Independent, Commercial Commissions, Freelance',
        practiceContextHelper: 'Settings where your creative work is developed and presented',
        practiceContextSuggestions: ['Studio', 'Stage', 'Independent', 'Commercial Commissions', 'Freelance'],

        toolsLabel: 'Primary Tools, Software & Equipment',
        toolsPlaceholder: 'e.g. Professional equipment, creative software, or traditional instruments',
        toolsHelper: 'Key tools, software suites, or instruments you use',
        toolsSuggestions: ['Professional Equipment', 'Creative Software', 'Traditional Instruments'],

        languagesLabel: 'Working & Cultural Languages (Optional)',
        languagesPlaceholder: 'e.g. Hindi, English',
        languagesHelper: 'Languages for communication and artistic expression',
      };
  }
}
