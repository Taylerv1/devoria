import "server-only";

import { unstable_noStore as noStore } from "next/cache";
import { getFirebaseAdminDb } from "@/lib/firebase-admin";
import {
  SITE_CONTENT_COLLECTION,
  SITE_CONTENT_DOCS,
  HomePageContent,
  AboutPageContent,
  ContactPageContent,
  normalizeHomePageContent,
  normalizeAboutPageContent,
  normalizeContactPageContent,
} from "@/lib/site-content";

async function getSiteContentDocument(docId: string) {
  noStore();

  try {
    const snapshot = await getFirebaseAdminDb()
      .collection(SITE_CONTENT_COLLECTION)
      .doc(docId)
      .get();

    return snapshot.exists ? snapshot.data() : null;
  } catch (error) {
    console.error(`[site-content] Failed to load "${docId}" content:`, error);
    return null;
  }
}

export async function getHomePageContent(): Promise<HomePageContent> {
  const raw = await getSiteContentDocument(SITE_CONTENT_DOCS.home);
  return normalizeHomePageContent(raw);
}

export async function getAboutPageContent(): Promise<AboutPageContent> {
  const raw = await getSiteContentDocument(SITE_CONTENT_DOCS.about);
  return normalizeAboutPageContent(raw);
}

export async function getContactPageContent(): Promise<ContactPageContent> {
  const raw = await getSiteContentDocument(SITE_CONTENT_DOCS.contact);
  return normalizeContactPageContent(raw);
}
