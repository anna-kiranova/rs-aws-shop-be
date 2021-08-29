const headers = {
  'Access-Control-Allow-Headers': '*',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': '*'
}

export const formatJSONResponse = (status: number, response: any) => {
  if (status === 200) {
    return {
      statusCode: status,
      headers,
      body: JSON.stringify({
        result: response
      })
    }
  }
  return {
    statusCode: status,
    headers,
    body: JSON.stringify({
      error: response
    })
  }
}
