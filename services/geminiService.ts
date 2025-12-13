import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(
  process.env.NEXT_PUBLIC_GEMINI_API_KEY || ""
);

export interface PlantAIData {
  isValid: boolean;
  validationMessage?: string;
  wateringSchedule?: string;
  fertilizingSchedule?: string;
  specialCare?: string[];
}

export interface JournalFeedback {
  summary: string;
  growthRating: number; // 1-5 stars
  tips: string[];
}

export interface UserContext {
  experienceLevel?: "beginner" | "intermediate" | "expert";
  healthCondition?: string[];
  healthGoals?: string[];
  allergies?: string[];
}

export async function validateAndGeneratePlantData(
  plantName: string,
  plantType: string,
  userContext?: UserContext
): Promise<PlantAIData> {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    // Build user context description
    let userContextDescription = "";
    if (userContext) {
      if (userContext.experienceLevel) {
        const levelMap = {
          beginner: "pemula yang baru mengenal tanaman herbal",
          intermediate: "tingkat menengah dengan pengalaman berkebun",
          expert: "ahli dengan pengalaman luas dalam tanaman herbal",
        };
        userContextDescription += `\nTingkat Pengalaman User: ${levelMap[userContext.experienceLevel]
          }`;
      }
      if (
        userContext.healthCondition &&
        userContext.healthCondition.length > 0
      ) {
        userContextDescription += `\nKondisi Kesehatan User: ${userContext.healthCondition.join(
          ", "
        )}`;
      }
      if (userContext.healthGoals && userContext.healthGoals.length > 0) {
        userContextDescription += `\nTujuan Kesehatan User: ${userContext.healthGoals.join(
          ", "
        )}`;
      }
      if (userContext.allergies && userContext.allergies.length > 0) {
        userContextDescription += `\nAlergi User: ${userContext.allergies.join(
          ", "
        )}`;
      }
    }

    const prompt = `Kamu adalah ahli botani dan berkebun. Analisis tanaman berikut:

Nama Tanaman: ${plantName}
Jenis yang Diklaim: ${plantType}
${userContextDescription}

Tugas:
1. Validasi apakah "${plantType}" adalah jenis tanaman yang benar-benar ada (bukan objek palsu seperti batu, besi, dll).
2. Jika valid, berikan rekomendasi perawatan dalam format JSON berikut:

{
  "isValid": true,
  "wateringSchedule": "berapa kali sehari tanaman ini perlu disiram (contoh: '2 kali sehari' atau '1 kali sehari')",
  "fertilizingSchedule": "berapa kali sebulan tanaman ini perlu dipupuk (contoh: '2 kali sebulan' atau '1 kali sebulan')",
  "specialCare": ["array of string berisi 2-3 tips perawatan khusus untuk tanaman ini"]
}

3. Jika TIDAK valid (bukan tanaman), kembalikan:

{
  "isValid": false,
  "validationMessage": "Penjelasan singkat mengapa ini bukan tanaman yang valid"
}

PENTING: 
- Hanya kembalikan JSON murni tanpa markdown atau formatting tambahan
- Pastikan semua nilai dalam bahasa Indonesia
- wateringSchedule dan fertilizingSchedule harus berupa string yang jelas (contoh: "2 kali sehari", "3 kali sebulan")
- specialCare harus array of string dengan 2-3 tips praktis
- SESUAIKAN tingkat detail dan bahasa dengan tingkat pengalaman user:
  * Pemula: Berikan instruksi yang sangat detail dan mudah dipahami
  * Menengah: Berikan instruksi yang cukup detail dengan beberapa tips tambahan
  * Ahli: Berikan instruksi yang ringkas dan fokus pada hal-hal penting
- Jika ada kondisi kesehatan atau tujuan kesehatan user, pertimbangkan dalam memberikan tips perawatan khusus
- Jika ada alergi user, WAJIB peringatkan jika tanaman ini bisa menyebabkan reaksi alergi`;

    // Retry configuration
    const MAX_RETRIES = 3;
    const INITIAL_DELAY = 1000; // 1 second

    let lastError;

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // Clean up the response to extract JSON
        let jsonText = text.trim();

        // Remove markdown code blocks if present
        jsonText = jsonText.replace(/```json\n?/g, "").replace(/```\n?/g, "");

        // Parse the JSON response
        const aiData: PlantAIData = JSON.parse(jsonText);

        return aiData;
      } catch (error: any) {
        console.warn(`Attempt ${attempt} failed:`, error.message);
        lastError = error;

        // Check if it's a 503 error or overload error
        const isOverloaded =
          error.message.includes("503") || error.message.includes("overloaded");

        if (isOverloaded && attempt < MAX_RETRIES) {
          // Exponential backoff
          const delay = INITIAL_DELAY * Math.pow(2, attempt - 1);
          console.log(`Retrying in ${delay}ms...`);
          await new Promise((resolve) => setTimeout(resolve, delay));
          continue;
        }

        // If it's not a retryable error or we've exhausted retries, break loop
        break;
      }
    }

    // If we get here, all retries failed
    console.error("All retry attempts failed:", lastError);
    throw new Error(
      "Layanan AI sedang sibuk. Mohon tunggu sebentar dan coba lagi."
    );
  } catch (error: any) {
    console.error("Error calling Gemini AI:", error);
    // Preserve the specific overload error message if that's what we threw above
    if (error.message.includes("Layanan AI sedang sibuk")) {
      throw error;
    }
    throw new Error("Gagal memvalidasi tanaman dengan AI. Silakan coba lagi.");
  }
}

