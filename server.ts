import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Initialize Gemini API
  const apiKey = process.env.GEMINI_API_KEY;
  let ai: GoogleGenAI | null = null;

  if (apiKey) {
    ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  } else {
    console.warn("UPOZORNĚNÍ: GEMINI_API_KEY není nastavena. AI funkce budou používat fallback odpovědi.");
  }

  // API: Get family trip tips for Bohumín and surrounding areas
  app.post("/api/tips", async (req, res) => {
    try {
      const { kid1Age = 10, kid2Age = 6, searchQuery = "", category = "all" } = req.body;

      if (!ai) {
        // Return rich local Czech fallback tips if AI is not configured
        return res.json(getFallbackTips());
      }

      let prompt = `Jsi místní rodinný průvodce a odborník na akce pro rodiny ve městě Bohumín a okolí (Moravskoslezský kraj, Slezsko, do vzdálenosti cca 35 km).
      Dnes je: 19. července 2026 (neděle).
      Máš vyhledat 5 reálných, aktuálních nebo velmi zajímavých konkrétních tipů na rodinné výlety a rodinné akce v Bohumíně a jeho bezprostředním okolí (např. v Karviné, Ostravě, Dolní Lutyni, Dětmarovicích, Orlové, Rychvaldu nebo polském příhraničí jako Chalupki, Gorzyce).

      Věk dětí v rodině: ${kid1Age} a ${kid2Age} let.
      Kategorie filtrování: ${category === "all" ? "všechny kategorie" : category}.
      `;

      if (searchQuery) {
        prompt += `\nUživatel specificky hledá: "${searchQuery}". Zaměř se na nalezení akcí nebo míst odpovídajících tomuto hledání.`;
      } else {
        prompt += `\nVyhledej zajímavé letní akce, letní kina, akce v Hobbyparku, koupání, výlety nebo programy pro rodiny s dětmi na tento a příští týden (červenec/srpen 2026).`;
      }

      prompt += `\nPro každou nalezenou akci či místo uveď:
      1. Atraktivní název výletu či akce
      2. Detailní popis s informací, co tam rodina s těmito dětmi zažije a proč tam jet
      3. Lokalitu (město, čtvrť nebo konkrétní areál)
      4. Vzdálenost z Bohumína (např. 'přímo v Bohumíně', '10 km', '25 km')
      5. Zda je to vhodné i pro malé děti (vhodné pro věk ${kid1Age} a ${kid2Age})
      6. Jednu z kategorií: 'nature' (příroda/venku), 'water' (koupání/voda), 'indoor' (vnitřní herna/pod střechou), 'culture' (historie/kultura), 'active' (sport/akce/zábava)
      7. Doporučené DATUM konání nebo výletu v rozmezí od 2026-07-20 do 2026-08-31 (formát YYYY-MM-DD)
      8. Doporučený nebo reálný ČAS začátku (formát HH:MM, např. '10:00') a ČAS konce (formát HH:MM, např. '15:00'). Pokud se nejedná o časově omezenou akci, navrhni nejvhodnější hodiny pro návštěvu s dětmi.

      Výstup vrať jako platný JSON seznam podle specifikovaného schématu. Názvy a popisy piš výhradně česky.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          temperature: 0.7,
          tools: [{ googleSearch: {} }],
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            description: "Seznam tipů na výlety a rodinné akce",
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING, description: "Unikátní ID, např. tip-1" },
                title: { type: Type.STRING, description: "Atraktivní název výletu či akce" },
                description: { type: Type.STRING, description: "Podrobný a poutavý popis, proč jet a co zažít" },
                location: { type: Type.STRING, description: "Město nebo přesnější lokalita (např. Bohumín, Ostrava, Karviná)" },
                distance: { type: Type.STRING, description: "Vzdálenost z Bohumína (např. přímo v Bohumíně, 10 km, 20 km)" },
                suitableForKids: { type: Type.BOOLEAN, description: "Zda je vhodné i pro malé děti" },
                category: { 
                  type: Type.STRING, 
                  description: "Kategorie výletu: nature, water, indoor, culture, active" 
                },
                date: { type: Type.STRING, description: "Doporučené datum konání nebo výletu ve formátu YYYY-MM-DD" },
                startTime: { type: Type.STRING, description: "Čas začátku ve formátu HH:MM (např. 10:00)" },
                endTime: { type: Type.STRING, description: "Čas konce ve formátu HH:MM (např. 15:00)" }
              },
              required: ["id", "title", "description", "location", "distance", "suitableForKids", "category", "date", "startTime", "endTime"]
            }
          }
        }
      });

      const responseText = response.text;
      if (responseText) {
        const parsedTips = JSON.parse(responseText.trim());
        return res.json(parsedTips);
      } else {
        throw new Error("Prázdná odpověď z Gemini");
      }
    } catch (error) {
      console.error("Chyba při volání Gemini pro výlety:", error);
      return res.json(getFallbackTips());
    }
  });

  // API: Ask the Family AI Assistant (Bohumínský Rodinný Rádce)
  app.post("/api/ask-bot", async (req, res) => {
    try {
      const { messages, members, activities } = req.body;

      if (!ai) {
        return res.json({
          content: "Ahoj! Jsem váš Bohumínský rodinný rádce. Momentálně běžím v offline režimu (není nakonfigurován API klíč pro Gemini), ale rád vám poradím! Zkuste navštívit Aquacentrum Bohumín, Kališovo jezero nebo Mauglího stezku v parku Petra Bezruče!"
        });
      }

      const systemInstruction = `Jsi "Bohumínský Rodinný Rádce" – přátelský, inteligentní a praktický pomocník pro čtyřčlennou rodinu (manžel, manželka a dvě děti), která žije v Bohumíně.
      Znáš velmi dobře Bohumín (čtvrti jako Nový Bohumín, Starý Bohumín, Skřečoň, Záblatí, Pudlov, Šunychl, Kopytov) a jeho okolí (Rychvald, Dětmarovice, Dolní Lutyně, Orlová, Karviná, Ostrava, polské příhraničí jako Chalupki, Gorzyce).
      
      Máš přístup k informacím o členech rodiny:
      ${JSON.stringify(members || [])}
      
      A k jejich aktuálnímu plánu aktivit na tento týden:
      ${JSON.stringify(activities || [])}
      
      Tvým úkolem je:
      1. Odpovídat rodině česky, vřele a konstruktivně.
      2. Pomáhat jim s plánováním času, hledat volná okna pro společný čas (kdy jsou všichni doma nebo mají volno).
      3. Upozorňovat na logické kolize (např. pokud se kryje doprovod dětí na kroužky s prací obou rodičů).
      4. Dávat skvělé a konkrétní tipy na rodinné výlety, akce, restaurace nebo cyklotrasy v Bohumíně a okolí (např. Penzion ve Věži, Mauglího ranč, cyklostezka podél Odry a Olše, Salon de thé, atd.).
      5. Na konci své odpovědi vždy položit 1 doplňující nebo upřesňující otázku, která pomůže rodině lépe naplánovat jejich den nebo výlet (např. "Chcete vědět, jak je tam otevřeno?", "Mám vyhledat trasu na kole nebo raději autem?", "Mám navrhnout, kdo z rodičů má zrovna čas vyzvednout Tomíka z kroužku?").
      
      Odpovídej stručně, přehledně, strukturovaně (používej odrážky pro přehlednost). Vyhni se obecným frázím, buď lokálně specifický!`;

      // Transform history for the Chat SDK
      // Note: We'll construct standard contents array or use chat helper.
      // Let's use direct generateContent to pass history easily.
      const formattedContents = messages.map((m: any) => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.content }]
      }));

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: formattedContents,
        config: {
          systemInstruction,
          temperature: 0.7,
        }
      });

      const text = response.text;
      return res.json({ content: text || "Omlouvám se, ale nepodařilo se mi vygenerovat odpověď." });
    } catch (error) {
      console.error("Chyba při volání rodinného rádce:", error);
      return res.status(500).json({ error: "Chyba na serveru při zpracování dotazu." });
    }
  });

  // API: AI Advice for "Co mám dělat, když..."
  app.post("/api/ai-advice", async (req, res) => {
    try {
      const { title, content, category, senderName, senderRole } = req.body;

      if (!ai) {
        return res.json({
          content: `Ahoj ${senderName || "v rodině"}! Jsem váš rodinný AI rádce. Momentálně běžím v offline režimu, protože není nastaven klíč pro Gemini.\n\nMoje rychlá rada: Vztahy a komunikace jsou základ. Zkus si v klidu sednout s ostatními u čaje, vysvětlit jim, jak se cítíš, a společně najít řešení. Otevřené srdce a naslouchání dělají zázraky!`
        });
      }

      const systemInstruction = `Jsi "Rodinný AI Psycholog a Rádce" – vysoce empatický, odborný, a zároveň srozumitelný průvodce pro rodinné vztahy, výchovu, pubertu a psychologii.
      Odpovídáš na otázku od člena rodiny, který prožívá nějakou situaci a ptá se "Co mám dělat, když...".
      
      Informace o tazateli:
      Jméno: ${senderName || "Člen rodiny"}
      Role v rodině: ${senderRole === 'manzel' ? 'Manžel / Táta' : senderRole === 'manzelka' ? 'Manželka / Máma' : 'Dítě / Sourozenec'}
      Kategorie problému: ${category}
      
      Tvůj tón musí být:
      - Nesmírně laskavý, podporující, bez jakéhokoliv odsuzování.
      - Srozumitelný pro toho, kdo se ptá:
        * Pokud se ptá dítě (role začínající na 'dite'), mluv jeho jazykem – kamarádsky, srozumitelně, s respektem a povzbuzením. Nepoužívej složitý psychologický žargon. Odpovídej jako superhodný starší brácha/ségra nebo psycholog pro děti.
        * Pokud se ptá rodič (táta/máma), mluv jako chápavý rodinný poradce, terapeut a parťák ve výchově.
      - Praktický – vždy nabídni 3-4 konkrétní, snadno proveditelné kroky nebo rady, jak situaci řešit, jak zvládnout emoce nebo jak o ní s ostatními mluvit.
      - Zaměřený na upevnění rodinných vazeb, pochopení emocí obou stran a otevřenou komunikaci.
      
      Formátování:
      - Používej odrážky pro přehlednost.
      - Piš česky, vřele a povzbudivě.`;

      const prompt = `Otázka: "Co mám dělat, když ${title}?"
      Doplňující kontext od uživatele: "${content || "Žádný další kontext nebyl poskytnut."}"`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          systemInstruction,
          temperature: 0.7,
        }
      });

      const text = response.text;
      return res.json({ content: text || "Omlouvám se, nepodařilo se mi vygenerovat radu." });
    } catch (error) {
      console.error("Chyba při generování AI rady:", error);
      return res.status(500).json({ error: "Chyba na serveru při generování AI rady." });
    }
  });

  // Vite middleware setup for development, or static file serving for production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server běžící na portu ${PORT}`);
  });
}

