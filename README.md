# nodejs-socketpage

## Arduino

* Load zip to arduino: https://github.com/Links2004/arduinoWebSockets
* Install 'websocket' package by Markus Satter

Arduino ino:

```
#include <Arduino.h>
#include <ESP8266WiFi.h>
#include <ESP8266WiFiMulti.h>
#include <WebSocketsClient.h>
#include <Hash.h>


ESP8266WiFiMulti WiFiMulti;
WebSocketsClient webSocket;

int messageTimestamp = 0;
int heartbeatTimestamp = 0;

#define SSID "SSID"
#define PASS "PASS"

#define HEARTBEAT_INTERVAL 50
#define MESSAGE_INTERVAL 100
#define IP "MYIP"
#define PORT 4444

#define USE_SERIAL Serial1
bool isConnected = false;

void webSocketEvent(WStype_t type, uint8_t * payload, size_t length) {


    switch(type) {
        case WStype_DISCONNECTED:
            USE_SERIAL.printf("[WSc] Disconnected!\n");
            isConnected = false;
            break;
        case WStype_CONNECTED:
            {
                USE_SERIAL.printf("[WSc] Connected to url: %s\n",  payload);
                isConnected = true;

          // send message to server when Connected
                // socket.io upgrade confirmation message (required)
        webSocket.sendTXT("5");
            }
            break;
        case WStype_TEXT:
            USE_SERIAL.printf("[WSc] get text: %s\n", payload);

      // send message to server
      // webSocket.sendTXT("message here");
            break;
        case WStype_BIN:
            USE_SERIAL.printf("[WSc] get binary length: %u\n", length);
            hexdump(payload, length);

            // send data to server
            // webSocket.sendBIN(payload, length);
            break;
    }

}

void setup() {

    pinMode(2, OUTPUT);
    digitalWrite(2, LOW);
    USE_SERIAL.begin(115200);
   // USE_SERIAL.setDebugOutput(true);

    USE_SERIAL.println();
    USE_SERIAL.println();
    USE_SERIAL.println();

    for(uint8_t t = 4; t > 0; t--) {
        USE_SERIAL.printf("[SETUP] WAIT %d...\n", t);
        USE_SERIAL.flush();
        delay(1000);
    }

    WiFiMulti.addAP(SSID, PASS);
    webSocket.beginSocketIO(IP, PORT);
    webSocket.onEvent(webSocketEvent);
}

void loop() {
  
    webSocket.loop();

    if(isConnected) {

        uint64_t now = millis();

        if(now - messageTimestamp > MESSAGE_INTERVAL) {
            messageTimestamp = now;
            // example socket.io message with type "messageType" and JSON payload
            webSocket.sendTXT("42[\"data\"," + String(digitalRead(5)) + "]");
        }
        if((now - heartbeatTimestamp) > HEARTBEAT_INTERVAL) {
            heartbeatTimestamp = now;
            // socket.io heartbeat message
            webSocket.sendTXT("2");
        }
    }
}
```
