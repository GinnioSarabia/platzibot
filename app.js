"use strict";

const express = require("express");
const bodyParser = require("body-parser");
const request = require("request");
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
    defaultMessage(senderId);
  } else if (event.attachments) {
    handleAttachments(senderId, event);
  }
}

function defaultMessage(senderId) {
  const messageData = {
    recipient: {
      id: senderId,
    },
    message: {
      text:
        "Hola soy un bot de messenger y te invito a utilizar nuestro menu. Att Ginnio Andrés",
      quick_replies: [
        {
          content_type: "text",
          title: "¿Quieres una Pizza?",
          payload: "PIZZAS_PAYLOAD",
        },
        {
          content_type: "text",
          title: "Acerca de",
          payload: "ABOUT_PAYLOAD",
        },
      ],
    },
  };
  senderActions(senderId);
  callSendApi(messageData);
}

function handlePostback(senderId, payload) {
  console.log(payload);
  switch (payload) {
    case "GET_STARTED_PUGPIZZA":
      senderActions(senderId);
      defaultMessage(senderId);
      break;
    case "PIZZAS_PAYLOAD":
      senderActions(senderId);
      showPizzas(senderId);
      break;
    case "PEPPERONI_PAYLOAD":
      senderActions(senderId);
      sizePizza(senderId);
      break;
    case "PERSONAL_SIZE_PAYLOAD":
      senderActions(senderId);
      getLocation(senderId);
      break;
    case "CONTACT_PAYLOAD":
      senderActions(senderId);
      contactSuppport(senderId);
      break;
    case "LOCATIONS_PAYLOAD":
      senderActions(senderId);
      showLocations(senderId);
      break;
    case "ABOUT_PAYLOAD":
      senderActions(senderId);
      setTimeout(() => {
        messageImage(
          senderId,
          "https://media.giphy.com/media/JdyQWFOVo6s5G/giphy.gif"
        );
        messageImage(
          senderId,
          "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7f/Shakira.JPG/220px-Shakira.JPG"
        );
        messageImage(
          senderId,
          "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7f/Shakira.JPG/220px-Shakira.JPG"
        );
      }, 4000);

      break;
    case "HELP_PAYLOAD":
      senderActions(senderId);
      messageImage(
        senderId,
        "https://www.cajadebotin.com/wp-content/uploads/2019/04/dragon-ball-fighter-z-season-pass-2-character-goku-gt-kid-super-saiyajin-4-ssj4-bandai-namco.jpg"
      );
      break;
    default:
      defaultMessage(senderId);
      break;
  }
}

//Envia la acción typing_on durante 4 segundos.
function senderActions(senderId) {
  const messageData = {
    recipient: {
      id: senderId,
    },
    sender_action: "typing_on",
  };
  callSendApi(messageData);
}

