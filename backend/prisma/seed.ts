import { PrismaClient, UserRole, ExperienceLevel, AvailabilityStatus, PostType, PostStatus, MediaType, InquiryStatus, NotificationType } from '@prisma/client';

const prisma = new PrismaClient();

const CATEGORIES_WITH_SKILLS = [
  {
    name: 'Music',
    slug: 'music',
    description: 'Vocalists, instrumentalists, composers, producers, and lyricists',
    icon: 'music',
    themeKey: 'music',
    skills: [
      { name: 'Singer', slug: 'singer' },
      { name: 'Rapper', slug: 'rapper' },
      { name: 'Musician', slug: 'musician' },
      { name: 'Composer', slug: 'composer' },
      { name: 'Music Producer', slug: 'music-producer' },
      { name: 'Beat Producer', slug: 'beat-producer' },
      { name: 'Lyricist', slug: 'lyricist' },
      { name: 'Vocalist', slug: 'vocalist' },
    ],
  },
  {
    name: 'Film & Acting',
    slug: 'film-acting',
    description: 'Actors, directors, screenwriters, cinematographers, and film crew',
    icon: 'film',
    themeKey: 'film',
    skills: [
      { name: 'Actor', slug: 'actor' },
      { name: 'Director', slug: 'director' },
      { name: 'Screenwriter', slug: 'screenwriter' },
      { name: 'Cinematographer', slug: 'cinematographer' },
      { name: 'Film Editor', slug: 'film-editor' },
      { name: 'Assistant Director', slug: 'assistant-director' },
      { name: 'Casting Professional', slug: 'casting-professional' },
    ],
  },
  {
    name: 'Dance',
    slug: 'dance',
    description: 'Dancers, choreographers, and movement artists',
    icon: 'sparkles',
    themeKey: 'dance',
    skills: [
      { name: 'Dancer', slug: 'dancer' },
      { name: 'Choreographer', slug: 'choreographer' },
      { name: 'Dance Instructor', slug: 'dance-instructor' },
      { name: 'Dance Crew', slug: 'dance-crew' },
    ],
  },
  {
    name: 'Photography & Video',
    slug: 'photography-video',
    description: 'Photographers, videographers, and visual media editors',
    icon: 'camera',
    themeKey: 'photography',
    skills: [
      { name: 'Photographer', slug: 'photographer' },
      { name: 'Videographer', slug: 'videographer' },
      { name: 'Photo Editor', slug: 'photo-editor' },
    ],
  },
  {
    name: 'Design & Digital Arts',
    slug: 'design-digital-arts',
    description: 'Graphic designers, illustrators, 3D artists, animators, and VFX artists',
    icon: 'palette',
    themeKey: 'design',
    skills: [
      { name: 'Graphic Designer', slug: 'graphic-designer' },
      { name: 'Illustrator', slug: 'illustrator' },
      { name: 'Animator', slug: 'animator' },
      { name: '3D Artist', slug: '3d-artist' },
      { name: 'VFX Artist', slug: 'vfx-artist' },
    ],
  },
  {
    name: 'Production & Support',
    slug: 'production-support',
    description: 'Sound engineers, lighting technicians, costume designers, and crew',
    icon: 'sliders',
    themeKey: 'production',
    skills: [
      { name: 'Sound Engineer', slug: 'sound-engineer' },
      { name: 'Lighting Technician', slug: 'lighting-technician' },
      { name: 'Costume Designer', slug: 'costume-designer' },
      { name: 'Makeup Artist', slug: 'makeup-artist' },
      { name: 'Production Assistant', slug: 'production-assistant' },
      { name: 'Set Designer', slug: 'set-designer' },
      { name: 'Other Creative Professional', slug: 'other-creative' },
    ],
  },
];

