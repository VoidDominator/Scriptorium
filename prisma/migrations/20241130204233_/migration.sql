-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "firstName" TEXT NOT NULL DEFAULT 'What happened to your name?',
    "lastName" TEXT NOT NULL DEFAULT '',
    "password" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "avatar" TEXT NOT NULL DEFAULT 'https://www.cs.toronto.edu/~kianoosh/courses/csc309/resources/handouts/pp1/logo.jpg',
    "createTime" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastLogin" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "role" TEXT NOT NULL DEFAULT 'USER',
    "phoneNumber" TEXT DEFAULT '',
    "isPro" BOOLEAN NOT NULL DEFAULT false,
    "proExpiresAt" DATETIME
);
INSERT INTO "new_User" ("avatar", "createTime", "email", "firstName", "id", "lastLogin", "lastName", "password", "phoneNumber", "role") SELECT "avatar", "createTime", "email", "firstName", "id", "lastLogin", "lastName", "password", "phoneNumber", "role" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
