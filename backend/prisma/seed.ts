/**
 * Demo seed data for local development / hackathon demos.
 * Run with: npm run prisma:seed  (or `npx prisma db seed`)
 *
 * Uses its own PrismaClient instance (not src/lib/prisma.ts) since this
 * script runs standalone via tsx, outside the app's src/ tree.
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // --- Demo user -----------------------------------------------------
  const demoUser = await prisma.user.upsert({
    where: { email: "demo@parkease.app" },
    update: {},
    create: { name: "Demo Driver", email: "demo@parkease.app" },
  });

  console.log(`Demo user ready: ${demoUser.id} (${demoUser.email})`);

  // --- Clear existing demo parking data (idempotent re-seeding) ------
  await prisma.verification.deleteMany({});
  await prisma.booking.deleteMany({});
  await prisma.parkingImage.deleteMany({});
  await prisma.parkingSpot.deleteMany({});

  // Demo area: Chennai, Tamil Nadu — realistic coordinates, fictional spots.
  const spots = [
    {
      name: "Chennai Central Municipal Parking",
      description: "Multi-level public parking lot beside Chennai Central railway station.",
      type: "PUBLIC" as const,
      latitude: 13.0836,
      longitude: 80.2751,
      address: "Chennai Central, Periyamet, Chennai",
      totalCapacity: 200,
      availableCapacity: 45,
      pricePerHour: 20,
      openingTime: "06:00",
      closingTime: "23:00",
      verificationStatus: "UNDER_REVIEW" as const,
      status: "ACTIVE" as const,
    },
    {
      name: "T Nagar Public Parking Lot",
      description: "Ground-level municipal lot serving the Pondy Bazaar shopping stretch.",
      type: "PUBLIC" as const,
      latitude: 13.0418,
      longitude: 80.2341,
      address: "Pondy Bazaar, T Nagar, Chennai",
      totalCapacity: 120,
      availableCapacity: 0,
      pricePerHour: 15,
      openingTime: "08:00",
      closingTime: "22:00",
      verificationStatus: "UNDER_REVIEW" as const,
      status: "ACTIVE" as const,
    },
    {
      name: "Marina Beach Municipal Parking",
      description: "Free open-air parking ground along the Marina Beach promenade.",
      type: "PUBLIC" as const,
      latitude: 13.0500,
      longitude: 80.2824,
      address: "Marina Beach Road, Chennai",
      totalCapacity: 300,
      availableCapacity: 180,
      pricePerHour: null,
      openingTime: "05:00",
      closingTime: "21:00",
      verificationStatus: "UNDER_REVIEW" as const,
      status: "ACTIVE" as const,
    },
    {
      name: "Egmore Railway Station Parking",
      description: "Paid parking bay directly outside Egmore station's main entrance.",
      type: "PUBLIC" as const,
      latitude: 13.0778,
      longitude: 80.2610,
      address: "Egmore, Chennai",
      totalCapacity: 150,
      availableCapacity: 60,
      pricePerHour: 20,
      openingTime: "00:00",
      closingTime: "23:59",
      verificationStatus: "UNDER_REVIEW" as const,
      status: "ACTIVE" as const,
    },
    {
      name: "Green Meadows Society Visitor Parking",
      description: "A residential society sharing a handful of visitor slots during the day.",
      type: "PRIVATE" as const,
      latitude: 13.0067,
      longitude: 80.2206,
      address: "Green Meadows Layout, Adyar, Chennai",
      totalCapacity: 10,
      availableCapacity: 4,
      pricePerHour: 10,
      openingTime: "07:00",
      closingTime: "22:00",
      verificationStatus: "UNDER_REVIEW" as const,
      status: "ACTIVE" as const,
    },
    {
      name: "Anna Nagar Office Complex Parking",
      description: "Basement parking at a commercial office complex, open to the public on weekdays.",
      type: "PRIVATE" as const,
      latitude: 13.0850,
      longitude: 80.2101,
      address: "2nd Avenue, Anna Nagar, Chennai",
      totalCapacity: 50,
      availableCapacity: 12,
      pricePerHour: 30,
      openingTime: "08:00",
      closingTime: "20:00",
      verificationStatus: "UNDER_REVIEW" as const,
      status: "ACTIVE" as const,
    },
    {
      name: "Velachery Mall Basement Parking",
      description: "Large mall basement lot — temporarily closed for maintenance.",
      type: "PRIVATE" as const,
      latitude: 12.9791,
      longitude: 80.2183,
      address: "Velachery Main Road, Chennai",
      totalCapacity: 400,
      availableCapacity: 0,
      pricePerHour: 25,
      openingTime: "10:00",
      closingTime: "22:00",
      verificationStatus: "UNDER_REVIEW" as const,
      status: "INACTIVE" as const,
    },
    {
      name: "Tech Park Society Spare Slots — Perungudi",
      description: "A nearby tech park sharing spare basement slots during business hours.",
      type: "PRIVATE" as const,
      latitude: 12.9634,
      longitude: 80.2422,
      address: "OMR, Perungudi, Chennai",
      totalCapacity: 20,
      availableCapacity: 9,
      pricePerHour: 18,
      openingTime: "09:00",
      closingTime: "19:00",
      verificationStatus: "UNDER_REVIEW" as const,
      status: "ACTIVE" as const,
    },
    {
      name: "Shaded Lane Behind Ashok Nagar Market",
      description:
        "A quiet, permitted side lane behind the market — doesn't block traffic or shop entrances. Confirmed by several drivers.",
      type: "COMMUNITY" as const,
      latitude: 13.0357,
      longitude: 80.2101,
      address: "Behind Ashok Nagar Market, Chennai",
      totalCapacity: 6,
      availableCapacity: 3,
      pricePerHour: null,
      openingTime: null,
      closingTime: null,
      verificationStatus: "COMMUNITY_VERIFIED" as const,
      status: "ACTIVE" as const,
      submittedById: demoUser.id,
    },
    {
      name: "Empty Plot Near Besant Nagar Church",
      description: "An open, unused plot near the church — flat ground, easy to enter and exit.",
      type: "COMMUNITY" as const,
      latitude: 13.0002,
      longitude: 80.2669,
      address: "Near Besant Nagar Church, Chennai",
      totalCapacity: 8,
      availableCapacity: 8,
      pricePerHour: null,
      openingTime: null,
      closingTime: null,
      verificationStatus: "COMMUNITY_SUBMITTED" as const,
      status: "ACTIVE" as const,
      submittedById: demoUser.id,
    },
    {
      name: "Side Street Parking Near Adyar Bridge",
      description: "Wide side street with room to park without narrowing the road.",
      type: "COMMUNITY" as const,
      latitude: 13.0064,
      longitude: 80.2570,
      address: "Near Adyar Bridge, Chennai",
      totalCapacity: 4,
      availableCapacity: 1,
      pricePerHour: null,
      openingTime: null,
      closingTime: null,
      verificationStatus: "COMMUNITY_SUBMITTED" as const,
      status: "ACTIVE" as const,
      submittedById: demoUser.id,
    },
    {
      name: "Quiet Corner Near Kotturpuram Bridge",
      description: "Newly discovered permitted corner spot — not yet verified by other drivers.",
      type: "COMMUNITY" as const,
      latitude: 13.0287,
      longitude: 80.2431,
      address: "Near Kotturpuram Bridge, Chennai",
      totalCapacity: 5,
      availableCapacity: 5,
      pricePerHour: null,
      openingTime: null,
      closingTime: null,
      verificationStatus: "COMMUNITY_SUBMITTED" as const,
      status: "ACTIVE" as const,
      submittedById: demoUser.id,
    },
    {
      name: "Reported Spot Near Velachery Signal",
      description: "Originally submitted as a community spot, but reported and found to obstruct traffic.",
      type: "COMMUNITY" as const,
      latitude: 12.9750,
      longitude: 80.2200,
      address: "Near Velachery Signal, Chennai",
      totalCapacity: 3,
      availableCapacity: 0,
      pricePerHour: null,
      openingTime: null,
      closingTime: null,
      verificationStatus: "REJECTED" as const,
      status: "INACTIVE" as const,
      submittedById: demoUser.id,
    },
  ];

  for (const spot of spots) {
    const created = await prisma.parkingSpot.create({
      data: { ...spot, lastUpdated: new Date() },
    });
    console.log(`Created parking spot: ${created.name} [${created.type} / ${created.verificationStatus}]`);
  }

  // A demo verification trail on the already-COMMUNITY_VERIFIED spot, so
  // GET /api/parking/:id/verifications has something to show. Only one
  // demo user exists, so this is illustrative data set directly rather
  // than derived through the real 3-verify threshold logic.
  const verifiedSpot = await prisma.parkingSpot.findFirst({
    where: { name: "Shaded Lane Behind Ashok Nagar Market" },
  });
  if (verifiedSpot) {
    await prisma.verification.create({
      data: {
        parkingSpotId: verifiedSpot.id,
        userId: demoUser.id,
        type: "VERIFY",
        comment: "Parked here myself, works great and doesn't block anything.",
      },
    });
  }

  const rejectedSpot = await prisma.parkingSpot.findFirst({
    where: { name: "Reported Spot Near Velachery Signal" },
  });
  if (rejectedSpot) {
    await prisma.verification.create({
      data: {
        parkingSpotId: rejectedSpot.id,
        userId: demoUser.id,
        type: "REPORT",
        comment: "Obstructive/illegal — blocks the side lane during peak hours.",
      },
    });
  }

  console.log(`\nSeed complete: 1 user, ${spots.length} parking spots.`);
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
