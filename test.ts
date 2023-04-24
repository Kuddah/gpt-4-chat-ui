// Make sure to add OPENAI_API_KEY as a secret

import {
    Configuration,
    OpenAIApi,
    ChatCompletionRequestMessageRoleEnum,} from "openai";
  import type { NextApiRequest, NextApiResponse } from "next";
  
  
  const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
  });
  
  const openai = new OpenAIApi(configuration);
  
  async function chatHandler(
    req: NextApiRequest,
    res: NextApiResponse
  ) {
    const completion = await openai.createChatCompletion({
      // Downgraded to GPT-3.5 due to high traffic. Sorry for the inconvenience.
      // If you have access to GPT-4, simply change the model to "gpt-4"
      model: "gpt-3.5-turbo-0301",
      messages: [
        {
          role: ChatCompletionRequestMessageRoleEnum.System,
          content: "You are a world famous and smooth travel agent advisor, able to provide 3 plan option for the customer depending on there final destination. Your job is to extract the starting point, destination, what type of plan to provide, when the customer is planning to leave, for how long and who will accompany him, you are famously smooth when extracting the required info from the cosutmer and in a fun way to.After receiving this you will create 3 detailed daily plans and attractions for the customer.  Start and end of each travel plan should be with an international airport in the city.",
        },
        
      ].concat(req.body.messages),
      temperature: 0.2,
    });
    res.status(200).json({ result: completion.data.choices[0].message });
  }
  
  export default chatHandler;
  