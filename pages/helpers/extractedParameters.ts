import { ChatCompletionRequestMessageRoleEnum, Configuration, OpenAIApi } from "openai";
import { promises as fs } from "fs";
import path from "path";
import {
    saveParametersToFile,
    updateParameterInFile,
    
  } from "../api/extractedParameters";
import setupDatabase from "../api/database";

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);
  
  async function askToExtractParameters(responseContent: string) {
    const Prompt = `Your task is to extract specific parameters from a given response, including departure_airport_iata, arrival_airport_iata, departure_date, return_date, num_adults, num_children, num_infants, cabin_class, and currency. If any of the parameters are not mentioned in the response, you should assume that num_infants is 0, cabin_class is economy, and currency is USD. Response: "${responseContent}"`;
    const completion = await openai.createChatCompletion({
      model: "gpt-3.5-turbo-0301",
      messages: [
        {
          role: ChatCompletionRequestMessageRoleEnum.System,
          content: Prompt,
        },
      ],
      temperature: 0.2,
      max_tokens: 2024,
      n: 1,
      stop: "\n",
    });
    console.log("Completion Response:", completion); // Added console.log here

    return completion.data.choices[0].message;
    
  }
  
  async function saveParameters(parameter: string, value: any) {
    if (value === null) {
      await saveParametersToFile(parameter);
    } else {
      await updateParameterInFile(parameter, value);
    }
  }
  
  async function saveParametersToDatabase(
    departure_airport_iata: string,
    arrival_airport_iata: string,
    departure_date: string,
    return_date: string,
    num_adults: number,
    num_children: number,
    num_infants: number,
    cabin_class: string,
    currency: string,
  ) {
    const parameters = [
      departure_airport_iata,
      arrival_airport_iata,
      departure_date,
      return_date,
      num_adults,
      num_children,
      num_infants,
      cabin_class,
      currency,
    ];
  
    const parameterNames = [
      "departure_airport_iata",
      "arrival_airport_iata",
      "departure_date",
      "return_date",
      "num_adults",
      "num_children",
      "num_infants",
      "cabin_class",
      "currency",
    ];
  
    const hasNullValues = parameters.some((parameter) => parameter === null);
  
    if (hasNullValues) {
      for (let i = 0; i < parameters.length; i++) {
        await saveParameters(parameterNames[i], parameters[i]);
      }
    } else {
      const db = await setupDatabase();
  
      await db.run(
        `
        INSERT INTO travel_plans (departure_airport_iata, arrival_airport_iata, departure_date, return_date, num_adults, num_children, num_infants, cabin_class, currency)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
        parameters
      );
    }
  }
  
  export {
    askToExtractParameters,
    saveParametersToDatabase,
  };
