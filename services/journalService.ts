import { db } from "@/lib/firebase";
import {
    collection,
    addDoc,
    getDocs,
    doc,
    deleteDoc,
    query,
    where,
    orderBy,
    Timestamp,
    limit
} from "firebase/firestore";

export type JournalEntry = {
    id?: string;
    userId: string;
    plantId: string;
    content: string;
    mood?: string;
    createdAt?: Date;
    plantGrowth?: string;
    imageUrl?: string;
    aiFeedback?: string; // Legacy simple string
    feedbackId?: string; // Reference to feedback doc
    feedbackData?: JournalFeedbackData; // Hydrated data
};

export interface JournalFeedbackData {
    id?: string;
    journalId: string;
    plantId: string;
    summary: string;
    growthRating: number;
    tips: string[];
    createdAt: Date;
}

const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000;

// Helper to check if user can create a new entry for a SPECIFIC PLANT
export const canCreateEntry = async (userId: string, plantId: string): Promise<{ allowed: boolean; nextDate?: Date }> => {
    try {
        const q = query(
            collection(db, "journals"),
            where("userId", "==", userId),
            where("plantId", "==", plantId),
            orderBy("createdAt", "desc"),
            limit(1)
        );
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            return { allowed: true };
        }

        const lastDoc = querySnapshot.docs[0];
        const lastDate = lastDoc.data().createdAt.toDate();
        const now = new Date();
        const diff = now.getTime() - lastDate.getTime();

        if (diff < ONE_WEEK_MS) {
            const nextDate = new Date(lastDate.getTime() + ONE_WEEK_MS);
            return { allowed: false, nextDate };
        }

        return { allowed: true };
    } catch (error) {
        console.error("Error checking journal constraint:", error);
        throw error;
    }
};

// Create a new journal entry
export const createJournalEntry = async (entryData: Omit<JournalEntry, "id" | "createdAt">) => {
    try {
        // Enforce check again on server-side logic equivalent
        const check = await canCreateEntry(entryData.userId, entryData.plantId);
        if (!check.allowed) {
            throw new Error(`Anda baru bisa mengisi jurnal lagi pada ${check.nextDate?.toLocaleDateString("id-ID")}`);
        }

        const docRef = await addDoc(collection(db, "journals"), {
            ...entryData,
            createdAt: Timestamp.now(),
        });
        return docRef.id;
    } catch (error) {
        console.error("Error creating journal entry:", error);
        throw error;
    }
};

// Save AI Feedback
export const saveJournalFeedback = async (data: Omit<JournalFeedbackData, "id" | "createdAt">) => {
    try {
        const docRef = await addDoc(collection(db, "feedbacks"), {
            ...data,
            createdAt: Timestamp.now(),
        });
        return docRef.id;
    } catch (error) {
        console.error("Error saving feedback:", error);
        throw error;
    }
};

// Get all journal entries for a SPECIFIC PLANT (Merged with Feedback)
export const getPlantJournalEntries = async (userId: string, plantId: string): Promise<JournalEntry[]> => {
    try {
        // 1. Fetch Journals
        const qJournal = query(
            collection(db, "journals"),
            where("userId", "==", userId),
            where("plantId", "==", plantId),
            orderBy("createdAt", "desc")
        );
        const journalSnap = await getDocs(qJournal);

        const journals: JournalEntry[] = [];
        journalSnap.forEach((doc) => {
            journals.push({
                id: doc.id,
                ...doc.data(),
                createdAt: doc.data().createdAt?.toDate(),
            } as JournalEntry);
        });

        // 2. Fetch Feedbacks for this plant
        const qFeedback = query(
            collection(db, "feedbacks"),
            where("plantId", "==", plantId)
        );
        const feedbackSnap = await getDocs(qFeedback);
        const feedbacks: Record<string, JournalFeedbackData> = {};

        feedbackSnap.forEach((doc) => {
            const data = doc.data();
            feedbacks[data.journalId] = {
                id: doc.id,
                ...data,
                createdAt: data.createdAt?.toDate()
            } as JournalFeedbackData;
        });

        // 3. Merge
        return journals.map(journal => ({
            ...journal,
            feedbackData: journal.id ? feedbacks[journal.id] : undefined
        }));

    } catch (error) {
        console.error("Error fetching journal entries:", error);
        throw error;
    }
};
