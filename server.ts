import 'dotenv/config';
import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { getSheetData, mapRowsToProperties, mapRowsToRates, appendSheetData } from './sheets.js';
import { magicPolishProperty } from './src/services/geminiService.js';

// In-memory fallback and cache
let properties = [
  {
    id: "prop_1",
    title: "Luxury 3 BHK in Lokhandwala Complex",
    location: "Lokhandwala, Andheri West",
    type: "sale",
    bhk: 3,
    price: "₹3.5 Cr",
    area: "1450 sqft",
    description: "Beautifully designed 3 BHK apartment with premium fittings, overlooking the main road. Swipe to see the beautiful bedroom views and kitchen.",
    mediaUrls: "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=600&q=80,https://images.unsplash.com/photo-1600566753086-00f18efc2291?auto=format&fit=crop&w=600&q=80,https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&q=80",
    amenities: ["Gym", "Pool", "Parking", "Security"],
    source: 'local'
  },
  {
    id: "prop_2",
    title: "Fully Furnished 2 BHK for Rent",
    location: "Andheri East, near JB Nagar Metro",
    type: "rent",
    bhk: 2,
    price: "₹65,000/mo",
    area: "900 sqft",
    description: "Ideal for families or working professionals. Watch the video walkthrough to experience the incredible lighting in this home.",
    mediaUrls: "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4,https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=600&q=80",
    amenities: ["Furnished", "Parking", "Security", "Metro access"],
    source: 'local'
  },
  {
    id: "prop_3",
    title: "Premium 4 BHK Penthouse",
    location: "Lokhandwala, Andheri West",
    type: "sale",
    bhk: 4,
    price: "₹6.2 Cr",
    area: "2800 sqft",
    description: "Ultra-luxury penthouse with private terrace and skyline views.",
    mediaUrls: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=600&q=80",
    amenities: ["Private Terrace", "Pool", "Gym", "Lounge"],
    source: 'local'
  }
];

