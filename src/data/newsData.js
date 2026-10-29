const newsData = [
  // =========================
  // SPORTS
  // =========================
  {
    id: 1,
    slug: 'nepal-wins-cricket-match',
    title: 'Nepal Wins Cricket Match',
    category: 'Sports',
    description: 'Nepal wins an exciting cricket match.',
    image: '/news1.jpg',
    content:
      'Nepal secured an impressive victory in an exciting cricket match. The team performed strongly throughout the game and secured a memorable win.',
  },

  {
    id: 2,
    slug: 'nepal-prepares-for-big-tournament',
    title: 'Nepal Prepares for Big Tournament',
    category: 'Sports',
    description:
      'Nepal cricket team begins preparation for an upcoming international tournament.',
    image: '/news2.jpg',
    content:
      'The Nepal cricket team has started intensive preparation for an upcoming international tournament. Players are focusing on fitness, batting and bowling performance.',
  },

  {
    id: 3,
    slug: 'football-championship-final',
    title: 'Football Championship Reaches Final',
    category: 'Sports',
    description:
      'The national football championship reaches an exciting final.',
    image: '/news3.jpg',
    content:
      'The national football championship has reached its final stage. Fans are looking forward to an exciting match between the two strongest teams.',
  },

  // =========================
  // TECHNOLOGY
  // =========================
  {
    id: 4,
    slug: 'new-technology-in-nepal',
    title: 'New Technology in Nepal',
    category: 'Technology',
    description:
      'New technology is changing the way people work.',
    image: '/news4.jpg',
    content:
      'New technology is creating new opportunities for businesses and communities across Nepal.',
  },

  {
    id: 5,
    slug: 'artificial-intelligence-growing',
    title: 'Artificial Intelligence Is Growing',
    category: 'Technology',
    description:
      'Artificial intelligence is becoming more common in everyday life.',
    image: '/news5.jpg',
    content:
      'Artificial intelligence is being used in education, business, healthcare and many other areas. New AI tools are helping people complete tasks faster.',
  },

  {
    id: 6,
    slug: 'new-mobile-apps-launched',
    title: 'New Mobile Apps Launched',
    category: 'Technology',
    description:
      'Several new mobile applications are being introduced to users.',
    image: '/news6.jpg',
    content:
      'Developers have launched several new mobile applications designed to make communication, business and everyday activities easier.',
  },

  // =========================
  // BUSINESS
  // =========================
  {
    id: 7,
    slug: 'business-market-growing',
    title: 'Business Market Growing',
    category: 'Business',
    description:
      "Nepal's business market continues to grow.",
    image: '/news7.jpg',
    content:
      'The business market is showing positive growth with new companies and investment opportunities emerging across the country.',
  },

  {
    id: 8,
    slug: 'new-businesses-open-in-kathmandu',
    title: 'New Businesses Open in Kathmandu',
    category: 'Business',
    description:
      'New businesses are opening in different parts of Kathmandu.',
    image: '/news8.jpg',
    content:
      'Several new businesses have started operations in Kathmandu, creating employment opportunities and providing new services to customers.',
  },

  {
    id: 9,
    slug: 'small-businesses-get-new-opportunities',
    title: 'Small Businesses Get New Opportunities',
    category: 'Business',
    description:
      'Small businesses are finding new opportunities through digital platforms.',
    image: '/news9.jpg',
    content:
      'Small businesses are increasingly using digital platforms to reach customers, promote their products and expand their markets.',
  },

  // =========================
  // MOVIES
  // =========================
  {
    id: 10,
    slug: 'new-nepal-movie-released',
    title: 'New Nepali Movie Released',
    category: 'Movies',
    description:
      'A new Nepali movie has been released.',
    image: '/movie1.jpg',
    content:
      'A new Nepali movie has been released in cinemas. The movie has attracted attention from audiences across the country.',
  },

  {
    id: 11,
    slug: 'popular-actor-announces-new-movie',
    title: 'Popular Actor Announces New Movie',
    category: 'Movies',
    description:
      'A popular Nepali actor announces a new movie project.',
    image: '/movie2.jpg',
    content:
      'A popular actor has announced a new movie project. The production team is preparing to begin filming soon.',
  },

  {
    id: 12,
    slug: 'nepali-film-wins-award',
    title: 'Nepali Film Wins International Award',
    category: 'Movies',
    description:
      'A Nepali film receives recognition at an international film festival.',
    image: '/movie3.jpg',
    content:
      'A Nepali film has received an international award for its storytelling and production. The achievement has brought attention to Nepali cinema.',
  },

  // =========================
  // POLITICS
  // =========================
  {
    id: 13,
    slug: 'government-announces-new-policy',
    title: 'Government Announces New Policy',
    category: 'Politics',
    description:
      'The government announces a new policy for citizens.',
    image: '/politics1.jpg',
    content:
      'The government has announced a new policy focused on improving public services and supporting communities across the country.',
  },

  {
    id: 14,
    slug: 'parliament-discusses-new-bill',
    title: 'Parliament Discusses New Bill',
    category: 'Politics',
    description:
      'Parliament discusses a new bill during its latest session.',
    image: '/politics2.jpg',
    content:
      'Members of parliament discussed a new bill during the latest parliamentary session. Further discussion is expected in the coming days.',
  },

  {
    id: 15,
    slug: 'local-election-preparations-begin',
    title: 'Local Election Preparations Begin',
    category: 'Politics',
    description:
      'Preparations for upcoming local elections have started.',
    image: '/politics3.jpg',
    content:
      'Election authorities have started preparations for upcoming local elections and are working on the necessary arrangements.',
  },

  // =========================
  // ENTERTAINMENT
  // =========================
  {
    id: 16,
    slug: 'music-festival-announced',
    title: 'Music Festival Announced',
    category: 'Entertainment',
    description:
      'A major music festival has been announced for this year.',
    image: '/entertainment1.jpg',
    content:
      'A major music festival is scheduled to take place this year. Several popular artists are expected to participate.',
  },

  {
    id: 17,
    slug: 'popular-singer-releases-new-song',
    title: 'Popular Singer Releases New Song',
    category: 'Entertainment',
    description:
      'A popular singer releases a new song for fans.',
    image: '/entertainment2.jpg',
    content:
      'A popular singer has released a new song that is quickly gaining attention from fans and listeners.',
  },

  {
    id: 18,
    slug: 'celebrity-event-attracts-crowd',
    title: 'Celebrity Event Attracts Large Crowd',
    category: 'Entertainment',
    description:
      'A celebrity event attracts a large number of fans.',
    image: '/entertainment3.jpg',
    content:
      'A major celebrity event attracted a large crowd of fans. The event included performances, interviews and entertainment activities.',
  },

  // =========================
  // HEALTH
  // =========================
  {
    id: 19,
    slug: 'health-awareness-program',
    title: 'Health Awareness Program Held',
    category: 'Health',
    description:
      'A health awareness program is organized for local communities.',
    image: '/health1.jpg',
    content:
      'A health awareness program was organized to educate people about healthy lifestyles, nutrition and regular health checkups.',
  },

  {
    id: 20,
    slug: 'doctors-share-health-tips',
    title: 'Doctors Share Important Health Tips',
    category: 'Health',
    description:
      'Doctors share useful tips for maintaining a healthy lifestyle.',
    image: '/health2.jpg',
    content:
      'Health professionals have shared practical advice about maintaining a balanced lifestyle and taking care of personal health.',
  },

  // =========================
  // EDUCATION
  // =========================
  {
    id: 21,
    slug: 'schools-prepare-for-new-session',
    title: 'Schools Prepare for New Session',
    category: 'Education',
    description:
      'Schools across the country prepare for a new academic session.',
    image: '/education1.jpg',
    content:
      'Schools are preparing classrooms, teachers and learning materials for the beginning of a new academic session.',
  },

  {
    id: 22,
    slug: 'students-get-new-learning-opportunities',
    title: 'Students Get New Learning Opportunities',
    category: 'Education',
    description:
      'Students are getting access to new learning opportunities.',
    image: '/education2.jpg',
    content:
      'New educational programs are providing students with additional opportunities to improve their skills and knowledge.',
  },
];

export const dashboardData = {
  total: 25,
  live: 12,
  scheduled: 5,
  categories: 8,
  banners: 6,
  active_banners: 4,
};

export default newsData;
;
