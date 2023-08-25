import OpenAI from 'openai';
import { AutoblocksTracer } from '@autoblocks/client';
import { CreateChatCompletionRequestMessage } from 'openai/resources/chat';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const tracer = new AutoblocksTracer(process.env.AUTOBLOCKS_INGESTION_KEY as string);

const inputs: { traceId: string, content: string }[] = [
  {
    traceId: 'mount-everest-serious',
    content: 'Mount Everest is the tallest mountain the world',
  },
  {
    traceId: 'mount-everest-playful',
    content: 'OMG did you know mount everest is the tallest mountain in the world ???',
  },
];

const main = async () => {
  for (const input of inputs) {
    tracer.setTraceId(input.traceId);

    const prompt = `Categorize the user's input as either serious or playful.`;
    const messages: CreateChatCompletionRequestMessage[] = [
      { role: 'system', content: prompt }, 
      { role: 'user', content: input.content },
    ];
    await tracer.sendEvent('ai.request', { properties: { input: messages } });

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages,
    });

    const output = completion.choices[0].message;

    await tracer.sendEvent('ai.response', { properties: { 
      output, 
      model: completion.model, 
      provider: 'openai',
    }});
  }
}

main();
