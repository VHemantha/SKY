/**
 * Starter content and first admin account.
 * Safe to run more than once: existing records are left untouched.
 * Used by `npm run db:seed` and, on Netlify Database, automatically on first request / first login.
 */
import type { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const destinations = [
  {
    slug: "yala-national-park",
    name: "Yala National Park",
    region: "Southern & Uva Provinces",
    image: "/images/yala-leopard.jpg",
    summary:
      "Sri Lanka's most famous park and one of the best places in the world to see wild leopards, set among dry scrub, rocky outcrops and coastal lagoons.",
    description:
      "Yala is Sri Lanka's best-known national park, stretching along the south-east coast between Tissamaharama and Kataragama. Its open scrub, granite outcrops, lagoons and beaches support one of the highest densities of leopards anywhere.\n\nBesides leopards, Yala is home to Asian elephants, sloth bears, spotted deer, wild buffalo, mugger crocodiles and more than 200 species of birds. Most safaris explore Block 1, the most visited zone; quieter blocks are available for travellers who want fewer jeeps around.",
    highlights:
      "Sri Lankan leopard\nAsian elephant\nSloth bear\nMugger crocodile\nPeacocks, painted storks and bee-eaters",
    bestTime:
      "February to July offers the best sightings as water holes shrink. Block 1 usually closes for a few weeks between September and October each year.",
    sortOrder: 10,
  },
  {
    slug: "udawalawe-national-park",
    name: "Udawalawe National Park",
    region: "Sabaragamuwa & Uva Provinces",
    image: "/images/udawalawe-elephants.jpg",
    summary:
      "The most reliable place in Sri Lanka to see wild elephants, with open grasslands around a large reservoir and the Elephant Transit Home next door.",
    description:
      "Udawalawe's open grassland and scrub around the Udawalawe reservoir make wildlife easy to spot. The park is famous for its resident elephant herds, which can be seen year-round, often with young calves.\n\nNext to the park, the Elephant Transit Home cares for orphaned calves before releasing them back into the wild — feeding times are a lovely add-on to a morning safari.",
    highlights: "Herds of wild elephants\nWater buffalo\nSpotted deer\nCrested serpent eagle\nElephant Transit Home feeding",
    bestTime: "Good all year round. Early morning and late afternoon drives are best for light and activity.",
    sortOrder: 20,
  },
  {
    slug: "wilpattu-national-park",
    name: "Wilpattu National Park",
    region: "North Western & North Central Provinces",
    image: "/images/wilpattu-sambar.jpg",
    summary:
      "Sri Lanka's largest national park — a quiet wilderness of forest and natural lakes (villus) where leopards and sloth bears roam with far fewer jeeps.",
    description:
      "Wilpattu is the largest and one of the oldest national parks in Sri Lanka. Its name means \"land of lakes\" after the dozens of natural sand-rimmed lakes, called villus, scattered through dense forest.\n\nBecause it is larger and less visited than Yala, safaris here feel wild and unhurried. Leopards, sloth bears, elephants and sambar deer are all present, and the birdlife around the villus is excellent.",
    highlights: "Leopard\nSloth bear\nSambar and spotted deer\nNatural lakes (villus)\nFar fewer safari jeeps",
    bestTime: "February to October, with the dry months from May to September often best for sightings.",
    sortOrder: 30,
  },
  {
    slug: "minneriya-national-park",
    name: "Minneriya National Park",
    region: "North Central Province",
    image: "/images/minneriya-gathering.jpg",
    summary:
      "Home of \"The Gathering\", when hundreds of elephants come together on the shores of the ancient Minneriya reservoir during the dry season.",
    description:
      "Minneriya lies in Sri Lanka's Cultural Triangle, close to Sigiriya, Dambulla and Polonnaruwa. At its heart is the Minneriya tank, a reservoir built more than 1,500 years ago.\n\nIn the dry season, as water elsewhere disappears, elephants from the surrounding forests move to the grassy shores of the tank — at times hundreds at once. When conditions shift, guides often move the safari to neighbouring Kaudulla or Hurulu Eco Park to follow the herds.",
    highlights: "The Elephant Gathering\nLarge elephant herds\nOpen lakeside grassland\nAncient reservoir\nEasy add-on to Sigiriya",
    bestTime: "The Gathering usually peaks from July to October, especially August and September.",
    sortOrder: 40,
  },
  {
    slug: "kumana-national-park",
    name: "Kumana National Park",
    region: "Eastern Province",
    image: "/images/kumana.jpg",
    summary:
      "A remote park on the east coast, joined to Yala, famous for its mangrove swamp and huge nesting colonies of water birds.",
    description:
      "Kumana sits on the far south-east coast, bordering Yala but on the other side of the Kumbukkan Oya river. Its lagoons and the Kumana villu mangrove swamp attract thousands of nesting water birds.\n\nKumana also has leopards, elephants and bears, and sees far fewer visitors than Yala — ideal for birdwatchers and travellers looking for a quieter safari near Arugam Bay.",
    highlights: "Nesting water birds\nMangrove swamp\nLeopard and elephant\nVery few visitors\nClose to Arugam Bay",
    bestTime: "April to July is the main bird-nesting season.",
    sortOrder: 50,
  },
  {
    slug: "bundala-national-park",
    name: "Bundala National Park",
    region: "Southern Province",
    image: "/images/bundala.jpg",
    summary:
      "A coastal wetland and Ramsar site near Hambantota, home to flamingos, migrant shorebirds, crocodiles and elephants.",
    description:
      "Bundala is a mosaic of shallow lagoons, salt pans, dunes and scrub along the south coast. It was Sri Lanka's first Ramsar wetland of international importance.\n\nIt is a paradise for birdwatchers — especially in the northern winter when migratory waders and greater flamingos arrive — and a relaxed half-day safari to combine with Yala.",
    highlights: "Greater flamingo (seasonal)\nMigratory shorebirds\nMugger and saltwater crocodiles\nElephants\nCoastal lagoons",
    bestTime: "September to March, when migratory birds are present.",
    sortOrder: 60,
  },
  {
    slug: "horton-plains-national-park",
    name: "Horton Plains National Park",
    region: "Central Highlands",
    image: "/images/horton-plains.jpg",
    summary:
      "A cool, misty highland plateau with cloud forest, grassland and the dramatic World's End cliff — explored on foot.",
    description:
      "Horton Plains sits at over 2,000 metres in Sri Lanka's central highlands and is part of a UNESCO World Heritage site. Unlike lowland parks, it is explored on a walking trail of about 9 km.\n\nThe loop passes World's End, a sheer cliff with views to the south coast on a clear morning, and Baker's Falls. Sambar deer, endemic birds and unique montane plants make it very different from a jeep safari.",
    highlights: "World's End viewpoint\nBaker's Falls\nSambar deer\nEndemic highland birds\nCloud forest walk",
    bestTime: "January to March for the clearest mornings. Start early — mist often rolls in by 10 am.",
    sortOrder: 70,
  },
];

const tours = [
  {
    slug: "yala-leopard-safari-full-day",
    title: "Yala Leopard Safari — Full Day",
    type: "DAY_SAFARI",
    parks: ["yala-national-park"],
    duration: "Approx. 12 hours",
    price: 180,
    currency: "USD",
    priceBasis: "PER_JEEP",
    maxGroupSize: 6,
    featured: true,
    sortOrder: 10,
    coverImage: "/images/yala-leopard.jpg",
    gallery: ["/images/yala-jeep.jpg", "/images/yala-jeeps.jpg"],
    summary:
      "A full day inside Yala from gate opening to closing, giving you the best possible chance of seeing leopards, elephants and sloth bears.",
    description:
      "Spend the whole day in Yala with a private jeep and an experienced driver-tracker. Being inside the park from first light to closing time means you can explore further than half-day jeeps and wait patiently at sightings.\n\nWe stop for a packed breakfast and lunch at a designated rest area by the sea, then continue tracking through the afternoon when animals become active again.",
    highlights:
      "Private jeep for your group only\nInside the park from opening to closing\nPacked breakfast and lunch inside the park\nExperienced local driver-tracker",
    included:
      "Private safari jeep with driver-tracker\nPickup and drop-off in Tissamaharama / Kirinda\nPacked breakfast and lunch\nBottled water",
    excluded: "Park entrance tickets (paid at the gate, per person)\nTips for your driver\nPersonal expenses",
    itinerary:
      "5:00 am — Hotel pickup :: We collect you from your hotel in Tissamaharama or Kirinda.\n6:00 am — Enter Yala :: Morning game drive in search of leopards, elephants and bears.\n9:00 am — Breakfast :: Packed breakfast at a rest area inside the park.\n12:00 pm — Lunch by the sea :: Rest during the hottest part of the day.\n2:00 pm — Afternoon game drive :: Animals return to water holes as it cools down.\n6:00 pm — Exit park & drop-off :: Back at your hotel around 6:30 pm.",
  },
  {
    slug: "yala-morning-safari",
    title: "Yala Half-Day Morning Safari",
    type: "DAY_SAFARI",
    parks: ["yala-national-park"],
    duration: "Approx. 5 hours",
    price: 95,
    currency: "USD",
    priceBasis: "PER_JEEP",
    maxGroupSize: 6,
    featured: true,
    sortOrder: 20,
    coverImage: "/images/yala-jeep.jpg",
    gallery: ["/images/yala-jeeps.jpg"],
    summary:
      "The classic Yala experience: an early-morning game drive when leopards and birds are most active, back in time for a late breakfast.",
    description:
      "Mornings are one of the best times to see wildlife in Yala. We pick you up before dawn so you're at the gate when it opens, then spend the morning exploring with a private jeep and driver.\n\nThis is a great choice if you're short on time or travelling with children.",
    highlights: "Be at the gate at opening time\nBest light for photography\nGood option for families",
    included: "Private safari jeep with driver-tracker\nHotel pickup and drop-off nearby\nBottled water",
    excluded: "Park entrance tickets\nMeals\nTips",
    itinerary:
      "5:00 am — Hotel pickup\n6:00 am — Morning game drive :: Leopards, elephants, crocodiles, birdlife.\n10:30 am — Return to your hotel",
  },
  {
    slug: "udawalawe-elephant-safari",
    title: "Udawalawe Elephant Safari",
    type: "DAY_SAFARI",
    parks: ["udawalawe-national-park"],
    duration: "Approx. 4 hours",
    price: 70,
    currency: "USD",
    priceBasis: "PER_JEEP",
    maxGroupSize: 6,
    featured: true,
    sortOrder: 30,
    coverImage: "/images/udawalawe-elephants.jpg",
    gallery: [],
    summary:
      "Get close to wild elephant herds in the open grasslands of Udawalawe — the most dependable elephant safari in Sri Lanka.",
    description:
      "Udawalawe's open landscape means elephant sightings are almost guaranteed. Watch family herds bathing, feeding and playing with their calves, and look out for buffalo, deer and birds of prey.\n\nAdd a visit to the Elephant Transit Home to see orphaned calves at feeding time.",
    highlights: "Wild elephants almost every drive\nOpen landscape, great for photos\nOptional Elephant Transit Home visit",
    included: "Private safari jeep with driver\nHotel pickup and drop-off in Udawalawe\nBottled water",
    excluded: "Park entrance tickets\nElephant Transit Home ticket\nTips",
    itinerary: "6:00 am — Hotel pickup\n6:30 am — Game drive :: Elephant herds around the reservoir.\n10:00 am — Return to hotel",
  },
  {
    slug: "wilpattu-overnight-camping-safari",
    title: "Wilpattu Overnight Camping Safari",
    type: "OVERNIGHT",
    parks: ["wilpattu-national-park"],
    duration: "2 days / 1 night",
    price: 260,
    currency: "USD",
    priceBasis: "PER_PERSON",
    maxGroupSize: 6,
    featured: true,
    sortOrder: 40,
    coverImage: "/images/wilpattu-sambar.jpg",
    gallery: [],
    summary:
      "Two game drives in quiet, wild Wilpattu with a night in a comfortable tented camp on the edge of the park.",
    description:
      "Wilpattu rewards patience. On this overnight safari you'll enjoy an afternoon drive, a night under canvas at a tented camp near the park boundary, and a second drive the next morning.\n\nMeals are freshly cooked at camp, and evenings are spent around the fire listening to the sounds of the jungle.",
    highlights: "Two game drives in Wilpattu\nNight in a tented camp\nFewer jeeps, wilder experience\nAll meals at camp",
    included:
      "Two safari drives in a private jeep\nOne night tented camp accommodation\nDinner, breakfast and lunch\nNaturalist guide",
    excluded: "Park entrance tickets\nTransport to Wilpattu (can be arranged)\nDrinks and tips",
    itinerary:
      "Day 1, 1:00 pm — Arrive at camp :: Check in and lunch.\nDay 1, 2:30 pm — Afternoon game drive :: Search for leopards and sloth bears around the villus.\nDay 1, evening — Camp dinner :: Dinner around the campfire.\nDay 2, 6:00 am — Morning game drive :: Packed breakfast inside the park.\nDay 2, 12:00 pm — Lunch & departure",
  },
  {
    slug: "minneriya-elephant-gathering-private-safari",
    title: "Minneriya Elephant Gathering — Private Safari",
    type: "PRIVATE",
    parks: ["minneriya-national-park"],
    duration: "Approx. 4 hours",
    price: 85,
    currency: "USD",
    priceBasis: "PER_JEEP",
    maxGroupSize: 6,
    featured: true,
    sortOrder: 50,
    coverImage: "/images/minneriya-gathering.jpg",
    gallery: ["/images/sigiriya.jpg"],
    summary:
      "An afternoon private safari to see large elephant herds on the shores of the ancient Minneriya reservoir — easy from Sigiriya and Habarana.",
    description:
      "In the dry season Minneriya hosts one of the largest gatherings of Asian elephants in the world. Our drivers keep in touch with each other and will choose Minneriya, Kaudulla or Hurulu on the day — wherever the herds are.\n\nAfternoon light over the reservoir makes this one of the most photogenic safaris in Sri Lanka.",
    highlights:
      "Private jeep for your group\nDriver picks the best park on the day\nEasy pickup from Sigiriya, Habarana or Dambulla",
    included: "Private safari jeep with driver\nPickup and drop-off in Sigiriya, Habarana or Dambulla\nBottled water",
    excluded: "Park entrance tickets\nTips",
    itinerary: "2:00 pm — Hotel pickup\n3:00 pm — Afternoon game drive :: Elephant herds by the reservoir.\n6:30 pm — Return to hotel",
  },
  {
    slug: "sigiriya-night-nature-walk",
    title: "Night Nature Walk near Sigiriya",
    type: "NIGHT_SAFARI",
    parks: [],
    duration: "Approx. 2 hours",
    price: 30,
    currency: "USD",
    priceBasis: "PER_PERSON",
    maxGroupSize: 8,
    featured: false,
    sortOrder: 60,
    coverImage: "/images/sigiriya.jpg",
    gallery: [],
    summary:
      "Discover the nocturnal side of Sri Lanka with a naturalist guide — look for slender lorises, owls, nightjars, frogs and civets.",
    description:
      "National parks in Sri Lanka close at dusk, but the forests and village edges around Sigiriya come alive at night. With torches and a naturalist guide, you'll walk quiet trails looking for slender lorises, owls, civets, geckos and frogs.\n\nThe walk is gentle and suitable for most ages.",
    highlights: "Slender loris and owls\nExpert naturalist guide\nTorches provided\nSuitable for families",
    included: "Naturalist guide\nTorches\nHotel pickup in Sigiriya",
    excluded: "Tips",
    itinerary: "7:00 pm — Pickup from your hotel\n7:30 pm — Night walk :: Gentle trails outside the protected area.\n9:30 pm — Return to hotel",
  },
];

const faqs = [
  ["What is the best time for a safari in Sri Lanka?", "It depends on the park. Yala is best from February to July, the Minneriya elephant gathering peaks from July to October, and Udawalawe is good all year. Tell us your dates and we'll suggest the best parks."],
  ["Are park entrance fees included in the price?", "Unless a tour says otherwise, national park tickets are paid separately at the gate because they are set by the Department of Wildlife Conservation and charged per person. We'll tell you the current cost before you book."],
  ["Will I definitely see a leopard?", "Nobody can promise wildlife sightings, but Yala and Wilpattu have some of the highest leopard densities in the world. A full-day safari gives you the best chance."],
  ["Do you pick up from hotels?", "Yes. Pickup and drop-off from hotels near the park are included in our tours. We can also arrange transfers from further away, such as Colombo, Galle or Ella."],
  ["Is a safari suitable for children?", "Yes — children love safaris. For young children we recommend a half-day safari. Please tell us their ages so we can bring the right seating."],
  ["What should I bring?", "Neutral-coloured clothing, a hat, sunscreen, insect repellent, binoculars, a camera and a light jacket for early mornings. We provide drinking water."],
  ["How do I book and pay?", "Send us an enquiry or message us on WhatsApp. We'll confirm availability and send a quote. A small deposit confirms your booking, with the balance payable on the day."],
  ["What is your cancellation policy?", "Please see our Terms & Conditions for full details. If a park closes or weather prevents a safari, we'll offer another date or a refund for the services we couldn't provide."],
  ["Can you plan a full Sri Lanka holiday?", "Yes. As well as safaris, we can arrange round tours covering Sigiriya, Kandy, the tea country, Ella and the south coast beaches, with a private driver."],
];

const pages = [
  {
    slug: "about",
    title: "About Skylantic Holidays",
    metaDescription:
      "Skylantic Holidays is a young Sri Lankan travel company offering wildlife safaris and tailor-made holidays with local guides and honest prices.",
    body: `Skylantic Holidays is a new Sri Lankan travel company with a simple idea: help visitors experience the island's wild places the way locals love them — with patience, respect and good company.

## Who we are

We are a small start-up team based in Sri Lanka. We grew up visiting these parks, and we work with experienced drivers, trackers and guides from the communities around them.

Being new means we're focused on getting every trip right. You'll deal directly with the people planning your safari, and we reply personally to every message.

## What we do

- Day safaris in Yala, Udawalawe, Wilpattu, Minneriya and more
- Overnight and camping safaris
- Private safaris for families, couples and photographers
- Night nature walks with naturalist guides
- Tailor-made Sri Lanka round tours with a private driver

## Our promise

We'll always be clear about what's included, what isn't, and what things really cost. We'll never crowd wildlife for a photo, and we'll always put your safety first.`,
  },
  {
    slug: "why-choose-us",
    title: "Why choose Skylantic",
    metaDescription:
      "Small groups, private jeeps, local guides and transparent prices — here's why travellers choose Skylantic Holidays for Sri Lanka safaris.",
    body: `Choosing who to travel with matters. Here's what you can expect from us.

## Local, experienced guides

Our drivers and trackers live near the parks and know the animals' habits, the tracks and the seasons. They read the signs — alarm calls, fresh tracks — that lead to great sightings.

## Your own private jeep

Most of our safaris use a private jeep for your group only. Stop when you want, stay at a sighting as long as you like, and enjoy the space to take photos.

## Honest, upfront prices

We spell out exactly what's included before you book. Park tickets, meals, pickups — no surprises at the gate.

## Personal service from a young team

As a start-up, every guest matters to us. You'll talk directly to the people planning your trip, and we answer every enquiry within 24 hours.

## Respect for wildlife

We follow park rules, keep a respectful distance and never pressure drivers to chase animals. Responsible safaris protect the wildlife we all come to see.

## Flexible planning

Short on time? Travelling with kids? Want a sunrise drive followed by a beach afternoon? We'll shape the trip around you.`,
  },
  {
    slug: "terms",
    title: "Terms & conditions",
    metaDescription: "Booking terms and conditions for Skylantic Holidays Sri Lanka tours and safaris.",
    body: `These terms apply to all tours and services booked with Skylantic Holidays ("we", "us"). By making a booking you agree to them. **Please have these terms reviewed by a legal adviser before publishing.**

## 1. Bookings

A booking is confirmed when we send written confirmation (by email or WhatsApp) and, where required, receive your deposit.

## 2. Prices and payment

- Prices are shown "from" and may vary by date, group size and season.
- Unless stated otherwise, national park entrance fees are not included and are payable at the park.
- A deposit may be required to confirm a booking. The balance is payable on or before the day of the tour.

## 3. Cancellations by you

- More than 7 days before the tour: full refund of any deposit.
- 2–7 days before the tour: 50% of the deposit is refundable.
- Less than 48 hours before, or no-show: deposits are non-refundable.

## 4. Changes and cancellations by us

Parks can close at short notice because of weather, flooding, wildlife management or government decisions. If we have to cancel, we will offer an alternative date, an alternative park, or a refund for services not provided.

## 5. Wildlife sightings

Wildlife is wild. We cannot guarantee sightings of any particular animal, and no refunds are given for animals not seen.

## 6. Safety and conduct

You must follow the instructions of your driver and guide and all national park rules. Do not stand up in moving vehicles, feed animals or leave the jeep inside the park. We may end a tour without refund if a guest's behaviour puts people or wildlife at risk.

## 7. Liability and insurance

We recommend all travellers have comprehensive travel insurance. We are not responsible for loss, injury or delay caused by events beyond our reasonable control.

## 8. Contact

Questions about these terms? Contact us using the details on our Contact page.`,
  },
  {
    slug: "privacy",
    title: "Privacy policy",
    metaDescription: "How Skylantic Holidays collects, uses and protects your personal information.",
    body: `Your privacy matters to us. This policy explains what information we collect and how we use it. **Please have this policy reviewed by a legal adviser before publishing.**

## Information we collect

When you send an enquiry we collect the details you provide: your name, email address, phone number, country, travel dates, number of travellers and your message.

## How we use it

- To reply to your enquiry and plan your trip
- To arrange your tour with our drivers and guides
- To meet legal and accounting obligations

We do not sell your personal information, and we do not send marketing emails without your permission.

## Sharing

We share only the information needed to deliver your tour (for example, your name and pickup location with your driver).

## How long we keep it

We keep enquiry and booking records only as long as needed for the purposes above and for our legal obligations.

## Cookies

This website uses only essential cookies, such as those needed to sign in to the admin area. We do not use advertising cookies.

## Your rights

You may ask to see, correct or delete the personal information we hold about you, in line with Sri Lanka's Personal Data Protection Act, No. 9 of 2022 and other laws that apply to you. Contact us using the details on our Contact page.

## Changes

We may update this policy from time to time. The latest version will always be on this page.`,
  },
];

/** Creates the admin user if it doesn't exist yet. */
export async function seedAdmin(db: PrismaClient, rawEmail: string, password: string) {
  const email = rawEmail.toLowerCase().trim();
  if (!email || password.length < 8) {
    throw new Error("ADMIN_EMAIL and ADMIN_PASSWORD (min 8 chars) are required to create the admin user.");
  }
  if (await db.adminUser.findUnique({ where: { email } })) return false;
  await db.adminUser.create({
    data: { email, name: "Skylantic Admin", passwordHash: await bcrypt.hash(password, 12) },
  });
  return true;
}

/** Inserts starter settings, destinations, tours, FAQs and pages that are missing. */
export async function seedContent(db: PrismaClient) {
  await db.siteSettings.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      heroSubtitle:
        "Leopards in Yala, elephant herds in Minneriya and quiet mornings in Wilpattu — private safaris and holidays with local guides.",
    },
  });

  for (const d of destinations) {
    await db.destination.upsert({ where: { slug: d.slug }, update: {}, create: d });
  }

  if ((await db.tour.count()) === 0) {
    for (const { parks, gallery, ...t } of tours) {
      await db.tour.create({
        data: {
          ...t,
          gallery: JSON.stringify(gallery),
          destinations: { connect: parks.map((slug) => ({ slug })) },
        },
      });
    }
  }

  if ((await db.faq.count()) === 0) {
    await db.faq.createMany({
      data: faqs.map(([question, answer], i) => ({ question, answer, sortOrder: (i + 1) * 10 })),
    });
  }

  for (const p of pages) {
    await db.page.upsert({ where: { slug: p.slug }, update: {}, create: p });
  }
}
