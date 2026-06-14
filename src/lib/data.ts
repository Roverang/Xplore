// Shared mock data + helpers used by Home, Club profile, Event detail and Search.
// Designed so future uploaded media (logos, banners, posters) drop into media-frame slots.

export type Club = {
  id: string;
  name: string;
  category: string;
  members: number;
  tagline: string;
  about: string;
  founded: string;
  president: string;
  image?: string;
};

export type EventItem = {
  id: string;
  name: string;
  clubId: string;
  venue: string;
  date: string;
  time: string;
  tag: string;
  about: string;
  fee: string;
  capacity: number;
  registered: number;
  image?: string;
};

export type Opportunity = {
  id: string;
  title: string;
  org: string;
  type: string;
  stipend: string;
  location: string;
  duration: string;
  about: string;
  image?: string;
};

export type Member = { name: string; role: string };
export type Post = { id: string; author: string; time: string; body: string };

const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

export const clubs: Club[] = [
  { name: "GEEEK Workshop", category: "Technology", members: 412, tagline: "Hands-on hardware & maker culture.", about: "GEEEK is the campus hub for makers, tinkerers and embedded enthusiasts. We host weekly build sessions, hardware hackathons and industry mentor talks.", founded: "2014", president: "Aditya Rao", image: "/images/clubs/geeek-workshop.png" },
  { name: "Octaves", category: "Music", members: 286, tagline: "The official music society of NIT Jalandhar.", about: "Octaves brings together vocalists, instrumentalists and producers. We perform at every campus fest and host open-mic nights.", founded: "2009", president: "Priya Sharma", image: "/images/clubs/octaves.png" },
  { name: "Aavishkar", category: "Coding", members: 524, tagline: "Competitive programming & open source.", about: "Aavishkar runs CP contests, DSA bootcamps and open source sprints. Alumni at Google, Stripe and Atlassian.", founded: "2011", president: "Rohan Verma", image: "/images/clubs/aavishkar.png" },
  { name: "Pragyan", category: "Literary", members: 198, tagline: "Words. Debate. Storytelling.", about: "Pragyan is the literary and debating society — MUNs, slam poetry and the campus magazine.", founded: "2008", president: "Ananya Singh", image: "/images/clubs/pragyan.png" },
  { name: "Robotics Club", category: "Engineering", members: 367, tagline: "From line followers to autonomous swarms.", about: "Robotics Club competes in Robocon, e-Yantra and inter-NIT meets. State-of-the-art lab in CSE block.", founded: "2012", president: "Karan Patel", image: "/images/clubs/robotics-club.png" },
  { name: "E-Cell", category: "Entrepreneurship", members: 445, tagline: "Backing the next campus founders.", about: "Entrepreneurship Cell runs the pre-incubator, pitch nights and the annual Startup Pitch Fest.", founded: "2015", president: "Sneha Iyer", image: "/images/clubs/e-cell.png" },
].map((c) => ({ ...c, id: slug(c.name) }));

export const events: EventItem[] = [
  { name: "Bhangra Workshop", clubId: "octaves", venue: "Student Activity Center", date: "16 May 2026", time: "5:30 PM", tag: "Cultural", about: "Two-hour high-energy intro session led by senior performers. Open to all years.", fee: "Free", capacity: 80, registered: 54, image: "/images/events/bhangra-workshop.png" },
  { name: "METRA Exhibition", clubId: "geeeek-workshop", venue: "Main Lawn", date: "18 May 2026", time: "10:00 AM", tag: "Tech", about: "Annual maker exhibition showcasing student-built hardware projects across 30+ booths.", fee: "Free", capacity: 400, registered: 211, image: "/images/events/metra-exhibition.png" },
  { name: "Hackathon 2026", clubId: "aavishkar", venue: "CSE Block", date: "22 May 2026", time: "9:00 AM", tag: "Tech", about: "36-hour overnight hackathon. Tracks: AI, FinTech, Campus OS. ₹2L prize pool.", fee: "₹150 / team", capacity: 300, registered: 248, image: "/images/events/hackathon-2026.png" },
  { name: "Startup Pitch Fest", clubId: "e-cell", venue: "Auditorium", date: "28 May 2026", time: "4:00 PM", tag: "Business", about: "Pitch your startup to a panel of VCs and alumni founders. Top 3 get pre-incubation.", fee: "Free", capacity: 250, registered: 167, image: "/images/events/startup-pitch-fest.png" },
  { name: "Sports Analytics Summit", clubId: "aavishkar", venue: "Seminar Hall 2", date: "02 Jun 2026", time: "11:00 AM", tag: "Sports", about: "Talks from JioStar, Dream11 and ESPNcricinfo data teams. Includes a live data jam.", fee: "Free", capacity: 150, registered: 92, image: "/images/events/sports-analytics-summit.png" },
  { name: "AI Bootcamp", clubId: "aavishkar", venue: "ECE Block", date: "08 Jun 2026", time: "10:00 AM", tag: "Tech", about: "5-day bootcamp covering transformers, RAG and agentic workflows. Hands-on labs daily.", fee: "₹499", capacity: 120, registered: 89, image: "/images/events/ai-bootcamp.png" },
].map((e) => ({ ...e, id: slug(e.name) }));

