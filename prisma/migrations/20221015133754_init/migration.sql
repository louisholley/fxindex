-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "address" TEXT NOT NULL,
    "alias" TEXT,
    "name" TEXT,
    "metadata" TEXT,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Project" (
    "id" SERIAL NOT NULL,
    "issuerId" TEXT NOT NULL,
    "creatorId" INTEGER,
    "price" TEXT,
    "royalties" TEXT,
    "enabled" BOOLEAN,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Gentk" (
    "id" SERIAL NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL,
    "token" TEXT NOT NULL,
    "projectId" INTEGER NOT NULL,
    "minterId" INTEGER NOT NULL,
    "metadata" JSONB,
    "iteration" TEXT NOT NULL,
    "royalties" TEXT NOT NULL,

    CONSTRAINT "Gentk_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_address_key" ON "User"("address");

-- CreateIndex
CREATE UNIQUE INDEX "Project_issuerId_key" ON "Project"("issuerId");

-- CreateIndex
CREATE UNIQUE INDEX "Gentk_token_key" ON "Gentk"("token");

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Gentk" ADD CONSTRAINT "Gentk_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Gentk" ADD CONSTRAINT "Gentk_minterId_fkey" FOREIGN KEY ("minterId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
