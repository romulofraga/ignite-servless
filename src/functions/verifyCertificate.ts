import { APIGatewayProxyHandler } from "aws-lambda";
import { document } from "../utils/dynamodbClient";

export const handle: APIGatewayProxyHandler = async (event) => {
  const { id } = event.pathParameters;

  const response = await document.query({
    TableName: "users_certificates",
    KeyConditionExpression: "id = :id",
    ExpressionAttributeValues: {
      ":id": id
    }
  }).promise()

  const userCertificate = response.Items[0]

  if (userCertificate) {
    return {
      headers: {
        "Content-Type": "application/json"
      },
      statusCode: 200,
      body: JSON.stringify({
        message: "Valid certificate",
        URL: `https://servlesscreatecertificate.s3.sa-east-1.amazonaws.com/${id}.pdf`,
      })
    }
  }

  return {
    headers: {
      "Content-Type": "application/json"
    },
    statusCode: 400,
    body: JSON.stringify({
      error: "Certificate is not valid."
    })
  }
}