export const handle = async (event) => {
  return {
    statusCode: 200,
    body: JSON.stringify({
      message: "hello word!"
    }),
    headers: {
      "Content-Type":"application/json"
    }
  }
}
