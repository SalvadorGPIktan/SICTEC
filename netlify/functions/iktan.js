exports.handler = async function (event) {
  try {
    const serviciosPermitidos = [
      "ballena",
      "kraken",
      "foca",
      "payaso",
      "coral"
    ];

    const servicio = event.queryStringParameters?.service;

    if (!serviciosPermitidos.includes(servicio)) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          error: "Servicio no válido"
        })
      };
    }

    const baseUrl = process.env.IKTAN_API_BASE_URL;

    if (!baseUrl) {
      return {
        statusCode: 500,
        body: JSON.stringify({
          error: "IKTAN_API_BASE_URL no está configurada"
        })
      };
    }

    const params = new URLSearchParams(
      event.queryStringParameters || {}
    );

    params.delete("service");

    const query = params.toString();

    const url =
      `${baseUrl.replace(/\/$/, "")}/${servicio}` +
      (query ? `?${query}` : "");

    const response = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/json"
      }
    });

    const buffer = await response.arrayBuffer();

    const decoder = new TextDecoder("iso-8859-1");
    const body = decoder.decode(buffer);

    if (!response.ok) {
      return {
        statusCode: response.status,
        body: JSON.stringify({
          error: "Error consultando IKTAN",
          status: response.status
        })
      };
    }

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Cache-Control": "no-store"
      },
      body
    };

  } catch (error) {
    console.error(error);

    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "Error interno del proxy"
      })
    };
  }
};
