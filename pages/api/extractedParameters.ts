import { ChatCompletionRequestMessageRoleEnum, Configuration, OpenAIApi } from "openai";
import { promises as fs } from "fs";
import path from "path";
import sqlite3 from "sqlite3";
import { open } from "sqlite";
import setupDatabase from "./database";
import type { NextApiRequest, NextApiResponse } from "next";
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

type ExtractedParameters = {
  departure_airport_iata: string;
  arrival_airport_iata: string;
  departure_date: string;
  return_date: string;
  num_adults: number;
  num_children: number;
  num_infants: number;
  cabin_class: string;
  currency: string;
};
const openai = new OpenAIApi(configuration);
async function askToExtractParameters(responseContent: string): Promise<ExtractedParameters | undefined> {
  const Prompt = `Your task is to extract the following parameters from a given response:

  Departure airport IATA code
  Arrival airport IATA code
  Departure date
  Return date
  Number of adults
  Number of children
  Number of infants
  Cabin class
  Currency
  Assume that if any of the parameters are not mentioned in the response, the default values are:
  
  Number of infants: 0
  Cabin class: economy
  Currency: USD
  You should use natural language processing techniques to parse the text and extract the relevant information. Note that the format of the response may vary, so you may need to adjust your parsing approach accordingly.  Response: "${responseContent}"`;
  
  console.log("prompt sent", Prompt);
  const completion = await openai.createChatCompletion({
      model: "gpt-3.5-turbo-0301",
      messages: [
        {
          role: ChatCompletionRequestMessageRoleEnum.System,
          content:Prompt,
        }],
      temperature: 0.2,
      max_tokens: 1024,
    });
    console.log("Completion Response:", completion.data.choices[0].message); // Added console.log here
   
  return completion.data.choices[0].message;
}

async function saveParametersToJSONFile(parameters: any) {
  const parametersDir = path.join(process.cwd(), "parameters");
  const filePath = path.join(parametersDir, "data.json");

  const data = JSON.stringify(parameters);

  await fs.writeFile(filePath, data, "utf-8");
}

async function updateParameterInFile(parameter: string, value: any) {
  const parametersDir = path.join(process.cwd(), "parameters");
  const filePath = path.join(parametersDir, `${parameter}.json`);

  const fileContent = await fs.readFile(filePath, "utf-8");
  const data = JSON.parse(fileContent);

  data.value = value;

  await fs.writeFile(filePath, JSON.stringify(data), "utf-8");
}

async function getParametersFromFiles() {
  const parametersDir = path.join(process.cwd(), "parameters");
  const parameterFiles = await fs.readdir(parametersDir);
  const parameters: any = {};

  for (const file of parameterFiles) {
    const filePath = path.join(parametersDir, file);
    const fileContent = await fs.readFile(filePath, "utf-8");
    const data = JSON.parse(fileContent);

    parameters[file.replace(".json", "")] = data.value;
  }

  return parameters;
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
  const db = await open({
    filename: "./database.db",
    driver: sqlite3.Database,
  });

  await db.run(
    `
    INSERT INTO travel_plans (departure_airport_iata, arrival_airport_iata, departure_date, return_date, num_adults, num_children, num_infants, cabin_class, currency)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `,
    [
      departure_airport_iata,
      arrival_airport_iata,
      departure_date,
      return_date,
      num_adults,
      num_children,
      num_infants,
      cabin_class,
      currency,
    ]
  );
}
export default async function extractedParametersHandler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { responseContent } = req.body;
  const extractedParameters = await askToExtractParameters(responseContent);

  if (!extractedParameters) {
    res.status(400).json({ success: false, message: "Could not extract parameters from the given response." });
    return;
  }

  await saveParametersToJSONFile(extractedParameters);

  await saveParametersToDatabase(
    extractedParameters.departure_airport_iata,
    extractedParameters.arrival_airport_iata,
    extractedParameters.departure_date,
    extractedParameters.return_date,
    extractedParameters.num_adults,
    extractedParameters.num_children,
    extractedParameters.num_infants,
    extractedParameters.cabin_class,
    extractedParameters.currency
  );

  res.status(200).json({ success: true });
}
export {
  askToExtractParameters,
  saveParametersToJSONFile,
  updateParameterInFile,
  getParametersFromFiles,
  saveParametersToDatabase,
};

