import chromium from "chrome-aws-lambda";
import path from "path";
import fs from "fs";
import handlebars from "handlebars";
import dayjs from 'dayjs';

import { document } from '../utils/dynamodbClient';

interface ICreateCertificate {
  id: string;
  name: string;
  grade: string;  
}

interface ITemplate {
  id: string;
  name: string;
  grade: string;
  date: string;
  medal: string
}

const compile = async function(data:ITemplate) {
  const filePath = path.join(process.cwd(), "src", "functions", "templates", "certificate.hbs")
  
  const html = fs.readFileSync(filePath, "utf-8")
 
  return handlebars.compile(html)(data);
}

export const handle = async (event) => {
  const { id, name, grade } =  JSON.parse(event.body) as ICreateCertificate;

  await document.put({
    TableName: "users_certificates",
    Item: {
      id,
      name,
      grade
    }
  }).promise();

  const medalPath = path.join(process.cwd(), "src", "functions", "templates", "selo.png")
  const medal = fs.readFileSync(medalPath, "base64")


  const data: ITemplate = {
    id,
    name,
    grade,
    medal, 
    date: dayjs().format("DD/MM/YYYY"),
  }

  const contentHTML = await compile(data)

  const browser = chromium.puppeteer.launch({
    headless: true,
    args: chromium.args,
    defaultViewport: chromium.defaultViewport,
    executablePath: await chromium.executablePath,
  });

  const page = await (await browser).newPage();

  await page.setContent(contentHTML);

  const contentPDF = await page.pdf({
    format: "a4",
    landscape: true,
    path: process.env.IS_OFFLINE ? "certificate.pdf": null,
    printBackground: true,
    preferCSSPageSize: true
  })

   await (await browser).close()

  return {
    statusCode: 201,
    body: JSON.stringify({
      message: "Certificate created!"
    }),
    headers: {
      "Content-Type":"application/json"
    }
  };
  
}
