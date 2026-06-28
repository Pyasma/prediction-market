import { uuid } from "uuidv4";
import prisma from "./prisma";

const emptyOrderbook = {};

const markets = [
      {
    id: uuid(),
    title: "Will Bitcoin reach $100,000 by end of 2025?",
    description: "This market resolves to Yes if Bitcoin trades at or above $100,000 on any major exchange before December 31, 2025.",
    resolutionDescription: "Based on Bitcoin price on CoinMarketCap or similar major exchange",
    yes_ord: emptyOrderbook,
    no_ord: emptyOrderbook,
    totalQty: 0,
  },
  {
    id: uuid(),
    title: "Will AI pass Turing test by 2026?",
    description: "This market resolves to Yes if an AI system is widely recognized as passing the Turing test by end of 2026.",
    resolutionDescription: "Based on consensus from major AI research organizations",
    yes_ord: emptyOrderbook,
    no_ord: emptyOrderbook,
    totalQty: 0,
  },
  {
    id: uuid(),
    title: "Will SpaceX land humans on Mars by 2030?",
    description: "This market resolves to Yes if SpaceX successfully lands humans on Mars before January 1, 2030.",
    resolutionDescription: "Based on official SpaceX announcements and independent verification",
    yes_ord: emptyOrderbook,
    no_ord: emptyOrderbook,
    totalQty: 0,
  },
  {
    id: uuid(),
    title: "Will Ethereum 2.0 be fully implemented by 2025?",
    description: "This market resolves to Yes if Ethereum completes its full transition to proof-of-stake and all planned upgrades by end of 2025.",
    resolutionDescription: "Based on official Ethereum Foundation announcements",
    yes_ord: emptyOrderbook,
    no_ord: emptyOrderbook,
    totalQty: 0,
  },
  {
    id: uuid(),
    title: "Will a COVID-19 vaccine be available by 2025?",
    description: "This market resolves to Yes if an FDA-approved COVID-19 vaccine is available to the public by end of 2025.",
    resolutionDescription: "Based on FDA approval announcements",
    yes_ord: emptyOrderbook,
    no_ord: emptyOrderbook,
    totalQty: 0,
  },
]

const users = [
    {
    id: uuid(),
    address: "0x1234567890123456789012345678901234567890",
    usd_balance: 10000, // $100.00
    },
    {
    id: uuid(),
    address: "0x0987654321098765432109876543210987654321",
    usd_balance: 15000, // $150.00
    },
    {
    id: uuid(),
    address: "0xabcdefabcdefabcdefabcdefabcdefabcdefabcd",
    usd_balance: 20000, // $200.00
    },
]


