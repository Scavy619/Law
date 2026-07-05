import "dotenv/config";
import mongoose from "mongoose";
import lawyerModel from "../models/lawyerModel.js";
import { hashPasswordWithSalt } from "../utils/hash.js";

// Single-lawyer solo-practice site — replace image/fees/address with real details before launch.
const LAWYER = {
  name: "Adv. Shivam Parashar",
  email: "shivam.parashar@example.com",
  password: "Lawyer@12345",
  // Served from Frontend/public/shivam.jpg via the frontend origin
  image: "/shivam.jpg",
  speciality: "General Practice Advocate",
  degree: "B.A. LL.B, Vivekananda Law College, Delhi",
  experience: "2 Years",
  about:
    "Shivam handles criminal, civil, family, corporate, property, and tax matters for clients across Delhi. He takes a hands-on, client-first approach — clear communication, honest assessments, and direct personal attention on every case.",
  fees: 500,
  address: { Location: "", City: "New Delhi", State: "Delhi" },
};

async function main() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("Connected to MongoDB for seeding");

  // This is a single-lawyer site — clear out any other seeded lawyers first
  const { deletedCount } = await lawyerModel.deleteMany({
    email: { $ne: LAWYER.email },
  });
  if (deletedCount) console.log(`Removed ${deletedCount} other lawyer record(s)`);

  const existing = await lawyerModel.findOne({ email: LAWYER.email });
  if (existing) {
    await lawyerModel.updateOne({ email: LAWYER.email }, { $set: LAWYER });
    console.log(`Updated ${LAWYER.name} (${LAWYER.email})`);
  } else {
    const { password: hashedPassword } = await hashPasswordWithSalt(
      LAWYER.password,
    );
    await lawyerModel.create({
      ...LAWYER,
      password: hashedPassword,
      available: true,
      date: Date.now(),
    });
    console.log(`Created lawyer ${LAWYER.name} (${LAWYER.email})`);
  }

  console.log("Seeding complete. Lawyer login password: Lawyer@12345");
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
