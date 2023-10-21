const size_t BUTTON_COUNT = 8;
const uint8_t SWITCH_PINS[BUTTON_COUNT] = {40, 24, 26, 28, 36, 34, 32, 30};
const uint8_t LED_PINS[BUTTON_COUNT] = {41, 25, 27, 29, 37, 35, 33, 31};
static uint8_t PIN_STATES[BUTTON_COUNT] = {HIGH};

const char READY = 125;
const char TURN_ON = 126;
const char TURN_OFF = 127;

int indexAssignment = -1;
char incomingByte = -1;

void setup() {
  Serial.begin(9600);

  for (int i = 0; i < BUTTON_COUNT; i++) {
    pinMode(LED_PINS[i], OUTPUT);
    pinMode(SWITCH_PINS[i], INPUT_PULLUP);
  }

  Serial.write(READY);
}

void loop() {
  // Transmit pressed button.
  for (int i = 0; i < BUTTON_COUNT; i++) {
    uint8_t pinReading = digitalRead(SWITCH_PINS[i]);
    if (pinReading == LOW && PIN_STATES[i] != LOW) {
      Serial.write(i);
    }
    PIN_STATES[i] = pinReading;
  }

  if (Serial.available() > 0) {
    incomingByte = Serial.read();

    // Read index assignments.
    if (incomingByte < BUTTON_COUNT) {
      indexAssignment = incomingByte;
    }

    // Read light control signals.
    if (indexAssignment != -1) {
      if (incomingByte == TURN_ON) {
        digitalWrite(LED_PINS[indexAssignment], HIGH);
      } else if (incomingByte == TURN_OFF) {
        digitalWrite(LED_PINS[indexAssignment], LOW);
      }
    }
  }
}