async function seed() {
    console.log("Starting seed...");

    await prisma.orderHistory.deleteMany();
    await prisma.user.deleteMany();
    await prisma.position.deleteMany();
    await prisma.market.deleteMany();

    console.log("Creating markets...")

    for (const market of markets){
        await prisma.market.create({
            data: market
        })
    }

    console.log("Creating Users...")

    for (const user of users){
        await prisma.user.create({
            data: user
        })
    }

    const market = markets[0]
    const user1 = users[0]
    const user2 = users[1]
    const user3 = users[2]

    console.log("Creating sample Positions...")

    await prisma.position.create({
        data: {
            userID: user1.id,
            marketID: market.id,
            type:"yes",
            qty:50,
        }
    })
    await prisma.position.create({
        data: {
            userID: user2.id,
            marketID: market.id,
            type:"no",
            qty:30,
        }
    })

    console.log("Creating sample order History...")
    await prisma.orderHistory.create({
        data: {
        id: uuid(),
        order: "buy",
        userId: user1.id,
        marketId: market.id,
        price: 60, // $0.60
        qty: 50,
        },
    });

    await prisma.orderHistory.create({
        data: {
        id: uuid(),
        order: "buy",
        userId: user2.id,
        marketId: market.id,
        price: 40, // $0.40
        qty: 30,
        },
    });
    // Update orderbooks with proper pricing (Yes + No >= 100 to prevent arbitrage)
  // Yes Orderbook: People selling Yes (asks for Yes)
  const yesOrderbook = {
    "62": {
      availableQty: 150,
      orders: [
        {
          userId: user1.id,
          qty: 75,
          filledQty: 0,
          originalOrderId: uuid(),
          reverseOrder: false,
        },
        {
          userId: user2.id,
          qty: 75,
          filledQty: 0,
          originalOrderId: uuid(),
          reverseOrder: false,
        },
      ],
    },
    "66": {
      availableQty: 120,
      orders: [
        {
          userId: user3.id,
          qty: 60,
          filledQty: 0,
          originalOrderId: uuid(),
          reverseOrder: false,
        },
        {
          userId: user1.id,
          qty: 60,
          filledQty: 0,
          originalOrderId: uuid(),
          reverseOrder: false,
        },
      ],
    },
    "70": {
      availableQty: 100,
      orders: [
        {
          userId: user2.id,
          qty: 50,
          filledQty: 0,
          originalOrderId: uuid(),
          reverseOrder: false,
        },
        {
          userId: user3.id,
          qty: 50,
          filledQty: 0,
          originalOrderId: uuid(),
          reverseOrder: false,
        },
      ],
    },
    "74": {
      availableQty: 80,
      orders: [
        {
          userId: user1.id,
          qty: 40,
          filledQty: 0,
          originalOrderId: uuid(),
          reverseOrder: false,
        },
        {
          userId: user2.id,
          qty: 40,
          filledQty: 0,
          originalOrderId: uuid(),
          reverseOrder: false,
        },
      ],
    },
    "78": {
      availableQty: 60,
      orders: [
        {
          userId: user3.id,
          qty: 30,
          filledQty: 0,
          originalOrderId: uuid(),
          reverseOrder: false,
        },
        {
          userId: user1.id,
          qty: 30,
          filledQty: 0,
          originalOrderId: uuid(),
          reverseOrder: false,
        },
      ],
    },
  };

  // No Orderbook: People selling No (asks for No) - priced so Yes + No >= 100
  const noOrderbook = {
    "42": {
      availableQty: 140,
      orders: [
        {
          userId: user2.id,
          qty: 70,
          filledQty: 0,
          originalOrderId: uuid(),
          reverseOrder: false,
        },
        {
          userId: user3.id,
          qty: 70,
          filledQty: 0,
          originalOrderId: uuid(),
          reverseOrder: false,
        },
      ],
    },
    "46": {
      availableQty: 120,
      orders: [
        {
          userId: user1.id,
          qty: 60,
          filledQty: 0,
          originalOrderId: uuid(),
          reverseOrder: false,
        },
        {
          userId: user2.id,
          qty: 60,
          filledQty: 0,
          originalOrderId: uuid(),
          reverseOrder: false,
        },
      ],
    },
    "50": {
      availableQty: 100,
      orders: [
        {
          userId: user3.id,
          qty: 50,
          filledQty: 0,
          originalOrderId: uuid(),
          reverseOrder: false,
        },
        {
          userId: user1.id,
          qty: 50,
          filledQty: 0,
          originalOrderId: uuid(),
          reverseOrder: false,
        },
      ],
    },
    "54": {
      availableQty: 80,
      orders: [
        {
          userId: user2.id,
          qty: 40,
          filledQty: 0,
          originalOrderId: uuid(),
          reverseOrder: false,
        },
        {
          userId: user3.id,
          qty: 40,
          filledQty: 0,
          originalOrderId: uuid(),
          reverseOrder: false,
        },
      ],
    },
    "58": {
      availableQty: 60,
      orders: [
        {
          userId: user1.id,
          qty: 30,
          filledQty: 0,
          originalOrderId: uuid(),
          reverseOrder: false,
        },
        {
          userId: user2.id,
          qty: 30,
          filledQty: 0,
          originalOrderId: uuid(),
          reverseOrder: false,
        },
      ],
    },
  };

  console.log("Updating market orderbooks...")

  const firstMarket = markets[0];
  await prisma.market.update({
    where: { id: firstMarket.id },
    data: {
      yes_ord: yesOrderbook,
      no_ord: noOrderbook,
    },
  });

  // Add liquidity to second market as well with proper pricing
  const market2 = markets[1];
  const yesOrderbook2 = {
    "57": {
      availableQty: 120,
      orders: [
        {
          userId: user1.id,
          qty: 60,
          filledQty: 0,
          originalOrderId: uuid(),
          reverseOrder: false,
        },
        {
          userId: user2.id,
          qty: 60,
          filledQty: 0,
          originalOrderId: uuid(),
          reverseOrder: false,
        },
      ],
    },
    "61": {
      availableQty: 100,
      orders: [
        {
          userId: user3.id,
          qty: 50,
          filledQty: 0,
          originalOrderId: uuid(),
          reverseOrder: false,
        },
        {
          userId: user1.id,
          qty: 50,
          filledQty: 0,
          originalOrderId: uuid(),
          reverseOrder: false,
        },
      ],
    },
    "65": {
      availableQty: 80,
      orders: [
        {
          userId: user2.id,
          qty: 40,
          filledQty: 0,
          originalOrderId: uuid(),
          reverseOrder: false,
        },
        {
          userId: user3.id,
          qty: 40,
          filledQty: 0,
          originalOrderId: uuid(),
          reverseOrder: false,
        },
      ],
    },
  };

  const noOrderbook2 = {
    "47": {
      availableQty: 100,
      orders: [
        {
          userId: user2.id,
          qty: 50,
          filledQty: 0,
          originalOrderId: uuid(),
          reverseOrder: false,
        },
        {
          userId: user3.id,
          qty: 50,
          filledQty: 0,
          originalOrderId: uuid(),
          reverseOrder: false,
        },
      ],
    },
    "51": {
      availableQty: 80,
      orders: [
        {
          userId: user1.id,
          qty: 40,
          filledQty: 0,
          originalOrderId: uuid(),
          reverseOrder: false,
        },
        {
          userId: user2.id,
          qty: 40,
          filledQty: 0,
          originalOrderId: uuid(),
          reverseOrder: false,
        },
      ],
    },
    "55": {
      availableQty: 60,
      orders: [
        {
          userId: user3.id,
          qty: 30,
          filledQty: 0,
          originalOrderId: uuid(),
          reverseOrder: false,
        },
        {
          userId: user1.id,
          qty: 30,
          filledQty: 0,
          originalOrderId: uuid(),
          reverseOrder: false,
        },
      ],
    },
  };

  await prisma.market.update({
    where: { id: market2.id },
    data: {
      yes_ord: yesOrderbook2,
      no_ord: noOrderbook2,
      totalQty: 600,
    },
  });

  // Add positions for market 2
  await prisma.position.create({
    data: {
      userID: user1.id,
      marketID: market2.id,
      type: "yes",
      qty: 40,
    },
  });

  await prisma.position.create({
    data: {
      userID: user3.id,
      marketID: market2.id,
      type: "no",
      qty: 35,
    },
  });

  // Add order history for market 2
  await prisma.orderHistory.create({
    data: {
      id: uuid(),
      order: "buy",
      userId: user1.id,
      marketId: market2.id,
      price: 45,
      qty: 40,
    },
  });

  await prisma.orderHistory.create({
    data: {
      id: uuid(),
      order: "buy",
      userId: user3.id,
      marketId: market2.id,
      price: 40,
      qty: 35,
    },
  });

  console.log("Seed completed successfully!");
  console.log(`Created ${markets.length} markets`);
  console.log(`Created ${users.length} users`);
  console.log(`Market 1 ID: ${market.id}`);
  console.log(`User 1 ID: ${user1.id}`);
  console.log(`User 2 ID: ${user2.id}`);
}

seed()
  .catch((e) => {
    console.error("Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });