#!/usr/bin/env node
import { GoogleGenerativeAI } from '@google/generative-ai';

const GOOGLE_API_KEY = 'AIzaSyBV4eXRDZHqHjgMjScKC0h5oTyjKPZnKIU';
const genAI = new GoogleGenerativeAI(GOOGLE_API_KEY);

async function testVision() {
  // Test with a simple image
  const imageUrl = 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=400&q=80';

  console.log('Fetching image...');
  const response = await fetch(imageUrl);
  const buffer = await response.arrayBuffer();
  const base64 = Buffer.from(buffer).toString('base64');
  console.log('Image fetched, size:', base64.length);

  // Try different model names
  const models = ['gemini-2.0-flash-exp', 'gemini-1.5-flash-latest', 'gemini-pro-vision'];

  for (const modelName of models) {
    console.log(`\nTrying model: ${modelName}`);
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent([
        'Describe this image in one sentence.',
        {
          inlineData: {
            mimeType: 'image/jpeg',
            data: base64
          }
        }
      ]);
      console.log(`✅ ${modelName} works!`);
      console.log('Response:', result.response.text());
      break;
    } catch (e) {
      console.log(`❌ ${modelName} failed:`, e.message);
    }
  }
}

testVision().catch(console.error);
