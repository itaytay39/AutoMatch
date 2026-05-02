import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const SOURCES = ['yad2', 'autoboom', 'homeless', 'focusnet', 'carwiz', 'colmobil', 'autocenter', 'eldan', 'freesbe', 'winwin']
const CITIES = ['קריית ביאליק', 'קריית מוצקין', 'קריית אתא', 'חיפה', 'תל אביב', 'ראשון לציון', 'פתח תקווה', 'רמת גן', 'הרצליה', 'באר שבע', 'נתניה', 'חולון', 'אשדוד', 'רחובות', 'מודיעין', 'ירושלים', 'אילת']

const CARS = [
  { make: 'Kia', model: 'Stonic', basePrice: 87000, img: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=600' },
  { make: 'Kia', model: 'Sportage', basePrice: 125000, img: 'https://images.unsplash.com/photo-1616788494672-ec7ca25fdda9?w=600' },
  { make: 'Kia', model: 'Niro', basePrice: 118000, img: 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?w=600' },
  { make: 'Toyota', model: 'Corolla Hybrid', basePrice: 132000, img: 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=600' },
  { make: 'Toyota', model: 'C-HR', basePrice: 115000, img: 'https://images.unsplash.com/photo-1609521263047-f8f205293f24?w=600' },
  { make: 'Toyota', model: 'RAV4', basePrice: 158000, img: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=600' },
  { make: 'Hyundai', model: 'Ioniq 5', basePrice: 189000, img: 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=600' },
  { make: 'Hyundai', model: 'Tucson', basePrice: 145000, img: 'https://images.unsplash.com/photo-1612825173281-9a193378527e?w=600' },
  { make: 'Hyundai', model: 'i30', basePrice: 95000, img: 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=600' },
  { make: 'Mazda', model: '3', basePrice: 112000, img: 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=600' },
  { make: 'Mazda', model: 'CX-5', basePrice: 149000, img: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=600' },
  { make: 'Volkswagen', model: 'Golf', basePrice: 108000, img: 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?w=600' },
  { make: 'Volkswagen', model: 'Tiguan', basePrice: 152000, img: 'https://images.unsplash.com/photo-1625047509168-a7026f36de04?w=600' },
  { make: 'Tesla', model: 'Model 3', basePrice: 219000, img: 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=600' },
  { make: 'Honda', model: 'Civic', basePrice: 118000, img: 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=600' },
  { make: 'Skoda', model: 'Octavia', basePrice: 99000, img: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=600' },
  { make: 'Skoda', model: 'Kodiaq', basePrice: 162000, img: 'https://images.unsplash.com/photo-1616788494672-ec7ca25fdda9?w=600' },
  { make: 'Ford', model: 'Kuga', basePrice: 138000, img: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=600' },
  { make: 'Nissan', model: 'Leaf', basePrice: 105000, img: 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=600' },
  { make: 'Seat', model: 'Leon', basePrice: 96000, img: 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?w=600' },
]

function rand(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function pick<T>(arr: T[]): T {
  return arr[rand(0, arr.length - 1)]
}

const RAW: Array<{
  externalId: string; source: string; url: string; title: string
  make: string; model: string; year: number; mileage: number; price: number
  city: string; images: string[]
}> = []

let id = 1
for (const car of CARS) {
  const count = rand(3, 6)
  for (let i = 0; i < count; i++) {
    const year = rand(2018, 2023)
    const age = 2026 - year
    const mileage = rand(age * 8000, age * 20000)
    const priceFactor = 1 - age * 0.06 + (Math.random() - 0.5) * 0.2
    const price = Math.round(car.basePrice * priceFactor / 1000) * 1000
    const source = pick(SOURCES)
    const city = pick(CITIES)

    RAW.push({
      externalId: `seed-${id}`,
      source,
      url: `https://${source}.co.il/item/${id}`,
      title: `${car.make} ${car.model}`,
      make: car.make,
      model: car.model,
      year,
      mileage,
      price: Math.max(price, 45000),
      city,
      images: Array(rand(3, 9)).fill(car.img),
    })
    id++
  }
}

// Fixed Kia Stonic cluster for success test (Krayot area)
const STONIC_CLUSTER = [
  { externalId: 'stonic-1', source: 'yad2', year: 2019, mileage: 68000, price: 87500, city: 'קריית ביאליק' },
  { externalId: 'stonic-2', source: 'autoboom', year: 2019, mileage: 72000, price: 91000, city: 'קריית מוצקין' },
  { externalId: 'stonic-3', source: 'homeless', year: 2020, mileage: 54000, price: 96500, city: 'קריית אתא' },
  { externalId: 'stonic-4', source: 'yad2', year: 2019, mileage: 55000, price: 84000, city: 'קריית ים' },
  { externalId: 'stonic-5', source: 'focusnet', year: 2020, mileage: 82000, price: 88000, city: 'קריית ביאליק' },
  { externalId: 'stonic-6', source: 'winwin', year: 2021, mileage: 38000, price: 107000, city: 'חיפה' },
]

for (const s of STONIC_CLUSTER) {
  RAW.push({
    ...s,
    url: `https://${s.source}.co.il/item/${s.externalId}`,
    title: 'קיה סטוניק',
    make: 'Kia',
    model: 'Stonic',
    images: Array(rand(5, 8)).fill('https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=600'),
  })
}

async function main() {
  console.log(`Seeding ${RAW.length} listings...`)
  let seeded = 0
  for (const listing of RAW) {
    try {
      const saved = await prisma.listing.upsert({
        where: { source_externalId: { source: listing.source, externalId: listing.externalId } },
        create: listing,
        update: { price: listing.price, mileage: listing.mileage },
      })
      // Price history: 3 snapshots going back 90 days
      for (let days = 90; days >= 0; days -= 30) {
        const histPrice = listing.price + rand(-5000, 5000)
        await prisma.priceSnapshot.create({
          data: { listingId: saved.id, price: histPrice, date: new Date(Date.now() - days * 86400000) },
        })
      }
      seeded++
    } catch (e: any) {
      if (!e.message?.includes('Unique constraint')) console.error('seed error:', e.message)
    }
  }
  console.log(`✓ Seeded ${seeded} listings`)
  await prisma.$disconnect()
}

main().catch(e => { console.error(e); process.exit(1) })
