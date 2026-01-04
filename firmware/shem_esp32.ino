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
#include <esp_task_wdt.h>  // Watchdog Timer

// ================== WIFI & BACKEND ==================
char ssid[] = "GITAM-5GHz";
char pass[] = "Gitam$$123";

// ========= CHANGE THIS TO YOUR CURRENT PC IP =========
// Run 'ipconfig' in PowerShell and find your IPv4 Address
// Your current IP appears to be: 172.20.128.159
const char* serverUrl = "http://172.20.128.159:5000/api/energy"; 

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
const float VRMS_VALID_MIN   = 150.0;
const float IRMS_VALID_MIN   = 0.05;
const float POWER_VALID_MIN  = 5.0;

// ================== GLOBALS ==================
double total_kWh = 0.0;
double total_cost = 0.0;
unsigned long lastMillis = 0;
unsigned long lastWiFiCheck = 0;
unsigned long lastBlynkCheck = 0;

bool loadON = false;
bool scanDone = false;
bool wifiConnected = false;
bool blynkConnected = false;

// ================== TIMER ==================
BlynkTimer timer;

// ================== WATCHDOG TIMEOUT (30 seconds) ==================
#define WDT_TIMEOUT 30

// ================== WIFI CONNECTION (NON-BLOCKING) ==================
void connectWiFi() {
  if (WiFi.status() == WL_CONNECTED) {
    wifiConnected = true;
    return;
  }
  
  wifiConnected = false;
  Serial.println("Connecting to WiFi...");
  lcd.clear();
  lcd.setCursor(0, 1);
  lcd.print("Connecting WiFi...");
  
  WiFi.mode(WIFI_STA);
  WiFi.begin(ssid, pass);
  
  // Non-blocking wait with timeout
  unsigned long startAttempt = millis();
  while (WiFi.status() != WL_CONNECTED && millis() - startAttempt < 10000) {
    delay(500);
    Serial.print(".");
    esp_task_wdt_reset(); // Feed watchdog while waiting
  }
  
  if (WiFi.status() == WL_CONNECTED) {
    wifiConnected = true;
    Serial.println("\nWiFi Connected!");
    Serial.print("IP: ");
    Serial.println(WiFi.localIP());
    lcd.clear();
    lcd.setCursor(0, 1);
    lcd.print("WiFi OK: ");
    lcd.print(WiFi.localIP());
    delay(1000);
  } else {
    Serial.println("\nWiFi Failed! Will retry...");
    lcd.clear();
    lcd.setCursor(0, 1);
    lcd.print("WiFi Failed!");
    lcd.setCursor(0, 2);
    lcd.print("Retrying...");
  }
}

// ================== BLYNK CONNECTION (NON-BLOCKING) ==================
void connectBlynk() {
  if (!wifiConnected) {
    blynkConnected = false;
    return;
  }
  
  if (Blynk.connected()) {
    blynkConnected = true;
    return;
  }
  
  blynkConnected = false;
  Serial.println("Connecting to Blynk...");
  
  // Use config instead of begin (non-blocking)
  Blynk.config(BLYNK_AUTH_TOKEN);
  
  // Try to connect with timeout
  unsigned long startAttempt = millis();
  while (!Blynk.connected() && millis() - startAttempt < 5000) {
    Blynk.connect();
    delay(100);
    esp_task_wdt_reset();
  }
  
  if (Blynk.connected()) {
    blynkConnected = true;
    Serial.println("Blynk Connected!");
  } else {
    Serial.println("Blynk Failed! Will retry...");
  }
}

// ================== CHECK CONNECTIONS ==================
void checkConnections() {
  unsigned long now = millis();
  
  // Check WiFi every 30 seconds
  if (now - lastWiFiCheck > 30000 || lastWiFiCheck == 0) {
    lastWiFiCheck = now;
    if (WiFi.status() != WL_CONNECTED) {
      connectWiFi();
    }
  }
  
  // Check Blynk every 15 seconds
  if (now - lastBlynkCheck > 15000 || lastBlynkCheck == 0) {
    lastBlynkCheck = now;
    if (wifiConnected && !Blynk.connected()) {
      connectBlynk();
    }
  }
}

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
    esp_task_wdt_reset();
  }
}

