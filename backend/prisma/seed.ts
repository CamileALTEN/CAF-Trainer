// backend/prisma/seed.ts
// Script de migration des données JSON vers PostgreSQL avec Prisma

import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { encrypt } from '../src/utils/encryption';

const prisma = new PrismaClient();

async function main() {
  const dataDir = path.resolve(__dirname, '../src/data');
  const modulesFile = path.join(dataDir, 'modules.json');
  const notificationsFile = path.join(dataDir, 'notifications.json');
  const progressFile = path.join(dataDir, 'progress.json');
  const usersFile = path.join(dataDir, 'users.json');

  console.log('Chargement des données depuis JSON...');

  const modulesData: any[] = JSON.parse(fs.readFileSync(modulesFile, 'utf-8'));
  const notificationsData: any[] = JSON.parse(fs.readFileSync(notificationsFile, 'utf-8'));
  const progressData: any[] = JSON.parse(fs.readFileSync(progressFile, 'utf-8'));
  const usersData: any[] = JSON.parse(fs.readFileSync(usersFile, 'utf-8'));

  // 1. Migration des utilisateurs (phase 1: création sans managerId)
  console.log('Phase 1: création des utilisateurs sans relation manager...');
  for (const u of usersData) {
    await prisma.user.upsert({
      where: { id: u.id },
      update: {
        username: u.username,
        password: u.password,
        role: u.role,
        tokenVersion: 0,
        site: u.site || null
      },
      create: {
        id: u.id,
        username: u.username,
        password: u.password,
        role: u.role,
        tokenVersion: 0,
        site: u.site || null,
        managerId: null
      }
    });
  }

  // Phase 2: mise à jour des managerId
  console.log('Phase 2: mise à jour des relations manager...');
  for (const u of usersData) {
    if (u.managerId) {
      await prisma.user.update({
        where: { id: u.id },
        data: { managerId: u.managerId }
      });
    }
  }

  // 2. Migration des modules et items (récursif)
  console.log('Migration des modules et items...');
  for (const mod of modulesData) {
    await prisma.module.upsert({
      where: { id: mod.id },
      update: {},
      create: {
        id: mod.id,
        title: mod.title,
        description: mod.description || null,
        summary: mod.summary || null,
        enabled: mod.enabled,
      }
    });

    async function processItem(item: any, moduleId: string, parentId: string | null = null) {
      await prisma.item.upsert({
        where: { id: item.id },
        update: {},
        create: {
          id: item.id,
          title: item.title,
          subtitle: item.subtitle || null,
          content: item.content || null,
          enabled: item.enabled,
          moduleId,
          parentItemId: parentId,
        }
      });

      // liens
      for (const link of item.links || []) {
        await prisma.itemLink.create({
          data: {
            itemId: item.id,
            title: link.title || null,
            url: link.url,
            label: link.label || null
          }
        });
      }

      // images
      for (const img of item.images || []) {
        await prisma.itemImage.create({
          data: {
            itemId: item.id,
            src: img.src,
            width: img.width || null,
            align: img.align || null
          }
        });
      }

      // vidéos
      for (const vid of item.videos || []) {
        await prisma.itemVideo.create({
          data: {
            itemId: item.id,
            src: vid.src,
            label: vid.label || null
          }
        });
      }

      // profils
      for (const profile of item.profiles || []) {
        await prisma.itemProfile.create({
          data: {
            itemId: item.id,
            profile
          }
        });
      }

      // enfants récursifs
      for (const child of item.children || []) {
        await processItem(child, moduleId, item.id);
      }
    }

    for (const it of mod.items || []) {
      await processItem(it, mod.id);
    }
  }

  // 3. Migration des notifications
  console.log('Migration des notifications...');
  for (const n of notificationsData) {
    const user = await prisma.user.findUnique({ where: { username: n.username } });
    if (!user) continue;
    await prisma.notification.upsert({
      where: { id: n.id },
      update: {},
      create: {
        id: n.id,
        userId: user.id,
        date: new Date(n.date),
        message: encrypt(n.message)
      }
    });
  }

  // 4. Migration de la progression
  console.log('Migration de la progression...');
  for (const p of progressData) {
    const user = await prisma.user.findUnique({ where: { username: p.username } });
    if (!user) continue;
    const prog = await prisma.progress.create({
      data: {
        userId: user.id,
        moduleId: p.moduleId
      }
    });
    for (const visitedId of p.visited || []) {
      await prisma.visitedItem.create({
        data: {
          progressId: prog.id,
          itemId: visitedId
        }
      });
    }
  }

  console.log('Migration terminée avec succès !');
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