async function main() {
  console.log('--- Seeding ArtVest Categories & Skills ---');

  const categoryMap = new Map<string, string>();
  const skillMap = new Map<string, string>();

  for (const categoryData of CATEGORIES_WITH_SKILLS) {
    const { skills, ...cat } = categoryData;
    const category = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: cat,
      create: cat,
    });

    categoryMap.set(category.slug, category.id);

    for (const skill of skills) {
      const createdSkill = await prisma.skill.upsert({
        where: { slug: skill.slug },
        update: { name: skill.name, categoryId: category.id },
        create: { name: skill.name, slug: skill.slug, categoryId: category.id },
      });
      skillMap.set(skill.slug, createdSkill.id);
    }
  }

  console.log('✓ Taxonomy seeded successfully.');

  console.log('--- Seeding Realistic Demo Creators & Users ---');

  // 1. Creator Aanya Sharma (Music / Jaipur)
  const userAanya = await prisma.user.upsert({
    where: { email: 'demo.aanya@artvest.local' },
    update: { name: 'Aanya Sharma', role: UserRole.CREATOR, isOnboarded: true },
    create: {
      email: 'demo.aanya@artvest.local',
      googleId: 'google_demo_aanya_101',
      name: 'Aanya Sharma',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200',
      role: UserRole.CREATOR,
      isOnboarded: true,
    },
  });

  const profileAanya = await prisma.creatorProfile.upsert({
    where: { userId: userAanya.id },
    update: {
      stageName: 'Aanya Classical',
      headline: 'Hindustani Classical Vocalist & Acoustic Composer',
      bio: 'Trained under Gwalior & Kirana gharana traditions. Exploring acoustic cross-genre fusion with indie filmmakers and ambient soundscapes.',
      location: 'Jaipur, Rajasthan',
      city: 'Jaipur',
      country: 'India',
      experienceLevel: ExperienceLevel.PROFESSIONAL,
      yearsExperience: 8,
      availability: AvailabilityStatus.AVAILABLE_FOR_COLLAB,
      primaryCategoryId: categoryMap.get('music')!,
      isVerified: true,
      isPublic: true,
      viewCount: 142,
      profileCompletionScore: 95,
      roleAttributes: { vocalRange: 'Mezzo-Soprano', classicalTradition: 'Hindustani', instruments: ['Tanpura', 'Harmonium'] },
      collaborationPreferences: { lookingFor: ['Film Directors', 'Sound Engineers', 'Music Producers'] },
    },
    create: {
      userId: userAanya.id,
      stageName: 'Aanya Classical',
      headline: 'Hindustani Classical Vocalist & Acoustic Composer',
      bio: 'Trained under Gwalior & Kirana gharana traditions. Exploring acoustic cross-genre fusion with indie filmmakers and ambient soundscapes.',
      location: 'Jaipur, Rajasthan',
      city: 'Jaipur',
      country: 'India',
      experienceLevel: ExperienceLevel.PROFESSIONAL,
      yearsExperience: 8,
      availability: AvailabilityStatus.AVAILABLE_FOR_COLLAB,
      primaryCategoryId: categoryMap.get('music')!,
      isVerified: true,
      isPublic: true,
      viewCount: 142,
      profileCompletionScore: 95,
      roleAttributes: { vocalRange: 'Mezzo-Soprano', classicalTradition: 'Hindustani', instruments: ['Tanpura', 'Harmonium'] },
      collaborationPreferences: { lookingFor: ['Film Directors', 'Sound Engineers', 'Music Producers'] },
    },
  });

  // Skills for Aanya
  if (skillMap.has('singer')) {
    await prisma.creatorSkill.upsert({
      where: { creatorProfileId_skillId: { creatorProfileId: profileAanya.id, skillId: skillMap.get('singer')! } },
      update: { isPrimary: true, proficiency: 'EXPERT', yearsExperience: 8 },
      create: { creatorProfileId: profileAanya.id, skillId: skillMap.get('singer')!, isPrimary: true, proficiency: 'EXPERT', yearsExperience: 8 },
    });
  }
  if (skillMap.has('composer')) {
    await prisma.creatorSkill.upsert({
      where: { creatorProfileId_skillId: { creatorProfileId: profileAanya.id, skillId: skillMap.get('composer')! } },
      update: { isPrimary: false, proficiency: 'ADVANCED', yearsExperience: 5 },
      create: { creatorProfileId: profileAanya.id, skillId: skillMap.get('composer')!, isPrimary: false, proficiency: 'ADVANCED', yearsExperience: 5 },
    });
  }

  // 2. Creator Kabir Verma (Film & Acting / Mumbai)
  const userKabir = await prisma.user.upsert({
    where: { email: 'demo.kabir@artvest.local' },
    update: { name: 'Kabir Verma', role: UserRole.CREATOR, isOnboarded: true },
    create: {
      email: 'demo.kabir@artvest.local',
      googleId: 'google_demo_kabir_102',
      name: 'Kabir Verma',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200',
      role: UserRole.CREATOR,
      isOnboarded: true,
    },
  });

  const profileKabir = await prisma.creatorProfile.upsert({
    where: { userId: userKabir.id },
    update: {
      stageName: 'Kabir Cinematics',
      headline: 'Narrative Cinematographer & Anamorphic Colorist',
      bio: 'Capturing textural light and human intimacy across indie cinema, music documentaries, and high-contrast short films.',
      location: 'Mumbai, Maharashtra',
      city: 'Mumbai',
      country: 'India',
      experienceLevel: ExperienceLevel.ADVANCED,
      yearsExperience: 6,
      availability: AvailabilityStatus.OPEN_TO_WORK,
      primaryCategoryId: categoryMap.get('film-acting')!,
      isVerified: true,
      isPublic: true,
      viewCount: 118,
      profileCompletionScore: 90,
      roleAttributes: { cameraGear: ['ARRI Alexa Mini', 'Cooke Anamorphic /i'], editingSuite: 'DaVinci Resolve' },
      collaborationPreferences: { lookingFor: ['Screenwriters', 'Music Composers', 'Producers'] },
    },
    create: {
      userId: userKabir.id,
      stageName: 'Kabir Cinematics',
      headline: 'Narrative Cinematographer & Anamorphic Colorist',
      bio: 'Capturing textural light and human intimacy across indie cinema, music documentaries, and high-contrast short films.',
      location: 'Mumbai, Maharashtra',
      city: 'Mumbai',
      country: 'India',
      experienceLevel: ExperienceLevel.ADVANCED,
      yearsExperience: 6,
      availability: AvailabilityStatus.OPEN_TO_WORK,
      primaryCategoryId: categoryMap.get('film-acting')!,
      isVerified: true,
      isPublic: true,
      viewCount: 118,
      profileCompletionScore: 90,
      roleAttributes: { cameraGear: ['ARRI Alexa Mini', 'Cooke Anamorphic /i'], editingSuite: 'DaVinci Resolve' },
      collaborationPreferences: { lookingFor: ['Screenwriters', 'Music Composers', 'Producers'] },
    },
  });

  if (skillMap.has('cinematographer')) {
    await prisma.creatorSkill.upsert({
      where: { creatorProfileId_skillId: { creatorProfileId: profileKabir.id, skillId: skillMap.get('cinematographer')! } },
      update: { isPrimary: true, proficiency: 'EXPERT', yearsExperience: 6 },
      create: { creatorProfileId: profileKabir.id, skillId: skillMap.get('cinematographer')!, isPrimary: true, proficiency: 'EXPERT', yearsExperience: 6 },
    });
  }

  // 3. Creator Rhea Sundaram (Dance / Bengaluru)
  const userRhea = await prisma.user.upsert({
    where: { email: 'demo.rhea@artvest.local' },
    update: { name: 'Rhea Sundaram', role: UserRole.CREATOR, isOnboarded: true },
    create: {
      email: 'demo.rhea@artvest.local',
      googleId: 'google_demo_rhea_103',
      name: 'Rhea Sundaram',
      avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200',
      role: UserRole.CREATOR,
      isOnboarded: true,
    },
  });

  const profileRhea = await prisma.creatorProfile.upsert({
    where: { userId: userRhea.id },
    update: {
      stageName: 'Rhea Movement',
      headline: 'Contemporary Choreographer & Movement Director',
      bio: 'Blending Kalaripayattu grounded aesthetics with modern contact improvisation for theatre, dance films, and music videos.',
      location: 'Bengaluru, Karnataka',
      city: 'Bengaluru',
      country: 'India',
      experienceLevel: ExperienceLevel.PROFESSIONAL,
      yearsExperience: 7,
      availability: AvailabilityStatus.FREELANCE,
      primaryCategoryId: categoryMap.get('dance')!,
      isVerified: true,
      isPublic: true,
      viewCount: 89,
      profileCompletionScore: 85,
    },
    create: {
      userId: userRhea.id,
      stageName: 'Rhea Movement',
      headline: 'Contemporary Choreographer & Movement Director',
      bio: 'Blending Kalaripayattu grounded aesthetics with modern contact improvisation for theatre, dance films, and music videos.',
      location: 'Bengaluru, Karnataka',
      city: 'Bengaluru',
      country: 'India',
      experienceLevel: ExperienceLevel.PROFESSIONAL,
      yearsExperience: 7,
      availability: AvailabilityStatus.FREELANCE,
      primaryCategoryId: categoryMap.get('dance')!,
      isVerified: true,
      isPublic: true,
      viewCount: 89,
      profileCompletionScore: 85,
    },
  });

  if (skillMap.has('choreographer')) {
    await prisma.creatorSkill.upsert({
      where: { creatorProfileId_skillId: { creatorProfileId: profileRhea.id, skillId: skillMap.get('choreographer')! } },
      update: { isPrimary: true, proficiency: 'EXPERT', yearsExperience: 7 },
      create: { creatorProfileId: profileRhea.id, skillId: skillMap.get('choreographer')!, isPrimary: true, proficiency: 'EXPERT', yearsExperience: 7 },
    });
  }

  // 4. Community Users (Enthusiasts / Collaborators)
  const userRohan = await prisma.user.upsert({
    where: { email: 'demo.rohan@artvest.local' },
    update: { name: 'Rohan Sen', role: UserRole.USER, isOnboarded: true },
    create: {
      email: 'demo.rohan@artvest.local',
      googleId: 'google_demo_rohan_201',
      name: 'Rohan Sen',
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200',
      role: UserRole.USER,
      isOnboarded: true,
    },
  });

  const userMeera = await prisma.user.upsert({
    where: { email: 'demo.meera@artvest.local' },
    update: { name: 'Meera Nair', role: UserRole.USER, isOnboarded: true },
    create: {
      email: 'demo.meera@artvest.local',
      googleId: 'google_demo_meera_202',
      name: 'Meera Nair',
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200',
      role: UserRole.USER,
      isOnboarded: true,
    },
  });

  console.log('✓ Demo users & creator profiles seeded.');

  console.log('--- Seeding Showcase Posts & Media ---');

  // Post 1: Aanya's Published Audio Showcase
  const postAanya1 = await prisma.post.upsert({
    where: { id: 'seed_post_aanya_raag_yaman' },
    update: {
      title: 'Raag Yaman Acoustic Vocal Exploration',
      caption: 'A night raga meditation recorded at sunrise with acoustic Tanpura and minimal chamber reverb.',
      postType: PostType.AUDIO,
      status: PostStatus.PUBLISHED,
      isFeatured: true,
      categoryId: categoryMap.get('music'),
    },
    create: {
      id: 'seed_post_aanya_raag_yaman',
      authorId: userAanya.id,
      creatorProfileId: profileAanya.id,
      title: 'Raag Yaman Acoustic Vocal Exploration',
      caption: 'A night raga meditation recorded at sunrise with acoustic Tanpura and minimal chamber reverb.',
      description: 'Recorded live in Jaipur studio. Exploring microtonal teevra madhyam inflections.',
      postType: PostType.AUDIO,
      status: PostStatus.PUBLISHED,
      isFeatured: true,
      categoryId: categoryMap.get('music'),
      tags: ['Hindustani', 'Vocal', 'RaagYaman', 'Classical', 'Acoustic'],
      publishedAt: new Date(Date.now() - 86400000 * 3), // 3 days ago
    },
  });

  await prisma.postMedia.upsert({
    where: { id: 'seed_media_aanya_1' },
    update: {
      url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    },
    create: {
      id: 'seed_media_aanya_1',
      postId: postAanya1.id,
      mediaType: MediaType.AUDIO,
      url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
      thumbnailUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600',
      duration: 184.5,
      orderIndex: 0,
      meta: { waveform: [12, 24, 45, 60, 80, 65, 40, 50, 75, 90, 60, 30, 20, 15] },
    },
  });

  // Post 2: Aanya's Draft Showcase
  await prisma.post.upsert({
    where: { id: 'seed_post_aanya_draft_1' },
    update: {},
    create: {
      id: 'seed_post_aanya_draft_1',
      authorId: userAanya.id,
      creatorProfileId: profileAanya.id,
      title: 'Morning Ragas Studio Practice Notes',
      caption: 'Explorations in Todi and Bhairav. Raw stems awaiting mixing.',
      postType: PostType.AUDIO,
      status: PostStatus.DRAFT,
      categoryId: categoryMap.get('music'),
      tags: ['StudioNotes', 'WorkInProgress'],
    },
  });

  // Post 3: Kabir's Published Video Reel
  const postKabir1 = await prisma.post.upsert({
    where: { id: 'seed_post_kabir_bandra' },
    update: {
      title: 'Dusk at Bandra Fort — 35mm Anamorphic Reel',
      caption: 'Golden-hour maritime lighting test shot on 35mm anamorphic glass overlooking the Arabian Sea.',
      postType: PostType.VIDEO,
      status: PostStatus.PUBLISHED,
      isFeatured: true,
      categoryId: categoryMap.get('film-acting'),
    },
    create: {
      id: 'seed_post_kabir_bandra',
      authorId: userKabir.id,
      creatorProfileId: profileKabir.id,
      title: 'Dusk at Bandra Fort — 35mm Anamorphic Reel',
      caption: 'Golden-hour maritime lighting test shot on 35mm anamorphic glass overlooking the Arabian Sea.',
      postType: PostType.VIDEO,
      status: PostStatus.PUBLISHED,
      isFeatured: true,
      categoryId: categoryMap.get('film-acting'),
      tags: ['Cinematography', '35mm', 'Anamorphic', 'ColorGrading', 'Mumbai'],
      publishedAt: new Date(Date.now() - 86400000 * 2), // 2 days ago
    },
  });

  await prisma.postMedia.upsert({
    where: { id: 'seed_media_kabir_1' },
    update: {},
    create: {
      id: 'seed_media_kabir_1',
      postId: postKabir1.id,
      mediaType: MediaType.VIDEO,
      url: 'https://res.cloudinary.com/demo/video/upload/dog.mp4',
      thumbnailUrl: 'https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?w=600',
      duration: 48.0,
      orderIndex: 0,
    },
  });

  // Post 4: Rhea's Published Video Series
  const postRhea1 = await prisma.post.upsert({
    where: { id: 'seed_post_rhea_movement' },
    update: {},
    create: {
      id: 'seed_post_rhea_movement',
      authorId: userRhea.id,
      creatorProfileId: profileRhea.id,
      title: 'Fluidity in Chaos — Studio Movement Series',
      caption: 'Contact improvisation exploring kinetic friction, gravity transfer, and silent breath dynamics.',
      postType: PostType.VIDEO,
      status: PostStatus.PUBLISHED,
      categoryId: categoryMap.get('dance'),
      tags: ['Dance', 'Choreography', 'Contemporary', 'Movement'],
      publishedAt: new Date(Date.now() - 86400000 * 1), // 1 day ago
    },
  });

  await prisma.postMedia.upsert({
    where: { id: 'seed_media_rhea_1' },
    update: {},
    create: {
      id: 'seed_media_rhea_1',
      postId: postRhea1.id,
      mediaType: MediaType.VIDEO,
      url: 'https://res.cloudinary.com/demo/video/upload/dog.mp4',
      thumbnailUrl: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=600',
      duration: 35.0,
      orderIndex: 0,
    },
  });

  console.log('✓ Showcases & media seeded.');

  console.log('--- Seeding Social Interactions (Likes, Comments, Follows) ---');

  // Likes on Aanya's showcase
  await prisma.like.upsert({
    where: { postId_userId: { postId: postAanya1.id, userId: userRohan.id } },
    update: {},
    create: { postId: postAanya1.id, userId: userRohan.id },
  });
  await prisma.like.upsert({
    where: { postId_userId: { postId: postAanya1.id, userId: userMeera.id } },
    update: {},
    create: { postId: postAanya1.id, userId: userMeera.id },
  });
  await prisma.like.upsert({
    where: { postId_userId: { postId: postAanya1.id, userId: userKabir.id } },
    update: {},
    create: { postId: postAanya1.id, userId: userKabir.id },
  });

  // Likes on Kabir's showcase
  await prisma.like.upsert({
    where: { postId_userId: { postId: postKabir1.id, userId: userRohan.id } },
    update: {},
    create: { postId: postKabir1.id, userId: userRohan.id },
  });

  // Saves (Bookmarks)
  await prisma.save.upsert({
    where: { postId_userId: { postId: postAanya1.id, userId: userRohan.id } },
    update: {},
    create: { postId: postAanya1.id, userId: userRohan.id },
  });
  await prisma.save.upsert({
    where: { postId_userId: { postId: postKabir1.id, userId: userRohan.id } },
    update: {},
    create: { postId: postKabir1.id, userId: userRohan.id },
  });

  // Comments on Aanya's showcase
  const comment1 = await prisma.comment.upsert({
    where: { id: 'seed_comment_rohan_aanya' },
    update: { content: 'The transition into teevra madhyam around 1:15 gives chills. Pure pitch clarity!' },
    create: {
      id: 'seed_comment_rohan_aanya',
      postId: postAanya1.id,
      authorId: userRohan.id,
      content: 'The transition into teevra madhyam around 1:15 gives chills. Pure pitch clarity!',
    },
  });

  // Nested reply from Aanya
  await prisma.comment.upsert({
    where: { id: 'seed_reply_aanya_rohan' },
    update: { content: 'Thank you Rohan! We spent hours tuning the tanpura drones to 432Hz before tracking.' },
    create: {
      id: 'seed_reply_aanya_rohan',
      postId: postAanya1.id,
      authorId: userAanya.id,
      parentId: comment1.id,
      content: 'Thank you Rohan! We spent hours tuning the tanpura drones to 432Hz before tracking.',
    },
  });

  // Follows
  await prisma.follow.upsert({
    where: { followerId_followingId: { followerId: userRohan.id, followingId: userAanya.id } },
    update: {},
    create: { followerId: userRohan.id, followingId: userAanya.id },
  });
  await prisma.follow.upsert({
    where: { followerId_followingId: { followerId: userMeera.id, followingId: userAanya.id } },
    update: {},
    create: { followerId: userMeera.id, followingId: userAanya.id },
  });
  await prisma.follow.upsert({
    where: { followerId_followingId: { followerId: userRohan.id, followingId: userKabir.id } },
    update: {},
    create: { followerId: userRohan.id, followingId: userKabir.id },
  });
  await prisma.follow.upsert({
    where: { followerId_followingId: { followerId: userKabir.id, followingId: userRhea.id } },
    update: {},
    create: { followerId: userKabir.id, followingId: userRhea.id },
  });

  console.log('✓ Social graph & interactions seeded.');

  console.log('--- Seeding Collaboration Inquiries & Notifications ---');

  // Inquiry 1: Rohan sends to Aanya (PENDING)
  const inq1 = await prisma.collaborationInquiry.upsert({
    where: { id: 'seed_inquiry_rohan_aanya' },
    update: { status: InquiryStatus.PENDING },
    create: {
      id: 'seed_inquiry_rohan_aanya',
      senderId: userRohan.id,
      recipientId: userAanya.id,
      postId: postAanya1.id,
      message: 'Hi Aanya, I am supervising a Rajasthani heritage documentary score and would love to feature your vocal alaps.',
      status: InquiryStatus.PENDING,
    },
  });

  // Inquiry 2: Kabir sends to Aanya (ACCEPTED)
  const inq2 = await prisma.collaborationInquiry.upsert({
    where: { id: 'seed_inquiry_kabir_aanya' },
    update: { status: InquiryStatus.ACCEPTED },
    create: {
      id: 'seed_inquiry_kabir_aanya',
      senderId: userKabir.id,
      recipientId: userAanya.id,
      message: 'Looking to pair your classical vocals with an anamorphic cinema poem shot in Jodhpur.',
      status: InquiryStatus.ACCEPTED,
    },
  });

  // Notifications for Aanya
  await prisma.notification.upsert({
    where: { id: 'seed_notif_aanya_like' },
    update: {},
    create: {
      id: 'seed_notif_aanya_like',
      recipientId: userAanya.id,
      actorId: userRohan.id,
      type: NotificationType.POST_LIKED,
      title: 'New Like',
      message: 'liked your showcase "Raag Yaman Acoustic Vocal Exploration"',
      resourceId: postAanya1.id,
      resourceType: 'POST',
      isRead: false,
    },
  });

  await prisma.notification.upsert({
    where: { id: 'seed_notif_aanya_comment' },
    update: {},
    create: {
      id: 'seed_notif_aanya_comment',
      recipientId: userAanya.id,
      actorId: userRohan.id,
      type: NotificationType.COMMENT_CREATED,
      title: 'New Comment',
      message: 'commented: "The transition into teevra madhyam around 1:15 gives chills..."',
      resourceId: postAanya1.id,
      resourceType: 'POST',
      isRead: false,
    },
  });

  await prisma.notification.upsert({
    where: { id: 'seed_notif_aanya_follow' },
    update: {},
    create: {
      id: 'seed_notif_aanya_follow',
      recipientId: userAanya.id,
      actorId: userMeera.id,
      type: NotificationType.CREATOR_FOLLOWED,
      title: 'New Follower',
      message: 'started following your creative journey',
      resourceId: userMeera.id,
      resourceType: 'USER',
      isRead: true,
      readAt: new Date(),
    },
  });

  await prisma.notification.upsert({
    where: { id: 'seed_notif_aanya_inquiry' },
    update: {},
    create: {
      id: 'seed_notif_aanya_inquiry',
      recipientId: userAanya.id,
      actorId: userRohan.id,
      type: NotificationType.COLLABORATION_INQUIRY_CREATED,
      title: 'New Collaboration Inquiry',
      message: 'sent you a collaboration inquiry for Rajasthani heritage documentary score',
      resourceId: inq1.id,
      resourceType: 'INQUIRY',
      isRead: false,
    },
  });

  // Notification for Kabir (acceptance notification from Aanya)
  await prisma.notification.upsert({
    where: { id: 'seed_notif_kabir_accepted' },
    update: {},
    create: {
      id: 'seed_notif_kabir_accepted',
      recipientId: userKabir.id,
      actorId: userAanya.id,
      type: NotificationType.COLLABORATION_ACCEPTED,
      title: 'Inquiry Accepted',
      message: 'accepted your collaboration inquiry for the Jodhpur cinema poem',
      resourceId: inq2.id,
      resourceType: 'INQUIRY',
      isRead: false,
    },
  });

  console.log('✓ Collaboration inquiries & notifications seeded.');
  console.log('========================================================');
  console.log('ArtVest Complete Demo Ecosystem Seeded Successfully!');
  console.log('Demo Creator Accounts:');
  console.log('  1. Aanya Sharma (Classical Vocalist) : demo.aanya@artvest.local');
  console.log('  2. Kabir Verma (Cinematographer)     : demo.kabir@artvest.local');
  console.log('  3. Rhea Sundaram (Choreographer)     : demo.rhea@artvest.local');
  console.log('Demo Member Accounts:');
  console.log('  1. Rohan Sen (Enthusiast / Listener) : demo.rohan@artvest.local');
  console.log('  2. Meera Nair (Creative Director)    : demo.meera@artvest.local');
  console.log('========================================================');
}

main()
  .catch((e) => {
    console.error('Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