// ================== MAIN LOGIC ==================
void processAndSendData() {
  esp_task_wdt_reset(); // Feed watchdog at start of processing

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

  // ---------- Serial Debug ----------
  Serial.println("=== Sensor Reading ===");
  Serial.print("Load: "); Serial.println(loadON ? "ON" : "OFF");
  Serial.print("V: "); Serial.print(Vrms); Serial.println(" V");
  Serial.print("I: "); Serial.print(Irms); Serial.println(" A");
  Serial.print("P: "); Serial.print(Power); Serial.println(" W");
  Serial.print("E: "); Serial.print(total_kWh, 4); Serial.println(" kWh");
  Serial.print("Cost: Rs "); Serial.println(total_cost, 2);
  Serial.println("=====================");

  // ---------- BLYNK ----------
  if (blynkConnected) {
    Blynk.virtualWrite(V0, Vrms);
    Blynk.virtualWrite(V1, Irms);
    Blynk.virtualWrite(V2, Power);
    Blynk.virtualWrite(V3, total_kWh);
    Blynk.virtualWrite(V4, total_cost);
    Serial.println("Blynk: Data sent!");
  } else {
    Serial.println("Blynk: Not connected, skipping...");
  }

  // ---------- BACKEND ----------
  if (wifiConnected) {
    HTTPClient http;
    http.begin(serverUrl);
    http.addHeader("Content-Type", "application/json");
    http.setTimeout(5000); // 5 second timeout

    JSONVar payload;
    payload["voltage"] = Vrms;
    payload["current"] = Irms;
    payload["power"] = Power;
    payload["energy_kWh"] = total_kWh;
    payload["cost_rs"] = total_cost;

    Serial.print("Sending to: ");
    Serial.println(serverUrl);
    
    int httpResponseCode = http.POST(JSON.stringify(payload));
    if (httpResponseCode > 0) {
      Serial.print("Backend HTTP Response: ");
      Serial.println(httpResponseCode);
    } else {
      Serial.print("Backend Error: ");
      Serial.println(httpResponseCode);
      Serial.println("Check if server is running and IP is correct!");
    }
    http.end();
  } else {
    Serial.println("WiFi Disconnected - Cannot send to backend");
  }

  // ---------- LCD ----------
  lcd.clear();
  if (!loadON) {
    lcd.setCursor(0, 0);
    lcd.print("WiFi: ");
    lcd.print(wifiConnected ? "OK" : "NO");
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
  esp_task_wdt_reset();

  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("Energy: ");
  lcd.print(total_kWh, 4);
  lcd.print("kWh");

  lcd.setCursor(0, 1);
  lcd.print("Cost: Rs ");
  lcd.print(total_cost, 2);
  
  lcd.setCursor(0, 3);
  lcd.print(wifiConnected ? "WiFi:OK " : "WiFi:NO ");
  lcd.print(blynkConnected ? "Blynk:OK" : "Blynk:NO");
  
  delay(2000);
  esp_task_wdt_reset();
}

// ================== SETUP ==================
void setup() {
  Serial.begin(115200);
  Serial.println("\n\n=== SHEM ESP32 Starting ===");
  
  // Initialize Watchdog Timer (30 seconds)
  Serial.println("Initializing Watchdog Timer...");
  
  // Fix for ESP32 Arduino Core v3.0+ (ESP-IDF v5.x)
  esp_task_wdt_config_t wdt_config = {
      .timeout_ms = WDT_TIMEOUT * 1000,
      .idle_core_mask = (1 << 0), // Subscribe Core 0
      .trigger_panic = true
  };
  esp_task_wdt_init(&wdt_config);
  esp_task_wdt_add(NULL);
  
  Wire.begin(I2C_SDA_PIN, I2C_SCL_PIN);

  lcd.init();
  lcd.backlight();

  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("SHEM Energy Meter");
  lcd.setCursor(0, 1);
  lcd.print("v2.0 - Improved");
  lcd.setCursor(0, 2);
  lcd.print("Initializing...");
  delay(2000);
  lcd.clear();

  randomSeed(micros());

  // Non-blocking WiFi connection
  connectWiFi();
  
  // Non-blocking Blynk connection
  connectBlynk();

  emon.voltage(VOLTAGE_SENSOR_PIN, VOLT_CAL, 1.7);
  emon.current(CURRENT_SENSOR_PIN, CURRENT_CAL);

  timer.setInterval(6000L, processAndSendData);
  timer.setInterval(30000L, checkConnections); // Check connections every 30s
  
  Serial.println("=== Setup Complete ===");
  Serial.print("Backend URL: ");
  Serial.println(serverUrl);
}

// ================== LOOP ==================
void loop() {
  esp_task_wdt_reset(); // Feed watchdog every loop
  
  if (blynkConnected) {
    Blynk.run();
  }
  timer.run();
}
