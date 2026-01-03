// ================== BLYNK ==================
#define BLYNK_TEMPLATE_ID "TMPL3uprem6kV"
#define BLYNK_TEMPLATE_NAME "Smart Home Energy Manager"
#define BLYNK_AUTH_TOKEN "AcVxWQBGf9cNYOX2cf-8Qcn_AvmTHvkJ"

// ================== LIBRARIES ==================
#define BLYNK_PRINT Serial
#include <WiFi.h>
#include <BlynkSimpleEsp32.h>
#include <HTTPClient.h>
#include <Arduino_JSON.h>
#include <Wire.h>
#include <LiquidCrystal_I2C.h>
#include <EmonLib.h>

// ================== WIFI & BACKEND ==================
char ssid[] = "GITAM-5GHz";
char pass[] = "Gitam$$123";
// Backend URL (Hugging Face Spaces)
const char* serverUrl = "https://ritesh1918-shem-backend.hf.space/api/energy"; 

// ================== PINS ==================
#define I2C_SDA_PIN 2
#define I2C_SCL_PIN 1
#define VOLTAGE_SENSOR_PIN 3
#define CURRENT_SENSOR_PIN 0

// ================== LCD ==================
LiquidCrystal_I2C lcd(0x27, 20, 4);

// ================== EMON ==================
EnergyMonitor emon;
const float VOLT_CAL = 45;
const float CURRENT_CAL = 25;

// ================== COST ==================
const float COST_PER_KWH = 6.0;

// ================== HARD FILTER THRESHOLDS ==================
// These are NON-NEGOTIABLE safety filters
const float VRMS_VALID_MIN   = 150.0;   // anything below is treated OFF
const float IRMS_VALID_MIN   = 0.05;
const float POWER_VALID_MIN  = 5.0;

// ================== GLOBALS ==================
double total_kWh = 0.0;
double total_cost = 0.0;
unsigned long lastMillis = 0;

bool loadON = false;
bool scanDone = false;

// ================== TIMER ==================
BlynkTimer timer;

// ================== SCANNING ==================
void showScanning() {
  unsigned long start = millis();
  unsigned long duration = random(3000, 6000);

  while (millis() - start < duration) {
    lcd.clear();
    lcd.setCursor(0, 1);
    lcd.print("Scanning Device");
    lcd.print("...");
    delay(400);
    lcd.print(".");
    delay(400);
  }
}

// ================== MAIN LOGIC ==================
void processAndSendData() {

  emon.calcVI(20, 2000);

  float rawV = emon.Vrms;
  float rawI = emon.Irms;
  float rawP = emon.realPower;

  // ---------- HARD LOAD DECISION ----------
  bool validVoltage = (rawV >= VRMS_VALID_MIN);
  bool validCurrent = (rawI >= IRMS_VALID_MIN);
  bool validPower   = (rawP >= POWER_VALID_MIN);

  loadON = (validVoltage && validCurrent && validPower);

  // ---------- SCAN ON OFF->ON ----------
  if (loadON && !scanDone) {
    showScanning();
    scanDone = true;
  }

  if (!loadON) {
    scanDone = false;
  }

  // ---------- FORCE SAFE VALUES ----------
  float Vrms = loadON ? rawV : 0.0;
  float Irms = loadON ? rawI : 0.0;
  float Power = loadON ? rawP : 0.0;

  // ---------- ENERGY ----------
  unsigned long now = millis();
  if (lastMillis == 0) lastMillis = now;

  if (loadON) {
    double delta_kWh =
      (Power * (now - lastMillis)) / 3600000000.0;
    total_kWh += delta_kWh;
  }

  total_cost = total_kWh * COST_PER_KWH;
  lastMillis = now;

  // ---------- BLYNK ----------
  Blynk.virtualWrite(V0, Vrms);
  Blynk.virtualWrite(V1, Irms);
  Blynk.virtualWrite(V2, Power);
  Blynk.virtualWrite(V3, total_kWh);
  Blynk.virtualWrite(V4, total_cost);

  // ---------- BACKEND ----------
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    http.begin(serverUrl);
    http.addHeader("Content-Type", "application/json");

    JSONVar payload;
    payload["voltage"] = Vrms;
    payload["current"] = Irms;
    payload["power"] = Power;
    payload["energy_kWh"] = total_kWh;
    payload["cost_rs"] = total_cost;

    int httpResponseCode = http.POST(JSON.stringify(payload));
    if (httpResponseCode > 0) {
      Serial.print("HTTP Response code: ");
      Serial.println(httpResponseCode);
    } else {
      Serial.print("Error code: ");
      Serial.println(httpResponseCode);
    }
    http.end();
  } else {
    Serial.println("WiFi Disconnected");
  }

  // ---------- LCD ----------
  lcd.clear();
  if (!loadON) {
    lcd.setCursor(0, 1);
    lcd.print("Load: OFF");
    lcd.setCursor(0, 2);
    lcd.print("0V  0A  0W");
  } else {
    lcd.setCursor(0, 0);
    lcd.print("Voltage: ");
    lcd.print(Vrms, 0);
    lcd.print("V");

    lcd.setCursor(0, 1);
    lcd.print("Current: ");
    lcd.print(Irms, 2);
    lcd.print("A");

    lcd.setCursor(0, 2);
    lcd.print("Power: ");
    lcd.print(Power, 1);
    lcd.print("W");
  }
  delay(2000);

  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("Energy: ");
  lcd.print(total_kWh, 4);
  lcd.print("kWh");

  lcd.setCursor(0, 1);
  lcd.print("Cost: Rs ");
  lcd.print(total_cost, 2);
  delay(2000);
}

// ================== SETUP ==================
void setup() {
  Serial.begin(115200);
  Wire.begin(I2C_SDA_PIN, I2C_SCL_PIN);

  lcd.init();
  lcd.backlight();

  lcd.clear();
  lcd.setCursor(0, 1);
  lcd.print("Smart Energy Meter");
  lcd.setCursor(0, 2);
  lcd.print("Initializing...");
  delay(2000);
  lcd.clear();

  randomSeed(micros());

  Blynk.begin(BLYNK_AUTH_TOKEN, ssid, pass);

  emon.voltage(VOLTAGE_SENSOR_PIN, VOLT_CAL, 1.7);
  emon.current(CURRENT_SENSOR_PIN, CURRENT_CAL);

  timer.setInterval(6000L, processAndSendData);
}

// ================== LOOP ==================
void loop() {
  Blynk.run();
  timer.run();
}
