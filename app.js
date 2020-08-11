"use strict";

const express = require("express");
const bodyParser = require("body-parser");
const request = require("request");
const { call } = require("body-parser");
const access_token = process.env.ACCESS_TOKEN;

const app = express();

app.set("port", process.env.PORT || 5000);
app.use(bodyParser.json());

app.get("/", function (req, response) {
  response.send("We are online - Ginnio Sarabia L.");
});

app.get("/webhook", function (req, response) {
  if (req.query["hub.verify_token"] === process.env.HUB_VERIFY_TOKEN) {
    response.send(req.query["hub.challenge"]);
  } else {
    response.send("Token de verificación incorrecto 😠. No tienes permisos.");
  }
});

app.post("/webhook/", function (req, res) {
  const webhook_event = req.body.entry[0];
  if (webhook_event.messaging) {
    webhook_event.messaging.forEach((event) => {
      handleEvent(event.sender.id, event);
    });
  }
  res.sendStatus(200);
});

function handleEvent(senderId, event) {
  if (event.message) {
    if (event.message.quick_reply) {
      handlePostback(senderId, event.message.quick_reply.payload);
    } else {
      handleMessage(senderId, event.message);
    }
  } else if (event.postback) {
    handlePostback(senderId, event.postback.payload);
  }
}

function handleMessage(senderId, event) {
  if (event.text) {
    console.log(event.text);

    if (
      event.text.toUpperCase() === "MENU" ||
      event.text.toUpperCase() === "MENÚ"
    ) {
      getStartedMessage(senderId);
    }

    if (event.text.toUpperCase() === "WHATSAPP") {
      showWhatsapp(senderId);
    }
  } else if (event.attachments) {
    handleAttachments(senderId, event);
  }
}

function handlePostback(senderId, payload) {
  console.log(payload);
  switch (payload) {
    case "GET_STARTED_MAJESTICBOT":
      senderTypingOn(senderId);
      setTimeout(() => {
        getStartedMessage(senderId);
      }, 3000);

      break;
    case "LOCATION_PAYLOAD":
      messageImage(
        senderId,
        "https://res.cloudinary.com/dr6dushik/image/upload/v1596734083/Majestic/Calle_G%C3%B3mez_Rend%C3%B3n_y_la_23_bik65j.jpg"
      );
      senderTypingOn(senderId);
      setTimeout(() => {
        showLocation(senderId);
      }, 3000);
      break;

    case "WHATSAPP_PAYLOAD":
      messageImage(
        senderId,
        "https://res.cloudinary.com/dr6dushik/image/upload/v1596836906/Majestic/whatsapp_majestic_dl84im.jpg"
      );
      senderTypingOn(senderId);
      setTimeout(() => {
        showWhatsapp(senderId);
      }, 3000);
      break;

    case "PRICES_PAYLOAD":
      senderTypingOn(senderId);
      setTimeout(() => {
        showPrices(senderId);
      }, 3000);
      break;

    case "PHOTOS_PAYLOAD":
      senderTypingOn(senderId);
      setTimeout(() => {
        showPhotos(senderId);
      }, 3000);

      break;

    default:
      //Si se envia un mensaje para el que el Bot no tiene respuesta no hace nada.
      break;
  }
}

function senderTypingOn(senderId) {
  const messageData = {
    recipient: {
      id: senderId,
    },
    sender_action: "typing_on",
  };
  callSendApi(messageData);
}

function callSendApi(response) {
  request(
    {
      uri: "https://graph.facebook.com/me/messages",
      qs: {
        access_token: access_token,
      },
      method: "POST",
      json: response,
    },
    function (err) {
      if (err) {
        console.log("Ha ocurrido un error" + err);
      } else {
        console.log("Mensaje enviado correctamente.");
      }
    }
  );
}

function messageImage(senderId, urlImage) {
  const messageData = {
    recipient: {
      id: senderId,
    },
    message: {
      attachment: {
        type: "image",
        payload: {
          url: urlImage,
        },
      },
    },
  };
  callSendApi(messageData);
}

//Enviada en la primera interacción con el BOT y al escribir MENU
function getStartedMessage(senderId) {
  const messageData = {
    recipient: {
      id: senderId,
    },
    message: {
      text: `👋 Gracias por escribir al Hotel Majestic 
¿En que te puedo ayudar? 💁🏻
      
𝗥𝗘𝗖𝗨𝗘𝗥𝗗𝗔: Puedes escribir MENÚ para volver aquí.`,
      quick_replies: [
        {
          content_type: "text",
          title: "📍 Dirección",
          payload: "LOCATION_PAYLOAD",
        },
        {
          content_type: "text",
          title: "💲 Precios",
          payload: "PRICES_PAYLOAD",
        },
        {
          content_type: "text",
          title: "📷 Fotos",
          payload: "PHOTOS_PAYLOAD",
        },
        {
          content_type: "text",
          title: "📲 Whatsapp",
          payload: "WHATSAPP_PAYLOAD",
        },
      ],
    },
  };
  senderTypingOn(senderId);
  callSendApi(messageData);
}

function showLocation(senderId) {
  const messageData = {
    recipient: {
      id: senderId,
    },
    message: {
      text: `🏩 Dirección: Calle Gómez Rendón y la 23 (Francisco Piana Ratto).

📍 Ver en Google Maps: http://bit.ly/ComoLlegarMajestic `,
      quick_replies: [
        {
          content_type: "text",
          title: "💲 Precios",
          payload: "PRICES_PAYLOAD",
        },
        {
          content_type: "text",
          title: "📷 Fotos",
          payload: "PHOTOS_PAYLOAD",
        },
        {
          content_type: "text",
          title: "📲 Whatsapp",
          payload: "WHATSAPP_PAYLOAD",
        },
      ],
    },
  };

  callSendApi(messageData);
}

