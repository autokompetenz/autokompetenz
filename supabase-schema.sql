-- Auto-Kompetenz-Center Dreisbach e.K. — Supabase Schema
-- Run this in Supabase SQL Editor if Prisma migrate fails

CREATE TYPE "Role"         AS ENUM ('CLIENT', 'ADMIN');
CREATE TYPE "FuelType"     AS ENUM ('Essence', 'Diesel', 'Electrique', 'Hybride');
CREATE TYPE "Transmission" AS ENUM ('Manuelle', 'Automatique');
CREATE TYPE "Category"     AS ENUM ('Berline', 'SUV', 'Citadine', 'Break', 'Coupe', 'Cabriolet', 'Utilitaire');
CREATE TYPE "PaymentType"  AS ENUM ('full', 'deposit', 'monthly');
CREATE TYPE "OrderStatus"  AS ENUM ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled');

CREATE TABLE "User" (
  "id"            SERIAL PRIMARY KEY,
  "username"      TEXT UNIQUE NOT NULL,
  "email"         TEXT UNIQUE NOT NULL,
  "password"      TEXT NOT NULL,
  "firstName"     TEXT NOT NULL,
  "lastName"      TEXT NOT NULL,
  "phone"         TEXT,
  "address"       TEXT,
  "monthlySalary" FLOAT,
  "role"          "Role" DEFAULT 'CLIENT',
  "emailVerified" BOOLEAN DEFAULT false,
  "createdAt"     TIMESTAMP DEFAULT NOW(),
  "updatedAt"     TIMESTAMP DEFAULT NOW()
);

CREATE TABLE "Car" (
  "id"             SERIAL PRIMARY KEY,
  "make"           TEXT NOT NULL,
  "model"          TEXT NOT NULL,
  "year"           INT NOT NULL,
  "price"          FLOAT NOT NULL,
  "stock"          INT DEFAULT 1,
  "description"    TEXT,
  "fuelType"       "FuelType" NOT NULL,
  "transmission"   "Transmission" NOT NULL,
  "mileage"        INT DEFAULT 0,
  "color"          TEXT,
  "power"          INT,
  "category"       "Category" NOT NULL,
  "imageUrl"       TEXT,
  "imageUrl2"      TEXT,
  "imageUrl3"      TEXT,
  "minSalary"      FLOAT,
  "monthlyPayment" FLOAT,
  "featured"       BOOLEAN DEFAULT false,
  "isActive"       BOOLEAN DEFAULT true,
  "createdAt"      TIMESTAMP DEFAULT NOW()
);

CREATE TABLE "Order" (
  "id"              SERIAL PRIMARY KEY,
  "orderNumber"     TEXT UNIQUE NOT NULL,
  "userId"          INT NOT NULL REFERENCES "User"("id"),
  "totalPrice"      FLOAT NOT NULL,
  "paymentType"     "PaymentType" NOT NULL,
  "depositAmount"   FLOAT,
  "monthlyAmount"   FLOAT,
  "monthlyDuration" INT,
  "discountAmount"  FLOAT,
  "status"          "OrderStatus" DEFAULT 'pending',
  "notes"           TEXT,
  "shippingAddress" TEXT,
  "createdAt"       TIMESTAMP DEFAULT NOW(),
  "updatedAt"       TIMESTAMP DEFAULT NOW()
);

CREATE TABLE "OrderItem" (
  "id"        SERIAL PRIMARY KEY,
  "orderId"   INT NOT NULL REFERENCES "Order"("id") ON DELETE CASCADE,
  "carId"     INT NOT NULL REFERENCES "Car"("id"),
  "quantity"  INT DEFAULT 1,
  "unitPrice" FLOAT NOT NULL
);

CREATE TABLE "OrderTracking" (
  "id"        SERIAL PRIMARY KEY,
  "orderId"   INT NOT NULL REFERENCES "Order"("id") ON DELETE CASCADE,
  "status"    "OrderStatus" NOT NULL,
  "comment"   TEXT,
  "updatedBy" INT REFERENCES "User"("id"),
  "createdAt" TIMESTAMP DEFAULT NOW()
);

CREATE TABLE "Cart" (
  "id"          SERIAL PRIMARY KEY,
  "userId"      INT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  "carId"       INT NOT NULL REFERENCES "Car"("id"),
  "quantity"    INT DEFAULT 1,
  "paymentType" "PaymentType" DEFAULT 'full',
  "createdAt"   TIMESTAMP DEFAULT NOW(),
  UNIQUE("userId", "carId")
);

-- Prisma migrations table (required)
CREATE TABLE IF NOT EXISTS "_prisma_migrations" (
  "id"                  VARCHAR(36) PRIMARY KEY,
  "checksum"            VARCHAR(64) NOT NULL,
  "finished_at"         TIMESTAMP,
  "migration_name"      VARCHAR(255) NOT NULL,
  "logs"                TEXT,
  "rolled_back_at"      TIMESTAMP,
  "started_at"          TIMESTAMP DEFAULT NOW(),
  "applied_steps_count" INT DEFAULT 0
);
