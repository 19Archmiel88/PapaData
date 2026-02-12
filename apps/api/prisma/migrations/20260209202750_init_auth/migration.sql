-- CreateTable
CREATE TABLE "Uzytkownik" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "hashHasla" TEXT NOT NULL,
    "zweryfikowanyAt" DATETIME,
    "utworzonyAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "KodWeryfikacyjny" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "uzytkownikId" TEXT NOT NULL,
    "kodHash" TEXT NOT NULL,
    "probyNieudane" INTEGER NOT NULL DEFAULT 0,
    "wygasaAt" DATETIME NOT NULL,
    "wykorzystanyAt" DATETIME,
    "utworzonyAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "KodWeryfikacyjny_uzytkownikId_fkey" FOREIGN KEY ("uzytkownikId") REFERENCES "Uzytkownik" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Uzytkownik_email_key" ON "Uzytkownik"("email");

-- CreateIndex
CREATE INDEX "KodWeryfikacyjny_uzytkownikId_idx" ON "KodWeryfikacyjny"("uzytkownikId");