// Fallback tips in case AI is not available
function getFallbackTips() {
  return [
    {
      id: "tip-1",
      title: "Hobbypark Bohumín a Mauglího stezka",
      description: "Nádherný areál v parku Petra Bezruče v Novém Bohumíně. Nabízí obrovské dětské hřiště, lanovou stezku v korunách stromů (Mauglího stezka), Mauglího ranč se zvířátky (kozy, ovečky) a dopravní hřiště. Ideální místo pro celodenní rodinnou zábavu zcela zdarma.",
      location: "Bohumín, Park Petra Bezruče",
      distance: "přímo v Bohumíně",
      suitableForKids: true,
      category: "nature",
      date: "2026-07-20",
      startTime: "14:00",
      endTime: "17:00"
    },
    {
      id: "tip-2",
      title: "Aquacentrum Bohumín a sauna svět",
      description: "Moderní aquapark s krytým 25m bazénem, tobogánem dlouhým 48 metrů, divokou řekou, vířivkami a dětským brouzdalištěm. V létě je k dispozici venkovní areál. Součástí je i skvělé wellness centrum a saunový svět pro relaxaci rodičů.",
      location: "Bohumín, ul. Koperníkova",
      distance: "přímo v Bohumíně",
      suitableForKids: true,
      category: "water",
      date: "2026-07-21",
      startTime: "10:00",
      endTime: "13:00"
    },
    {
      id: "tip-3",
      title: "Přírodní památka Hraniční meandry Odry",
      description: "Soutok Odry s Olší a meandrující řeka tvořící hranici s Polskem. Úžasná cyklotrasa a naučná stezka vedoucí z Nového do Starého Bohumína až k soutoku. Pro dobrodružnější rodiny je možnost splouvání řeky na raftech nebo kanoích (půjčovna ve Starém Bohumíně).",
      location: "Starý Bohumín / Šunychl",
      distance: "3 km",
      suitableForKids: true,
      category: "nature",
      date: "2026-07-22",
      startTime: "09:00",
      endTime: "12:00"
    },
    {
      id: "tip-4",
      title: "Kališovo a Vrbické jezero",
      description: "Dvě oblíbená jezera vzniklá po těžbě štěrkopísku. Kališovo jezero (Kališok) nabízí čistou vodu ke koupání, pláže a půjčovnu šlapadel. Okolo Vrbického jezera vede krásná nová cyklostezka vhodná i pro in-line brusle, s výhledem na ptačí hnízdiště.",
      location: "Bohumín, Pudlov / Šunychl",
      distance: "2 km",
      suitableForKids: true,
      category: "water",
      date: "2026-07-23",
      startTime: "13:00",
      endTime: "16:00"
    },
    {
      id: "tip-5",
      title: "ZOO Ostrava a botanická zahrada",
      description: "Druhá největší zoologická zahrada v ČR se nachází jen kousek od Bohumína. Moderní pavilony (sloni, šimpanzi, šelmy), safari jízda vláčkem, obří dětská hřiště a krásný lesopark s botanickými stezkami. Skvělý tip na celodenní rodinný výlet.",
      location: "Ostrava, Michálkovice",
      distance: "15 km",
      suitableForKids: true,
      category: "active",
      date: "2026-07-25",
      startTime: "09:30",
      endTime: "16:30"
    }
  ];
}

startServer();