export const opportunities: Opportunity[] = [
  { title: "Campus Ambassador", org: "Unstop", type: "Part-time", stipend: "₹8,000/mo", location: "Remote", duration: "3 months", about: "Represent Unstop on campus, drive registrations and host info sessions.", image: "/images/brands/unstop.png" },
  { title: "Marketing Intern", org: "Zomato", type: "Internship", stipend: "₹15,000/mo", location: "Gurugram", duration: "6 months", about: "Work with the brand team on campus activations and growth campaigns.", image: "/images/brands/zomato.png" },
  { title: "Sports Research Analyst", org: "JioStar", type: "Internship", stipend: "₹20,000/mo", location: "Mumbai", duration: "6 months", about: "Build dashboards and insight decks for cricket, football and kabaddi properties.", image: "/images/brands/jiostar.png" },
  { title: "Event Volunteer", org: "TEDx NITJ", type: "Volunteer", stipend: "Certificate", location: "On-campus", duration: "1 month", about: "Help run our annual TEDx event — logistics, hospitality and content.", image: "/images/brands/tedx-nitj.png" },
  { title: "Startup Intern", org: "Razorpay", type: "Internship", stipend: "₹25,000/mo", location: "Bengaluru", duration: "6 months", about: "Engineering / Product internship across the payments and banking stack.", image: "/images/brands/razorpay.png" },
  { title: "Content Creator", org: "Coding Ninjas", type: "Freelance", stipend: "₹10,000/mo", location: "Remote", duration: "Ongoing", about: "Create short-form tech content and tutorial threads for the campus audience.", image: "/images/brands/unstop.png" },
].map((o) => ({ ...o, id: slug(o.title + "-" + o.org) }));

export const clubMembers: Record<string, Member[]> = {
  default: [
    { name: "Aditya Rao", role: "President" },
    { name: "Sara Khan", role: "Vice President" },
    { name: "Manish Gupta", role: "Tech Lead" },
    { name: "Ishita Bose", role: "Design Lead" },
    { name: "Rahul Yadav", role: "Events Head" },
    { name: "Tanvi Mehta", role: "Outreach" },
    { name: "Aman Chawla", role: "Core" },
    { name: "Pooja Reddy", role: "Core" },
  ],
};

export const clubPosts: Post[] = [
  { id: "p1", author: "Club Board", time: "2h ago", body: "Inductions for the new academic year open next Monday — fill the form pinned in the WhatsApp group." },
  { id: "p2", author: "Tech Lead", time: "Yesterday", body: "Recap of last weekend's build sprint — 9 working prototypes, see the gallery for photos." },
  { id: "p3", author: "Events Head", time: "3 days ago", body: "We're collaborating with E-Cell for a joint demo day. Save the date: 30 May." },
];

export const getClub = (id: string) => clubs.find((c) => c.id === id);
export const getEvent = (id: string) => events.find((e) => e.id === id);
export const getClubEvents = (clubId: string) => events.filter((e) => e.clubId === clubId);