export async function generateJournalFeedback(
  currentJournal: string,
  previousJournal: string | null,
  plantType: string,
  plantName: string
): Promise<JournalFeedback> {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `Kamu adalah ahli botani AI bernama Erbis. Analisis perkembangan tanaman berikut:

Nama Tanaman: ${plantName}
Jenis Tanaman: ${plantType}

Jurnal Minggu Ini: "${currentJournal}"
${previousJournal ? `Jurnal Minggu Lalu: "${previousJournal}"` : "Ini adalah jurnal pertama."}

Tugas:
1. Bandingkan kondisi minggu ini dengan minggu lalu (jika ada).
2. Berikan rating pertumbuhan (1-5 bintang) berdasarkan kesehatan dan progress.
3. Berikan 2-3 tips perawatan spesifik untuk minggu depan.
4. Buat ringkasan singkat (maksimal 2 kalimat) yang menyemangati user.

Output JSON:
{
  "summary": "Ringkasan singkat yang ramah dan menyemangati",
  "growthRating": 4, // Integer 1-5
  "tips": ["Tip 1", "Tip 2"]
}

PENTING:
- Gunakan bahasa Indonesia yang ramah dan suportif.
- Output HANYA JSON valid.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Clean up JSON
    let jsonText = text.trim();
    jsonText = jsonText.replace(/```json\n?/g, "").replace(/```\n?/g, "");

    return JSON.parse(jsonText) as JournalFeedback;

  } catch (error: any) {
    console.error("Error generating feedback:", error);
    throw new Error("Gagal menganalisis jurnal. Silakan coba lagi.");
  }
}

export async function chatWithPlantAI(
  plant: any,
  userContext: UserContext | undefined,
  journals: any[],
  question: string
): Promise<string> {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    // 1. Build Context String
    let context = `Informasi Tanaman:
- Nama: ${plant.name}
- Jenis: ${plant.kind}
- Umur: ${plant.plantedDate} (Tanggal Tanam)
- Media Tanam: ${plant.soilType}
- Jadwal Siram: ${plant.wateringSchedule}
- Jadwal Pupuk: ${plant.fertilizerSchedule}
- Perawatan Khusus: ${plant.specialCare?.join(", ") || "-"}
`;

    if (userContext) {
      context += `\nProfil User:
- Pengalaman: ${userContext.experienceLevel || "-"}
- Kondisi Kesehatan: ${userContext.healthCondition?.join(", ") || "-"}
- Tujuan: ${userContext.healthGoals?.join(", ") || "-"}
- Alergi: ${userContext.allergies?.join(", ") || "-"}
`;
    }

    if (journals.length > 0) {
      context += `\nRiwayat Jurnal Terakhir (3 terbaru):
${journals.slice(0, 3).map((j, i) =>
        `${i + 1}. [Minggu ${j.week}] ${j.date}: "${j.note}" (Feedback AI: ${j.feedbackData?.summary || "-"})`
      ).join("\n")}
`;
    }

    const prompt = `Kamu adalah Erbis, asisten ahli tanaman herbal yang ramah dan pintar.
    
CONTEXT:
${context}

PERTANYAAN USER:
"${question}"

INSTRUKSI:
Jawab pertanyaan user dengan ramah, suportif, dan berdasarkan data tanaman di atas.
Jika ada info dari jurnal yang relevan, sebutkan untuk menunjukkan kamu "ingat" kondisi tanaman.
Berikan jawaban yang praktis dan tidak terlalu panjang (maksimal 3 paragraf).
Gunakan bahasa Indonesia yang natural.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();

  } catch (error: any) {
    console.error("Error chatting with AI:", error);
    throw new Error("Maaf, Erbis sedang pusing. Coba tanya lagi nanti ya.");
  }
}