// Reconoce el tipo de archivo adjunto.
function handleAttachments(senderId, event) {
  let attachment_type = event.attachments[0].type;
  switch (attachment_type) {
    case "image":
      console.log(attachment_type);
      break;
    case "video":
      console.log(attachment_type);
      break;
    case "audio":
      console.log(attachment_type);
      break;
    case "file":
      console.log(attachment_type);
      break;
    case "location":
      receipt(senderId);
    default:
      console.log(attachment_type);
      break;
  }
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

function showPizzas(senderId) {
  const messageData = {
    recipient: {
      id: senderId,
    },
    message: {
      attachment: {
        type: "template",
        payload: {
          template_type: "generic",
          elements: [
            {
              title: "Peperoni",
              subtitle: "Con todo el sabor del peperoni",
              image_url:
                "https://s3.amazonaws.com/chewiekie/img/productos-pizza-peperoni-champinones.jpg",
              buttons: [
                {
                  type: "postback",
                  title: "Elegir Pepperoni",
                  payload: "PEPPERONI_PAYLOAD",
                },
              ],
            },
            {
              title: "Pollo BBQ",
              subtitle: "Con todo el sabor del BBQ",
              image_url:
                "https://s3.amazonaws.com/chewiekie/img/productos-pizza-peperoni-champinones.jpg",
              buttons: [
                {
                  type: "postback",
                  title: "Elegir Pollo BBQ",
                  payload: "BBQ_PAYLOAD",
                },
              ],
            },
          ],
        },
      },
    },
  };
  callSendApi(messageData);
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

function contactSuppport(senderId) {
  const messageData = {
    recipient: {
      id: senderId,
    },
    message: {
      attachment: {
        type: "template",
        payload: {
          template_type: "button",
          text: "Hola este es el canal de soporte, ¿quieres llamarnos?",
          buttons: [
            {
              type: "phone_number",
              title: "Llamar a un asesor",
              payload: "+571231231231",
            },
          ],
        },
      },
    },
  };
  callSendApi(messageData);
}

function showLocations(senderId) {
  const messageData = {
    recipient: {
      id: senderId,
    },
    message: {
      attachment: {
        type: "template",
        payload: {
          template_type: "generic",
          elements: [
            {
              title: "Sucursal Mexico",
              image_url: "https://i.imgur.com/wakuMT3.jpeg",
              subtitle: "Direccion bonita #555",
              buttons: [
                {
                  title: "Ver en el mapa",
                  type: "web_url",
                  url: "https://goo.gl/maps/GCCpWmZep1t",
                  webview_height_ratio: "full",
                },
              ],
            },
            {
              title: "Sucursal Colombia",
              image_url:
                "https://images.pexels.com/photos/164595/pexels-photo-164595.jpeg",
              subtitle: "Direccion muy lejana #333",
              buttons: [
                {
                  title: "Ver en el mapa",
                  type: "web_url",
                  url: "https://goo.gl/maps/GCCpWmZep1t",
                  webview_height_ratio: "tall",
                },
              ],
            },
          ],
        },
      },
    },
  };
  callSendApi(messageData);
}

function sizePizza(senderId) {
  const messageData = {
    recipient: {
      id: senderId,
    },
    message: {
      attachment: {
        type: "template",
        payload: {
          template_type: "generic",
          elements: [
            {
              title: "Individual",
              image_url:
                "https://s3.amazonaws.com/chewiekie/img/productos-pizza-peperoni-champinones.jpg",
              subtitle: "Porcion individual de pizza",
              buttons: [
                {
                  type: "postback",
                  title: "Elegir Individual",
                  payload: "PERSONAL_SIZE_PAYLOAD",
                },
              ],
            },
            {
              title: "Mediana",
              image_url:
                "https://s3.amazonaws.com/chewiekie/img/productos-pizza-peperoni-champinones.jpg",
              subtitle: "Porcion Mediana de pizza",
              buttons: [
                {
                  type: "postback",
                  title: "Elegir Mediana",
                  payload: "MEDIUM_SIZE_PAYLOAD",
                },
              ],
            },
          ],
        },
      },
    },
  };
  callSendApi(messageData);
}

function receipt(senderId) {
  const messageData = {
    recipient: {
      id: senderId,
    },
    message: {
      attachment: {
        type: "template",
        payload: {
          template_type: "receipt",
          recipient_name: "Oscar Barajas",
          order_number: "123123",
          currency: "MXN",
          payment_method: "Efectivo",
          order_url: "https://platzi.com/order/123",
          timestamp: "123123123",
          address: {
            street_1: "Platzi HQ",
            street_2: "---",
            city: "Mexico",
            postal_code: "543135",
            state: "Mexico",
            country: "Mexico",
          },
          summary: {
            subtotal: 12.0,
            shipping_cost: 2.0,
            total_tax: 1.0,
            total_cost: 15.0,
          },
          adjustments: [
            {
              name: "Descuento frecuent",
              amount: 1.0,
            },
          ],
          elements: [
            {
              title: "Pizza Pepperoni",
              subtitle: "La mejor pizza de pepperoni",
              quantity: 1,
              price: 10,
              currency: "MXN",
              image_url:
                "https://s3.amazonaws.com/chewiekie/img/productos-pizza-peperoni-champinones.jpg",
            },
            {
              title: "Bebida",
              subtitle: "Jugo de Tamarindo",
              quantity: 1,
              price: 2,
              currency: "MXN",
              image_url:
                "https://s3.amazonaws.com/chewiekie/img/productos-pizza-peperoni-champinones.jpg",
            },
          ],
        },
      },
    },
  };
  callSendApi(messageData);
}

function getLocation(senderId) {
  const messageData = {
    recipient: {
      id: senderId,
    },
    message: {
      text: "Ahora ¿Puedes proporcionarnos tu ubicación?",
      quick_replies: [
        {
          content_type: "location",
        },
      ],
    },
  };
  callSendApi(messageData);
}

app.listen(app.get("port"), function () {
  console.log(
    "Nuestro servidor esta funcionando en el puerto: ",
    app.get("port")
  );
});
