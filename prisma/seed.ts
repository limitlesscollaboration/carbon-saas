import { PrismaClient } from "../app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

async function main() {
    await prisma.emissionFactor.upsert({
        where: { name: "전기" },
        update: {},
        create: {
            name: "전기",
            category: "ENERGY",
            unit: "kWh",
            factor: 0.459,
            factorUnit: "kgCO2e/kWh",
            description: "기능 시연용 전기 배출계수 샘플 값.",
        },
    });

    await prisma.emissionFactor.upsert({
        where: { name: "도시가스" },
        update: {},
        create: {
            name: "도시가스",
            category: "ENERGY",
            unit: "m3",
            factor: 2.23,
            factorUnit: "kgCO2e/m3",
            description: "기능 시연용 도시가스 배출계수 샘플 값.",
        },
    });

    await prisma.emissionFactor.upsert({
        where: { name: "휘발유" },
        update: {},
        create: {
            name: "휘발유",
            category: "FUEL",
            unit: "L",
            factor: 2.31,
            factorUnit: "kgCO2e/L",
            description: "기능 시연용 휘발유 배출계수 샘플 값.",
        },
    });

    await prisma.emissionFactor.upsert({
        where: { name: "경유" },
        update: {},
        create: {
            name: "경유",
            category: "FUEL",
            unit: "L",
            factor: 2.58,
            factorUnit: "kgCO2e/L",
            description: "기능 시연용 경유 배출계수 샘플 값.",
        },
    });

    await prisma.emissionFactor.upsert({
        where: { name: "폐기물" },
        update: {},
        create: {
            name: "폐기물",
            category: "WASTE",
            unit: "kg",
            factor: 0.45,
            factorUnit: "kgCO2e/kg",
            description: "기능 시연용 폐기물 배출계수 샘플 값.",
        },
    });

    console.log("EmissionFactor seed completed.");
}

    main()
        .then(async () => {
            await prisma.$disconnect();
        })
        .catch(async (error) => {
            console.error(error);
            await prisma.$disconnect();
            process.exit(1);

        });