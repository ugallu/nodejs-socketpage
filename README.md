# nodejs-socketpage

Example project to connect and visualize an ESP8266 board's pin state in a nodejs server.

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

int messageTimestamp = millis();
int heartbeatTimestamp = millis();

#define SSID "SSID"
#define PASS "PASS"

#define HEARTBEAT_INTERVAL 200
#define MESSAGE_INTERVAL 100

#define USE_SERIAL Serial1

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

}

void loop() {
  
    webSocket.loop();
   
    
    if((WiFiMulti.run() == WL_CONNECTED)) {

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
