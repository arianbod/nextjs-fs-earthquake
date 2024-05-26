'use server'
// import prisma from "@/prisma/db";
import { revalidatePath } from "next/cache";
import OpenAI from "openai";

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
})

export const generateChatResponse = async (chatMessages) => {
    try {

        // Then, inside an async function where you have access to the request object:
        const response = await openai.chat.completions.create({
            messages: [
                { role: 'system', content: 'you are a AI assistant for helping to fill a form about how the user building can be strong enough in earthquake situations' },
                ...chatMessages
            ],
            model: 'gpt-4o-2024-05-13',
            temperature: 1,
            max_tokens: 500
        })
        return { message: response.choices[0].message, tokens: response.usage.total_tokens }
    } catch (error) {
        console.log(error);
        return null
    }
}
