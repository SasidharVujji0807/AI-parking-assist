import { Request, Response } from 'express';
import { supabaseAdmin } from '../db/supabase';
import { AuthenticatedRequest } from '../middleware/auth';
import { apiSuccess, apiError } from '../utils/helpers';
import {
  extractParkingIntent,
  generateRecommendationExplanation,
  generateChatResponse,
} from '../services/ai/gemini';
import { scoreAndRank, applySearchFilters } from '../services/recommendations/scorer';
import { AIChatRequestSchema, AIIntentSchema } from '../schemas';
import { z } from 'zod';

// ── POST /api/ai/parse-request ─────────────────────────────────────────────

export async function parseAIRequest(req: Request, res: Response) {
  const bodyResult = z.object({ message: z.string().min(1).max(2000) }).safeParse(req.body);
  if (!bodyResult.success) {
    return apiError(res, 'Invalid request', 'VALIDATION_ERROR', 400);
  }

  try {
    const intent = await extractParkingIntent(bodyResult.data.message);
    return apiSuccess(res, { intent });
  } catch (err) {
    console.error('[AI Parse Error]', err);
    return apiError(res, 'Failed to parse request', 'AI_ERROR', 500);
  }
}

// ── POST /api/ai/recommend ─────────────────────────────────────────────────

export async function getAIRecommendations(req: AuthenticatedRequest, res: Response) {
  const bodyResult = z.object({
    message: z.string().min(1).max(2000),
    userLat: z.number().optional(),
    userLng: z.number().optional(),
    city: z.string().optional(),
  }).safeParse(req.body);

  if (!bodyResult.success) {
    return apiError(res, 'Invalid request', 'VALIDATION_ERROR', 400);
  }

  try {
    // Step 1: Extract structured intent from natural language
    const intent = await extractParkingIntent(bodyResult.data.message);

    // Step 2: Query parking from database based on intent
    let dbQuery = supabaseAdmin
      .from('parking_locations')
      .select('*')
      .eq('is_active', true);

    if (intent.parkingType) dbQuery = dbQuery.eq('parking_type', intent.parkingType);
    if (intent.maxPrice) dbQuery = dbQuery.lte('price', intent.maxPrice);

    const searchCity = bodyResult.data.city || intent.destination;
    if (searchCity) dbQuery = dbQuery.ilike('city', `%${searchCity}%`);

    const { data: allParking, error } = await dbQuery.limit(100);
    if (error) throw error;

    // Step 3: Apply additional filters and attach distances
    const filtered = applySearchFilters(allParking || [], {
      lat: bodyResult.data.userLat,
      lng: bodyResult.data.userLng,
      radius: 15,
      evCharging: intent.evCharging,
      covered: intent.covered,
      security: intent.security,
      accessible: intent.accessible,
      is24h: intent.is24x7,
    });

    // Step 4: Deterministic scoring and ranking
    const ranked = scoreAndRank(filtered, {
      maxPrice: intent.maxPrice ?? undefined,
      evCharging: intent.evCharging,
      covered: intent.covered,
      security: intent.security,
      accessible: intent.accessible,
      is24x7: intent.is24x7,
      vehicleType: intent.vehicleType ?? undefined,
    }).slice(0, 10);

    const validIds = new Set(ranked.map(p => p.id));

    // Step 5: Gemini explains the recommendations (using only backend data)
    const explanation = await generateRecommendationExplanation(intent, ranked, validIds);

    // Step 6: Merge explanation with full parking data
    const enriched = explanation.recommendations
      .map(rec => {
        const parking = ranked.find(p => p.id === rec.parkingId);
        if (!parking) return null;
        return { ...rec, parking };
      })
      .filter(Boolean);

    // Save to AI conversation if user is authenticated
    if (req.user) {
      const convId = req.body.conversationId;
      if (convId) {
        await supabaseAdmin.from('ai_messages').insert([
          { conversation_id: convId, role: 'user', content: bodyResult.data.message },
          {
            conversation_id: convId, role: 'assistant',
            content: explanation.summary,
            metadata: { intent, recommendations: explanation.recommendations },
          },
        ]);
      }
    }

    return apiSuccess(res, {
      intent,
      summary: explanation.summary,
      recommendations: enriched,
      totalCandidates: ranked.length,
    });
  } catch (err) {
    console.error('[AI Recommend Error]', err);
    return apiError(res, 'Failed to generate recommendations', 'AI_ERROR', 500);
  }
}

// ── POST /api/ai/chat ──────────────────────────────────────────────────────

export async function aiChat(req: AuthenticatedRequest, res: Response) {
  const bodyResult = AIChatRequestSchema.safeParse(req.body);
  if (!bodyResult.success) {
    return apiError(res, 'Invalid request', 'VALIDATION_ERROR', 400, bodyResult.error.flatten().fieldErrors);
  }

  const { message, conversationId, userLat, userLng } = bodyResult.data;

  try {
    // Fetch or create conversation
    let convId = conversationId;

    if (req.user) {
      if (!convId) {
        const { data: conv } = await supabaseAdmin
          .from('ai_conversations')
          .insert({
            user_id: req.user.id,
            title: message.slice(0, 100),
          })
          .select()
          .single();
        convId = conv?.id;
      }

      // Fetch conversation history (last 6 messages)
      const { data: history } = await supabaseAdmin
        .from('ai_messages')
        .select('role, content')
        .eq('conversation_id', convId)
        .order('created_at', { ascending: false })
        .limit(6);

      const chatHistory = (history || []).reverse() as Array<{ role: 'user' | 'assistant'; content: string }>;

      // Build optional parking context
      let parkingContext: string | undefined;
      if (userLat && userLng) {
        const { data: nearbyParking } = await supabaseAdmin
          .from('parking_locations')
          .select('name, address, price, availability_status, rating, amenities')
          .eq('is_active', true)
          .limit(5);

        if (nearbyParking && nearbyParking.length > 0) {
          parkingContext = nearbyParking.map(p =>
            `${p.name} (${p.address}): ₹${p.price ?? 'unknown'}/hr, ${p.availability_status}, rating ${p.rating ?? 'N/A'}`
          ).join('\n');
        }
      }

      const responseText = await generateChatResponse(message, chatHistory, parkingContext);

      // Save messages
      if (convId) {
        await supabaseAdmin.from('ai_messages').insert([
          { conversation_id: convId, role: 'user', content: message },
          { conversation_id: convId, role: 'assistant', content: responseText },
        ]);
      }

      return apiSuccess(res, {
        response: responseText,
        conversationId: convId,
      });
    } else {
      // Guest user — no history stored
      const responseText = await generateChatResponse(message, []);
      return apiSuccess(res, { response: responseText });
    }
  } catch (err) {
    console.error('[AI Chat Error]', err);
    return apiError(res, 'Failed to generate response', 'AI_ERROR', 500);
  }
}