function showWhatsapp(senderId) {
  const messageData = {
    recipient: {
      id: senderId,
    },
    message: {
      text: `📅 𝗥𝗘𝗦𝗘𝗥𝗩𝗔 tu habitación 👩‍❤‍👨 a través de:

📲𝗪𝗵𝗮𝘁𝘀𝗮𝗽𝗽 1: https://bit.ly/EscribirWhatsappMajestic1
0997298413
      
📲𝗪𝗵𝗮𝘁𝘀𝗮𝗽𝗽 2: https://bit.ly/EscribirWhatsappMajestic2
0959201986

📲𝗪𝗵𝗮𝘁𝘀𝗮𝗽𝗽 3: https://bit.ly/EscribirWhatsappMajestic3
0979088955`,
      quick_replies: [
        {
          content_type: "text",
          title: "💲 Precios",
          payload: "PRICES_PAYLOAD",
        },
        {
          content_type: "text",
          title: "📍 Dirección",
          payload: "LOCATION_PAYLOAD",
        },
        {
          content_type: "text",
          title: "📷 Fotos",
          payload: "PHOTOS_PAYLOAD",
        },
      ],
    },
  };

  callSendApi(messageData);
}

function showPrices(senderId) {
  const messageData = {
    recipient: {
      id: senderId,
    },
    message: {
      text: `Todas nuestras habitaciones tienen WIFI 📶 y TV Cable 📺. 

      ➢ Precio: $ 10,50 
        ❄️ Aire acondicionado 
        Duración: 3 horas  
        Incluye: 3 cervezas y 2 aguas         
              
      ➢ Precio: $ 5,50
        ❄️ Aire acondicionado  
        Duración: 1 hora
      
      ➢ Precio: $ 7
        ❄️ Aire acondicionado
        Duración: 3 horas
      
      ➢ Amanecidas
        Precio: $ 10  
        ❄️ Aire acondicionado 
        Desde las 10pm Hasta las 10am
      
      ➢ Habitaciónes 24 horas
        Precio: $ 13   
        🌬️ Ventilador 
        
      ➢ Habitaciones 24 horas
        Precio: $ 18   
        ❄️ Aire acondicionado
      
      ➢ Suites para grupos
        Precio: $ 10 por persona   
        ❄️ Aire acondicionado
        Salida a las 12 pm
`,
      quick_replies: [
        {
          content_type: "text",
          title: "📍 Dirección",
          payload: "LOCATION_PAYLOAD",
        },
        {
          content_type: "text",
          title: "📷 Fotos",
          payload: "PHOTOS_PAYLOAD",
        },
        {
          content_type: "text",
          title: "📲 Whatsapp",
          payload: "WHATSAPP_PAYLOAD",
        },
      ],
    },
  };
  callSendApi(messageData);
}

function showPhotos(senderId) {
  messageImage(
    senderId,
    "https://res.cloudinary.com/dr6dushik/image/upload/v1596974482/Majestic/Habitaciones/escalera_xhyl42.jpg"
  );

  messageImage(
    senderId,
    "https://res.cloudinary.com/dr6dushik/image/upload/v1596974482/Majestic/Habitaciones/habitacion_24_zv8xka.jpg"
  );

  messageImage(
    senderId,
    "https://res.cloudinary.com/dr6dushik/image/upload/v1596974482/Majestic/Habitaciones/habitacion_sencilla_teqdpu.jpg"
  );

  messageImage(
    senderId,
    "https://res.cloudinary.com/dr6dushik/image/upload/v1596974482/Majestic/Habitaciones/pasillo_ag6ens.jpg"
  );

  messageImage(
    senderId,
    "https://res.cloudinary.com/dr6dushik/image/upload/v1597171629/Majestic/Habitaciones/Suite_para_grupos_2_qroxqo.jpg"
  );

  messageImage(
    senderId,
    "https://res.cloudinary.com/dr6dushik/image/upload/v1597171629/Majestic/Habitaciones/Suite_para_grupos_4_iue6jg.jpg"
  );

  messageImage(
    senderId,
    "https://res.cloudinary.com/dr6dushik/image/upload/v1597171629/Majestic/Habitaciones/Suite_para_grupos_3_c6zefj.jpg"
  );

  messageImage(
    senderId,
    "https://res.cloudinary.com/dr6dushik/image/upload/v1597171629/Majestic/Habitaciones/Suite_para_grupos_1_nzrwkd.jpg"
  );

  setTimeout(() => {
    const messageData = {
      recipient: {
        id: senderId,
      },
      message: {
        text: `¿Te puedo ayudar en algo más? 💁🏻`,
        quick_replies: [
          {
            content_type: "text",
            title: "💲 Precios",
            payload: "PRICES_PAYLOAD",
          },
          {
            content_type: "text",
            title: "📍 Dirección",
            payload: "LOCATION_PAYLOAD",
          },
          {
            content_type: "text",
            title: "📲 Whatsapp",
            payload: "WHATSAPP_PAYLOAD",
          },
        ],
      },
    };
    callSendApi(messageData);
  }, 3000);
}

app.listen(app.get("port"), function () {
  console.log(
    "Nuestro servidor esta funcionando en el puerto: ",
    app.get("port")
  );
});
