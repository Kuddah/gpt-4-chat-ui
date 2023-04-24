// chat.ts
import {
  Configuration,
  OpenAIApi,
  ChatCompletionRequestMessageRoleEnum,
} from "openai";
import type { NextApiRequest, NextApiResponse } from "next";
import { askToExtractParameters, saveParametersToDatabase } from "./extractedParameters";

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

async function chatHandler(req: NextApiRequest, res: NextApiResponse) {
  const Content ='As a smooth and expert travel advisor, your task is to offer three different travel options based on the customers final destination. You should skillfully extract the necessary information from the customer regarding their starting point, destination, preferred travel plan, departure date, duration of the trip, and number of people accompanying them. You are known for your friendly and enjoyable approach to collecting this information. Once you have gathered all the necessary details, you will create three unique travel plans that include daily itineraries and attractions. Each plan will start and end at an international airport in the city of the customers choice, and you will provide specific dates for each plan and destination. In the end, you will summarize all the gathered information and confirm with the customer if it meets their needs. Additionally, you will provide a detailed breakdown of the dates for each travel plan to ensure that the customer has all the necessary information to book his flight';
  const completion = await openai.createChatCompletion({
    model: "gpt-3.5-turbo-0301",
    messages: [
      {
        role: ChatCompletionRequestMessageRoleEnum.System,
        content:Content,
      },
    ].concat(req.body.messages),
    temperature: 0.2,
    max_tokens: 1024,
  });

  if (completion.data.choices[0].message) {
    res.status(200).json({ result: completion.data.choices[0].message });

    // const responseContent = completion.data.choices[0].message.content;
    // const extractedParameters = await askToExtractParameters(responseContent);
    // console.log("Extracted parameters:", extractedParameters);
    // await saveParametersToDatabase(JSON.parse(extractedParameters));
  } else {
    res.status(500).json({ error: "Unable to extract the message from the GPT response." });
  }
}

export default chatHandler;
