import { PrismaClient } from '@prisma/client';

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
  console.log('Seeding initial ArtVest categories and skills...');

  for (const categoryData of CATEGORIES_WITH_SKILLS) {
    const { skills, ...cat } = categoryData;
    const category = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: cat,
      create: cat,
    });

    console.log(`✓ Category: ${category.name}`);

    for (const skill of skills) {
      await prisma.skill.upsert({
        where: { slug: skill.slug },
        update: { name: skill.name, categoryId: category.id },
        create: { name: skill.name, slug: skill.slug, categoryId: category.id },
      });
    }
  }

  console.log('ArtVest categories & skills seeded successfully.');
}

main()
  .catch((e) => {
    console.error('Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