let cachedRates: any = {};
let enquiries = [];

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // --- API Routes ---

  // Get all properties (Prefers Google Sheets)
  app.get('/api/properties', async (req, res) => {
    const rows = await getSheetData('Properties!A:J');
    if (rows) {
      const sheetProps = mapRowsToProperties(rows);
      // Merge spreadsheet data with any WhatsApp volatile data
      const merged = [...sheetProps, ...properties.filter(p => p.source === 'whatsapp')];
      return res.json(merged);
    }
    res.json(properties);
  });

  // Get single property
  app.get('/api/properties/:id', async (req, res) => {
    const rows = await getSheetData('Properties!A:J');
    let allProps = properties;
    if (rows) {
      allProps = [...mapRowsToProperties(rows), ...properties.filter(p => p.source === 'whatsapp')];
    }
    
    const property = allProps.find(p => p.id === req.params.id);
    if (property) {
      res.json(property);
    } else {
      res.status(404).json({ error: 'Property not found' });
    }
  });

  // Store an enquiry
  app.post('/api/enquiries', async (req, res) => {
    const { name, phone, email, message, propertyId } = req.body;
    const enquiry = [Date.now().toString(), name, phone, email, message, propertyId];
    
    // Also save to Google Sheet if available
    await appendSheetData('Enquiries!A:F', [enquiry]);
    
    enquiries.push({...req.body, id: enquiry[0]});
    res.json({ success: true, enquiry });
  });

  // Price Estimator (Uses Google Sheets for dynamic rates)
  app.post('/api/estimate', async (req, res) => {
    const { location, bhk, purpose } = req.body;
    
    // Fetch rates from Google Sheets "Rates" tab
    const rateRows = await getSheetData('Rates!A:C');
    const rates = rateRows ? mapRowsToRates(rateRows) : null;
    
    const locKey = location.toLowerCase();
    const isLokhandwala = locKey.includes('lokhandwala');
    
    let baseRatePerSqft = isLokhandwala ? 32000 : 26000;
    
    // Try to find exact match in sheet
    if (rates) {
      const match = Object.keys(rates).find(k => locKey.includes(k));
      if (match) baseRatePerSqft = rates[match].baseRate;
    }

    const bhkNum = parseInt(bhk) || 2;
    const avgSqftPerBhk = 550; // standard carpet
    const estimatedSqft = bhkNum * avgSqftPerBhk;
    
    let rangeHeader = "";
    let explanation = "";
    let rentPrice = bhkNum * (isLokhandwala ? 35000 : 25000 * 1.2);

    if (purpose === 'sale') {
      const totalPrice = (estimatedSqft * baseRatePerSqft) / 10000000; // In CR
      rangeHeader = `₹${(totalPrice * 0.9).toFixed(1)} Cr - ₹${(totalPrice * 1.1).toFixed(1)} Cr`;
      explanation = `Based on dynamic rates in ${location}, premium properties command approx ${baseRatePerSqft.toLocaleString()}/sqft.`;
    } else {
      rangeHeader = `₹${Math.round(rentPrice / 1000) * 1000}/mo - ₹${Math.round((rentPrice * 1.3) / 1000) * 1000}/mo`;
      explanation = `Rental yield based on ${location} current indices.`;
    }

    res.json({
      estimateRange: rangeHeader,
      explanation: explanation,
      marketTrend: "Rising",
      rentOrBuyAdvice: purpose === 'sale' ? "Excellent time to sell as stock is limited." : "Rents are peaking; consider a long-term lease now."
    });
  });

  // AI Insights
  app.post('/api/insights', async (req, res) => {
    const { location } = req.body;
    const isLokhandwala = location.toLowerCase().includes('lokhandwala');

    res.json({
      whyBuyOrRent: [
        "High-appreciation potential due to developed infrastructure.",
        "Walking distance to premium cafes, clubs, and lifestyle hubs.",
        "Secure, gated community vibe with elite gentry."
      ],
      areaVibe: isLokhandwala ? "Elite, vibrant, and the heart of Mumbai's media hub." : "Centrally located with excellent connectivity to WEH and stations.",
      distances: [
        { "place": "Nearest Metro", "distance": "5-7 mins", "type": "transit" },
        { "place": "Celebration Sports Club", "distance": "10-12 mins", "type": "leisure" },
        { "place": "Infinity Mall", "distance": "15 mins", "type": "shopping" }
      ]
    });
  });

  // WhatsApp parsing (Appends to Google Sheets)
  app.post('/api/webhook/whatsapp', async (req, res) => {
    try {
      const messageBody = req.body.Body || req.body.text || "";
      
      const mediaUrls = [];
      for(let i=0; i<10; i++) {
        if(req.body[`MediaUrl${i}`]) mediaUrls.push(req.body[`MediaUrl${i}`]);
      }
      if (req.body.mediaUrl) mediaUrls.push(req.body.mediaUrl);
      if (mediaUrls.length === 0) mediaUrls.push("https://images.unsplash.com/photo-1628624747186-a941c476b7ef?auto=format&fit=crop&w=800&q=80");

      let extracted;
      try {
        const aiExtracted = await magicPolishProperty(messageBody);
        
        if (aiExtracted) {
          extracted = aiExtracted;
        }
      } catch (err) {
        console.error("Failed to use Magic Polish", err);
      }

      // Fallback to regex if AI fails or throws
      if (!extracted) {
        const bhkMatch = messageBody.match(/(\d+)\s*bhk/i);
        const priceMatch = messageBody.match(/₹?\s*(\d+\.?\d*)\s*(Cr|Lakh|k)/i);
        extracted = {
          title: bhkMatch ? `${bhkMatch[1]} BHK Apartment in ${messageBody.includes('Lokhandwala') ? 'Lokhandwala' : 'Andheri'}` : "New Property Listing",
          location: messageBody.includes('Lokhandwala') ? "Lokhandwala, Andheri West" : "Andheri West, Mumbai",
          type: messageBody.toLowerCase().includes('rent') ? "rent" : "sale",
          bhk: bhkMatch ? parseInt(bhkMatch[1]) : 2,
          price: priceMatch ? `₹${priceMatch[1]} ${priceMatch[2]}` : (messageBody.toLowerCase().includes('rent') ? "₹65,000/mo" : "₹2.5 Cr"),
          area: "Approx 1000 sqft",
          description: messageBody.substring(0, 150) + "...",
          amenities: "Parking, Lift, Security"
        };
      }

      const newRow = [
        `prop_${Date.now()}`,
        extracted.title,
        extracted.location,
        extracted.type,
        extracted.bhk.toString(),
        extracted.price,
        extracted.area,
        extracted.description,
        mediaUrls.join(','),
        extracted.amenities
      ];

      // Try appending to sheet
      await appendSheetData('Properties!A:J', [newRow]);

      properties.unshift({
        ...extracted,
        id: newRow[0],
        mediaUrls: mediaUrls.join(','),
        source: 'whatsapp',
        amenities: extracted.amenities.split(',').map((s: string) => s.trim())
      });

      res.json({ success: true, message: "Property Auto-Listed!", property: extracted });
    } catch (err: any) {
      res.status(500).json({ error: "Parsing error" });
    }
  });

  // Get Property Tips (Can also be from a sheet later)
  app.get('/api/tips', async (req, res) => {
    const tipsRows = await getSheetData('Tips!A:B');
    if (tipsRows) {
       return res.json(tipsRows.slice(1).map(r => ({ category: r[0], content: r[1] })));
    }
    
    res.json([
      { category: "Sunlight", content: "East-facing apartments in Andheri receive the best morning light, keeping rooms cool in the afternoon." },
      { category: "Air Quality", content: "Units above the 10th floor in Lokhandwala typically experience significantly less road dust and better breeze." },
      { category: "Location", content: "Check for building age in older Lokhandwala pockets; reconstruction projects may affect future tranquility." },
      { category: "View", content: "West-facing units often offer sea-glimpses but can get very heated during Mumbai summers." }
    ]);
  });

  // --- Vite Middleware ---
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
